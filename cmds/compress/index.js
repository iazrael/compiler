var fs = require('fs'),
	path = require('path'),
	uglifyJS = require("uglify-js2"),
	cleanCSS = require('clean-css')
	;
var nf = require('node-file');

var options, ztool;

var compressJs = function(src, target){
	var result = uglifyJS.minify(src);
	
	nf.writeFileSync(target, result.code);
}	

var compressCss = function(src, target){
	var file = fs.readFileSync(src);
	var content = file.toString();
	var result = cleanCSS.process(content);
	nf.writeFileSync(target, result);
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


exports.execute = function(task, config, runOptions){
	var src, files, target;
	options = runOptions;
	ztool = runOptions.ztool;
	var params = task.params || {};
	for (var i = 0; i < task.source.length; i++) {
		src = task.source[i].trim();
		if(!src){
			continue;
		}
		//
		if(fs.statSync(src).isDirectory()){
			var type = 'js,css';
			if(params.fileFormat){
				type = params.fileFormat;
			} 
			// console.log(type);
			var recursive = task.params.recursive;
			recursive = typeof recursive === 'undefined' ? true : recursive;
			files = nf.listFilesSync(src, type, recursive);
			// console.log(src);
			// console.log(files);
			for (var j = 0, source; j < files.length; j++) {
				source = path.join(src, files[j]);
				target = path.join(task.target, files[j]);
				if(ztool.endsWith(target, path.sep)){
					target = path.join(target, path.basename(src));
				}
				compress(source, target);
				
			}
		}else{
			target = task.target;
			if(ztool.endsWith(target, path.sep)){
				target = path.join(target, path.basename(src));
			}
			compress(src, target);
		}
	}
}
