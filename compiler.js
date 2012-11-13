#! /usr/local/bin/node

var COMPLIER_ROOT = __dirname;

var COMPLIER_TEMP = './compiler.temp';

var DEFAULT_CONFIG = {
	"sourceRoot": "./",
	"targetRoot": "./build",
	"fileFormat": "js,css,html,htm,png,gif,jpg,jpeg",
	"defaultCmd": "copy"
};

var path = require('path'),
	fs = require('fs');

var ztool = require(COMPLIER_ROOT + '/ztool.js');
var nf = require('node-file');

/**
 * 读取用户配置并进行预处理
 * 
 */
var readConfig = function(){
	var config;
	var fileName = process.argv[2];
	if(!fileName){
		throw 'config file must be specified';
	}else if(!fs.existsSync(fileName)){
		throw 'the config file "' + fileName + '" is not exists';
	}

	var content = fs.readFileSync(fileName);
	try{
		config = ztool.friendlyJsonParse(content);
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
var init = function(config){
	var cmds = {};
	var list = fs.readdirSync(COMPLIER_ROOT + '/cmds');
	for(var i = 0, item; item = list[i]; i++) {
		cmds[item] = {
			"root": path.join(COMPLIER_ROOT , 'cmds' , item)
		}
	}
	// console.log(cmds);
	for(var d in DEFAULT_CONFIG){
		if(!config[d]){
			config[d] = DEFAULT_CONFIG[d];
		}
		if(d === 'fileFormat'){
			var format = config[d].replace(/\s+/g, '');
			config[d] = format.split(',');
		}
	}
	if(config.cmds){//合并命令
		for(var m in config.cmds){
			cmds[m] = config.cmds[m];
		}
	}
	config.cmds = cmds;
	config.sourceRoot = path.resolve(config.sourceRoot);
	config.targetRoot = path.resolve(config.targetRoot);
	// console.log(config.targetRoot);
	nf.rmdirsSync(config.targetRoot);
	nf.mkdirsSync(config.targetRoot);
	//创建个临时目录
	nf.rmdirsSync(COMPLIER_TEMP)
	nf.mkdirsSync(COMPLIER_TEMP);
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

var analyseCmd = function(cmds, cmd){
	var result = [];
	var arr = cmd.replace(/\s+/g, '').split('|');
	for(var i = 0; i < arr.length; i++){
		cmd = arr[i];
		if(!cmds[cmd]){
			throw 'the cmd "' + cmd + '" is not exists. ';
		}
		if(ztool.isString(cmds[cmd])){
			result = result.concat(analyseCmd(cmds[cmd]))
		}else{
			result.push(cmd);
		}
	}
	return result;
}

/**
 * 分析每条规则并创建任务
 */
var createTasks = function(config, cmds){
	var tasks = [];
	var task, rule, cmd;
	for(var r in config.rules){
		rule = config.rules[r];
		var source = makePathArray(rule.source, config.sourceRoot),
			target = path.join(config.targetRoot, rule.target);// makePathArray(rule.target, config.targetRoot);
		//处理用管道串起来的多个命令
		cmd = rule.cmd || config.defaultCmd;
		var rCmds = analyseCmd(cmds, cmd);
		// console.log(rCmds);
		var len = rCmds.length;
		var params = rule.params || {};
		if(!ztool.isArray(params) && len > 1){
			//如果传入的params 参数不是数组, 且命令不止一个
			//就把params 都传入到所有命令
			var arr = [];
			for (var i = 0; i < len; i++) {
				arr.push(params);
			}
			params = arr;
		}
		task = {
			id: r,
			params: params,
			source: source,
			target: target
		};
		tasks.push(task);
		// console.log('rule:', rule);
		if(len === 1){
			cmd = rCmds[0];
			if(!cmds[cmd]){
		    	throw 'the cmd "' + cmd + '" is not exists. ' + r;
		    }
		    task.id = r + '.' + cmd;
			task.cmd = cmd;
			continue;
		}
		task.subs = [];
		for(var i = 0, sub; cmd = rCmds[i]; i++) {
		    sub = {
		    	id: task.id + '.' + cmd,
		    	params: params[i]
		    }
		    task.subs.push(sub);
		    if(i === len - 1){
		    	//最后一个命令, 指定其输出 target
				target = task.target;
			}else{
				target = path.join(COMPLIER_TEMP, sub.id);
			}
			sub.source = source;
			sub.target = target;
			//上一个命令的输出是下一个命令的输入
			source = target;
		}
	}
	// console.dir(tasks);
	return tasks;
}
/**
 * 执行所有任务
 */
var execTasks = function(config, cmds, tasks){
	// console.log(cmds);
	for(var i = 0, task, cmd; task = tasks[i]; i++) {
	    if(task.subs){
	    	//多个子任务
	    }else{
	    	cmd = cmds[task.cmd];
	    	console.log('executing ' + task.id + '...');
	    	require(cmd.root).execute(task, config, cmd.root);
	    }
	}
}
/**
 * 执行完所有任务后的清理工作
 */
var clean = function(){
	
}

//************ 下面是主流程 ************************************
var compile = function(){
	var config = readConfig();
	var cmds = init(config);
	var tasks = createTasks(config, cmds);
	execTasks(config, cmds, tasks);
	clean();
}
compile();






