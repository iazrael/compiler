var fs = require('fs'),
	path = require('path'),
	uglifyJS = require("uglify-js2"),
	cleanCSS = require('clean-css')
	;
var nf = require('node-file');


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
	var sourceRoot = path.normalize(config.sourceRoot);
	var params = task.params || {};
	var keepHierarchy = typeof params.keepHierarchy === 'undefined' ? true : params.keepHierarchy;
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
				// target = path.join(task.target, files[j]);
				target = task.target;
				if(nf.isDirectoryPath(target)){
					if(keepHierarchy){
						target = path.join(task.target, src.replace(sourceRoot, ''), files[j]);
					}else{
						target = path.join(task.target, files[j]);
					}
				}
				// console.log(files[j], target);
				compress(source, target);
				
			}
		}else{
			target = task.target;
			// console.log(target);
			if(nf.isDirectoryPath(target)){
				if(keepHierarchy){
					target = path.join(target, src.replace(sourceRoot, ''));
				}
			}
			compress(src, target);
		}
	}
}
