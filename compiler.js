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

var config, cmds, tasks;

/**
 * 读取用户配置并进行预处理
 * 
 */
var readConfig = function(){
	var fileName = process.argv[2];
	if(!fileName){
		throw 'config file must be specified';
	}else if(!fs.existsSync(fileName)){
		throw 'the config file "' + fileName + '" is not exists';
	}

	var content = fs.readFileSync(fileName);
	try{
		config = JSON.parse(content);
	}catch(e){
		throw 'the config file is not a json file';
	}

	if(!config.rules){
		throw 'there is no rule in this config file';
	}
}

/**
 * 初始化 compiler 的cmds
 * 合并用户配置和自定义的 cmd
 */
var init = function(){
	cmds = {};
	var list = fs.readdirSync(COMPLIER_ROOT + '/cmds');
	for(var i = 0, item; item = list[i]; i++) {
		cmds[item] = {
			"root": COMPLIER_ROOT + '/cmds/' + item
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
	//创建个临时目录
	ztool.mkdirsSync(COMPLIER_TEMP);
	// console.log(config);
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

/**
 * 分析每条规则并创建任务
 */
var createTasks = function(){
	tasks = [];
	var task, rule;
	for(var r in config.rules){
		rule = config.rules[r];
		var source = makePathArray(rule.source, config.sourceRoot),
			target = path.join(config.targetRoot, rule.target);// makePathArray(rule.target, config.targetRoot);
		//处理用管道串起来的多个命令
		var rCmds = (rule.cmd || config.defaultCmd).replace(/\s+/g, '').split('|');
		var len = rCmds.length;
		var params = rule.params;
		if(!ztool.isArray(params) && len > 1){
			//如果传入的params 参数不是数组, 且命令不止一个
			//就把params 都传入到所有命令
			var arr = [];
			for (var i = 0; i < len; i++) {
				arr.push(params);
			}
			params = arr;
		}
		// var prevTarget;
		for(var i = 0, cmd; cmd = rCmds[i]; i++) {
		    if(!cmds[cmd]){
		    	throw 'the cmd "' + cmd + '" is not exists. ' + r;
		    }
		    task = {
				id: r + '.' + cmd,
				cmd: cmd,
				params: params[i]
			};
			tasks.push(task);
			if(len === 1){//只有一个命令的情况
				task.source = source;
				task.target = target;
				break;
			}
			//TODO
			// if(i === 0){//第一个命令,指定源
			// 	task.source = source;
			// 	task.target = COMPLIER_TEMP + '/' + task.id;
			// }
			// if(i === len - 1){
			// 	//最后一个命令, 指定其输出 target
			// 	task.target = target;
			// }
		}
	}
	console.log(tasks);
}
/**
 * 执行所有任务
 */
var execTasks = function(){
	
}
/**
 * 执行完所有任务后的清理工作
 */
var clean = function(){
	
}

//************ 下面是主流程 ************************************
var compile = function(){

	readConfig(), init(), createTasks(), execTasks(), clean();
}
compile();






