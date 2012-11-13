var fs = require('fs'),
	path = require('path')
	;
var nf = require('node-file');

var compressJs = function(src, target){
	
}

var compressCss = function((src, target)){
	
}

var compress = function(src, target){
	var ext = path.extname(src);
	if(ext === '.js'){
		compressJs(src, target);
	}else if(ext === '.css'){
		compressCss(src, target);
	}
}


exports.execute = function(task, config){
	var src, files;
	
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