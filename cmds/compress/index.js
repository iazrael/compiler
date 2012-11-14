var fs = require('fs'),
	path = require('path'),
	exec = require('child_process').exec
	;
var nf = require('node-file');

var LIB = 'lib';
var ROOT;

var compressJs = function(src, target){
	//TODO 这里是异步的,看看怎么处理好
	var cmd = "java -jar " + path.join(ROOT, LIB, 'compiler.jar') 
		+ " --charset utf-8" 
		+ " --js='" + src + "'"
		+ " --js_output_file='" + target + "'"
		;
	console.log(cmd);
	var child = exec(cmd);
	for (var i = 0; i < 200; i++) {
		console.log('log-',i);
	}
}	

var compressCss = function(src, target){
	
}

var compress = function(src, target){
	var ext = path.extname(src);
	if(ext === '.js'){
		compressJs(src, target);
	}else if(ext === '.css'){
		compressCss(src, target);
	}else{
		throw 'compress not support ' + ext;
	}
}


exports.execute = function(task, config, selfRoot){
	var src, files;
	ROOT = selfRoot;
	for (var i = 0; i < task.source.length; i++) {
		src = task.source[i].trim();
		if(!src){
			continue;
		}
		//
		if(fs.statSync(src).isDirectory()){
			var type = false;
			if(config.fileFormat){
				type = config.fileFormat.join(',');
				// type = 'css';
			} 
			files = nf.listFilesSync(src, type, true);
			// console.log(src);
			// console.log(files);
			for (var j = 0, source, target; j < files.length; j++) {
				source = path.join(src, files[j]);
				target = path.join(task.target, files[j]);
				compress(source, target);
				
			}
		}else{
			compress(src, task.target);
		}
	}
}
