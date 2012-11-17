var fs = require('fs'),
	path = require('path')
	;
var ispriter = require('ispriter');

exports.execute = function(task, config){
	var src;
	var params = task.params || {};
	params.input = params.input || {};
	params.output = params.output || {};
	for (var i = 0; i < task.source.length; i++) {
		src = task.source[i].trim();
		if(!src){
			continue;
		}
		params.input.cssRoot = src;
		params.output.cssRoot = task.target;
		ispriter.merge(params);
	}
	
}