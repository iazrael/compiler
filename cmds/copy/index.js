var fs = require('fs'),
	path = require('path')
	;
var nf = require('node-file');


exports.execute = function(task, config, runOptions){
	var src, files;
	var sourceRoot = path.normalize(config.sourceRoot);
	var ztool = runOptions.ztool;
	for (var i = 0; i < task.source.length; i++) {
		src = task.source[i].trim();
		if(!src){
			continue;
		}
		if(fs.statSync(src).isFile()){
			nf.copyFileSync(src, task.target, true);
		}else{
			var type = task.params.fileFormat || config.fileFormat || false;
			var recursive = task.params.recursive;
			recursive = typeof recursive === 'undefined' ? true : recursive;
			files = nf.listFilesSync(src, type, recursive);
			// console.log(src);
			// console.log(files);
			for (var j = 0, target, source; j < files.length; j++) {
				source = path.join(src, files[j]);
				if(ztool.endsWith(src, path.sep)){
					console.log('>>', task.target, ' ==> ' ,src.replace(sourceRoot, ''), ' ==> ' ,files[j]);
					target = path.join(task.target, src.replace(sourceRoot, ''), files[j]);
				}else{
					target = path.join(task.target, files[j]);
				}
				// console.log('>>', source, ' ==> ' , target);
				nf.copyFileSync(source, target, true);
			};
		}
	}
	
}