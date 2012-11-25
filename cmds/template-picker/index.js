var fs = require('fs'),
	path = require('path')
	;

var picker = require('template-picker');


exports.execute = function(task, config){
	
	var params = task.params;
	params.source = task.source;
	params.target = task.target;
	// console.log(params);
	picker.exec(params);
	
}