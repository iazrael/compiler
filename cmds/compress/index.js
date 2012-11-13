var fs = require('fs'),
	path = require('path'),
	exec = require('child_process').exec
	;
var nf = require('node-file');

var lib = 'lib';
var ROOT;

var compressJs = function(src, target){
	//TODO 这里是异步的,看看怎么处理好
	// var child = exec('cat *.js bad_file | wc -l',
 //  	function (error, stdout, stderr) {
 //    	console.log('stdout: ' + stdout);
 //    	console.log('stderr: ' + stderr);
 //    	if (error !== null) {
 //      		console.log('exec error: ' + error);
 //    	}	
	// });
	// ${lib}/compiler.jar" fork="true">
 //            <arg line="--charset ${charset} --js='${temp2}/${fileName}' --js_output_file='${temp}/${fileName}'
}

var compressCss = function((src, target)){
	
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
				
			};
		}else{
			compress(src, task.target);
		}
	}
}