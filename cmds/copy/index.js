var fs = require('fs'),
	path = require('path')
	;
var nf = require('node-file');


exports.execute = function(task, config, runOptions){
	var src, files, target, source;
	var sourceRoot = path.normalize(config.sourceRoot);
	for (var i = 0; i < task.source.length; i++) {
		src = task.source[i].trim();
		if(!src){
			continue;
		}
		if(fs.statSync(src).isFile()){
			target = task.target;
			if(nf.isDirectoryPath(target)){
				target = path.join(target, src.replace(sourceRoot, ''));
			}
			nf.copyFileSync(src, target, true);
		}else{
			var type = task.params.fileFormat || config.fileFormat || false;
			var recursive = task.params.recursive;
			recursive = typeof recursive === 'undefined' ? true : recursive;
			files = nf.listFilesSync(src, type, recursive);
			// console.log(src);
			// console.log(files);
			for (var j = 0; j < files.length; j++) {
				source = path.join(src, files[j]);
				target = path.join(task.target, src.replace(sourceRoot, ''), files[j]);
				// if(ztool.endsWith(src, path.sep)){
					// console.log('>>', task.target, ' ==> ' ,src.replace(sourceRoot, ''), ' ==> ' ,files[j]);
					// target = path.join(task.target, src.replace(sourceRoot, ''), files[j]);
				// }else{
					// target = path.join(task.target, files[j]);
					// console.log('>>', source, ' ==> ' , target);
				// }
				// console.log('>>', source, ' ==> ' , target);
				nf.copyFileSync(source, target, true);
			};
		}
	}
	
}