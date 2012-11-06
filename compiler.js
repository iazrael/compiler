#! /usr/local/bin/node

var COMPLIER_ROOT = __dirname;

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

	// console.log(config);
}

/**
 * 分析每条规则并创建任务
 */
var createTasks = function(){
	tasks = [];
	for(var r in config.rules){
		
	}
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






