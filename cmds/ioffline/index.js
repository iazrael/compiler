var fs = require('fs'),
	path = require('path')
	;
var ioffline = require('ioffline');


exports.execute = function(task, config){

	var params = task.params;
	if(!params.manifestName){
		throw 'manifestName must be specified!';
	}
	var names = params.manifestName.split('.');
	var name;
	if(names.length > 1){
		params.manifestSuffix = names.pop();
		name = names.join('.');
	}else{
		name = params.manifestName
	}
	params.cache = {};
	params.cache[name] = task.source;
	params.outputRoot = task.target;

	// console.log(params);
	ioffline.generate(params);

}