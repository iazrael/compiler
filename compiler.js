#!/usr/bin/env node

var COMPILER_ROOT = __dirname;

var COMPILER_TEMP = './compiler.temp/';

var CMD_ROOT = './cmds/';

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
	compileConfig = config;
	return config;
}

/**
 * 初始化 compiler 的cmds
 * 合并用户配置和自定义的 cmd
 */
var init = function(){
	var config = compileConfig;
	compileCmds = prepareSysCmds();
	// console.log(cmds);
	config = ztool.merge({}, DEFAULT_CONFIG, config);

	if(config.cmds){//合并命令
		compileCmds = ztool.merge({}, compileCmds, config.cmds);
		// 先展开简写的命令
		compileCmds = expandCmds(compileCmds);
		// console.log(JSON.stringify(compileCmds));
		// console.log(compileCmds);
	}
	config.cmds = compileCmds;
	config.sourceRoot = path.resolve(config.sourceRoot);
	config.targetRoot = path.resolve(config.targetRoot);
	// console.log(config.targetRoot);
	nf.rmdirsSync(config.targetRoot);
	nf.mkdirsSync(config.targetRoot);
	//创建个临时目录
	nf.rmdirsSync(COMPILER_TEMP);
	nf.mkdirsSync(COMPILER_TEMP);
	// console.log(config);
	return compileCmds;
}

var prepareSysCmds = function(){
	var cmds = {};
	var url = path.join(COMPILER_ROOT , CMD_ROOT);
	var list = fs.readdirSync(url);
	for(var i = 0, dir; dir = list[i]; i++) {
		if(fs.statSync(path.join(url, dir) ).isDirectory()){
			cmds[dir] = {
				'id': dir,
				'root': path.join(COMPILER_ROOT , 'cmds' , dir)
			}
		}
	}
	return cmds;
}

/**
 * 把简写的命令都展开
 * @param  {[type]} cmds [description]
 * @return {[type]}      [description]
 */
var expandCmds = function(cmds){
	for(var i in cmds){
		if(ztool.isObject(cmds[i])){
			continue;
		}
		// console.log(i);
		cmds[i] = explainCmd(cmds[i]);
		// console.log('============');
	}
	return cmds;
}

var explainCmd = function(cmd){
	var result = [], execCmd;
	var arr = cmd.replace(/\s+/g, '').split('|');
	// console.log(arr);
	for (var i = 0; i < arr.length; i++) {
		cmd = arr[i];
		if(!cmd){
			continue;
		}
		execCmd = compileCmds[cmd];
		if(!execCmd){
			if(cmd.indexOf(',') > -1){
				//处理并列命令
				var parallCmdArr = cmd.split(',');
				var parallArr = [];
				for (var j = 0; j < parallCmdArr.length; j++) {
					parallArr = parallArr.concat(explainCmd(parallCmdArr[j]));
				};
				result.push(parallArr);
			}else{
				throw 'the cmd "' + cmd + '" is not exists. ';
			}
		}else if(ztool.isString(execCmd)){
			// console.log('>>>>>>>>>>explainCmd ', execCmd);
			// findCmdObject(execCmd, result);
			result = result.concat(explainCmd(execCmd));
		}else if(ztool.isArray(execCmd)){
			result = result.concat(execCmd);
		}else{
			result.push(execCmd);
		}
	};
	return result;
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

var getCombineId = function(arr){
	var result = [];
	for (var i = 0; i < arr.length; i++) {
		result.push(arr[i].id);
	};
	return result.join('_');
}

/**
 * 分析每条规则并创建任务
 */
var createTasks = function(){
	var config = compileConfig;
	var tasks = [];
	var task, rule, cmd;
	for(var r in config.rules){
		rule = config.rules[r];
		var originSource = makePathArray(rule.source, config.sourceRoot),
			originTarget = path.join(config.targetRoot, rule.target);// makePathArray(rule.target, config.targetRoot);
		cmd = rule.cmd || config.defaultCmd;
		//处理用管道串起来的多个命令
		var execCmds = explainCmd(cmd);
		// console.log(execCmds);
		var len = execCmds.length;
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
		var source = originSource, target = originTarget;
		for(var i = 0; cmd = execCmds[i]; i++) {
			if(ztool.isArray(cmd)){//命令是数组的时候，说明是并行的命令，输入和输出都是同一个
				var taskParentId = getCombineId(cmd);
				if(i === len - 1){
			    	//最后一个命令, 指定其输出 target
					target = originTarget;
				}else{
					target = path.join(COMPILER_TEMP, taskParentId, path.sep);
				}
				for (var j = 0; j < cmd.length; j++) {
					task = {
				    	id: r + '.' + taskParentId + '.' + cmd[j].id,
				    	cmd: cmd[j],
				    	source: source,
				    	target: target
				    }
				    if(ztool.isArray(params[i])){
				    	task.params = params[i][j] || {};
				    }else{
				    	task.params = params[i] || {};
				    }
				    tasks.push(task);
				};
				//上一个命令的输出是下一个命令的输入
				source = [target];
			}else{
				task = {
			    	id: r + '.' + cmd.id,
			    	cmd: cmd,
			    	params: params[i] || {}
			    }
			    tasks.push(task);
			    if(i === len - 1){
			    	//最后一个命令, 指定其输出 target
					target = originTarget;
				}else{
					target = path.join(COMPILER_TEMP, task.id, path.sep);
				}
				task.source = source;
				task.target = target;
				//上一个命令的输出是下一个命令的输入
				source = [target];
			}
		}

	}
	compileTaskList = tasks;
	// console.dir(tasks);
	return tasks;
}
/**
 * 执行所有任务
 */
var execTasks = function(){
	// console.log(JSON.stringify(compileTaskList));
	// return;
	for(var i = 0, task, cmd; task = compileTaskList[i]; i++) {
    	// cmd = cmds[task.cmd];
    	cmd = task.cmd;
    	console.log('>>exec ' + task.id + '...');
    	var runOptions = {
    		compilerRoot: COMPILER_ROOT,
    		dirname: cmd.root,
    		filename: path.join(cmd.root, 'index.js')
    	};
    	require(cmd.root).execute(task, compileConfig, runOptions);
	}
}
/**
 * 执行完所有任务后的清理工作
 */
var clean = function(){
	nf.rmdirsSync(COMPILER_TEMP);
}

//************ 下面是主流程 ************************************
var compile = function(fileName){
	var start = new Date();
	readConfig(fileName);
	init();
	createTasks();
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







