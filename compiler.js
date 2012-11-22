#!/usr/bin/env node

var COMPILER_ROOT = __dirname;

var COMPILER_TEMP = './compiler.temp';

var DEFAULT_CONFIG = {
	"sourceRoot": "./",
	"targetRoot": "./build",
	"fileFormat": "js,css,html,htm,png,gif,jpg,jpeg",
	"defaultCmd": "copy"
};

var path = require('path'),
	fs = require('fs'),
	nf = require('node-file');

var ztool = require(COMPILER_ROOT + '/ztool.js');

var compileConfig, compileCmds, compileTaskList;

/**
 * 读取用户配置并进行预处理
 * 
 */
var readConfig = function(fileName){
	var config;
	
	if(!fileName){
		throw 'config file must be specified';
	}else if(!fs.existsSync(fileName)){
		throw 'the config file "' + fileName + '" is not exists';
	}

	var content = fs.readFileSync(fileName);
	try{
		config = ztool.jsonParse(content);
	}catch(e){
		throw 'the config file is not a json file';
	}

	if(!config.rules){
		throw 'there is no rule in this config file';
	}

	return config;
}

/**
 * 初始化 compiler 的cmds
 * 合并用户配置和自定义的 cmd
 */
var init = function(){
	var config = compileConfig;
	var cmds = {};
	var list = fs.readdirSync(COMPILER_ROOT + '/cmds');
	for(var i = 0, item; item = list[i]; i++) {
		cmds[item] = {
			"root": path.join(COMPILER_ROOT , 'cmds' , item)
		}
	}
	// console.log(cmds);
	config = ztool.merge({}, DEFAULT_CONFIG, config);

	if(config.cmds){//合并命令
		cmds = ztool.merge({}, cmds, config.cmds);
		//TODO 先展开简写的命令
	}
	config.cmds = cmds;
	config.sourceRoot = path.resolve(config.sourceRoot);
	config.targetRoot = path.resolve(config.targetRoot);
	// console.log(config.targetRoot);
	nf.rmdirsSync(config.targetRoot);
	nf.mkdirsSync(config.targetRoot);
	//创建个临时目录
	nf.rmdirsSync(COMPILER_TEMP);
	nf.mkdirsSync(COMPILER_TEMP);
	// console.log(config);
	return cmds;
}

var makePathArray = function(arr, root){
	if(!ztool.isArray(arr)){
		arr = [arr];
	}
	for (var i = 0; i < arr.length; i++) {
		arr[i] = path.join(root, arr[i]);
	};
	return arr;
}

var expandCmd = function(cmd){
	if(!ztool.isString(compileCmds[cmd])){
		return cmd;
	}
	cmd = compileCmds[cmd];
	var cmdArr = cmd.split('|');
	if(cmdArr.length > 1){
		for(var i = 0; i < cmdArr.length; i++){
			cmdArr[i] = expandCmd(cmdArr[i]);
		}
	}
	return cmd;
}

var analyseCmd = function(cmd){
	var result = [];
	//先把嵌套的命令都展开
	cmd = expandCmd(cmd);
	var cmdArr = cmd.replace(/\s+/g, '').split('|');
	var pcmdArr, pcmd, tcmd;
	for(var i = 0; i < cmdArr.length; i++){
		pcmdArr = cmdArr[i].split(',');
		for (var j = 0; j < pcmdArr.length; j++) {
			pcmd = pcmdArr[j];
			tcmd = compileCmds[pcmd];
			if(!tcmd){
				throw 'the cmd "' + pcmd + '" is not exists. ';
			}
			//TODO
			if(ztool.isString(tcmd)){
				result = result.concat(analyseCmd(tcmd));
			}
		};
		result.push(pcmd);

		
	}
	return result;
}

/**
 * 分析每条规则并创建任务
 */
var createTasks = function(){
	var config = compileConfig;
	var cmds = compileCmds;
	var tasks = [];
	var task, rule, cmd;
	for(var r in config.rules){
		rule = config.rules[r];
		var source = makePathArray(rule.source, config.sourceRoot),
			target = path.join(config.targetRoot, rule.target);// makePathArray(rule.target, config.targetRoot);
		//处理用管道串起来的多个命令
		cmd = rule.cmd || config.defaultCmd;
		var rCmds = analyseCmd(cmd);
		// console.log(rCmds);
		var len = rCmds.length;
		var params = rule.params || {};
		if(!len){
			throw 'this rule " ' + r + '" don\'t have cmd . ';
		}
		//多个命令串联,单个命令也当成多个处理
		if(!ztool.isArray(params)){
			//如果传入的params 参数不是数组, 且命令不止一个
			//就把params 都传入到所有命令
			var arr = [];
			for (var i = 0; i < len; i++) {
				arr.push(params);
			}
			params = arr;
		}
		var src = source, tar = target;
		for(var i = 0; cmd = rCmds[i]; i++) {
		    task = {
		    	id: r + '.' + cmd,
		    	cmd: cmd,
		    	params: params[i] || {}
		    }
		    tasks.push(task);
		    if(i === len - 1){
		    	//最后一个命令, 指定其输出 target
				tar = target;
			}else{
				tar = path.join(COMPILER_TEMP, task.id, path.sep);
			}
			task.source = src;
			task.target = tar;
			//上一个命令的输出是下一个命令的输入
			src = [tar];
		}

	}
	// console.dir(tasks);
	return tasks;
}
/**
 * 执行所有任务
 */
var execTasks = function(){
	var config = compileConfig, 
		cmds = compileCmds, 
		tasks = compileTaskList;
	// console.log(JSON.stringify(tasks));
	// return;
	for(var i = 0, task, cmd; task = tasks[i]; i++) {
    	cmd = cmds[task.cmd];
    	console.log('>>exec ' + task.id + '...');
    	var runOptions = {
    		compilerRoot: COMPILER_ROOT,
    		dirname: cmd.root,
    		filename: path.join(cmd.root, 'index.js')
    	};
    	require(cmd.root).execute(task, config, runOptions);
	}
}
/**
 * 执行完所有任务后的清理工作
 */
var clean = function(){
	// nf.rmdirsSync(COMPILER_TEMP);
}

//************ 下面是主流程 ************************************
var compile = function(fileName){
	var start = new Date();
	compileConfig = readConfig(fileName);
	compileCmds = init();
	compileTaskList = createTasks();
	execTasks();
	clean();
	console.log('time consume:' + (new Date() - start) + 'ms.');
}

if(process.argv.length < 2){
	//非命令行启动，而是 js 的require
	exports.compile = compile;
}else{
	compile(process.argv[2]);
}







