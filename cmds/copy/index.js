var fs = require('fs'),
	path = require('path')
	;
var nf = require('node-file');


exports.execute = function(task, config, runOptions){
	var src, files, target, source;
	var sourceRoot = path.normalize(config.sourceRoot);
	var params = task.params;
	var keepHierarchy = typeof params.keepHierarchy === 'undefined' ? true : params.keepHierarchy;
	var type = params.fileFormat || config.fileFormat || false;
	var recursive = typeof params.recursive === 'undefined' ? true : params.recursive;
	for (var i = 0; i < task.source.length; i++) {
		src = task.source[i].trim();
		if(!src){
			continue;
		}
		if(fs.statSync(src).isFile()){
			target = task.target;
			if(nf.isDirectoryPath(target)){
				if(keepHierarchy){
					target = path.join(target, src.replace(sourceRoot, ''));
				}
			}
			nf.copyFileSync(src, target, true);
		}else{
			files = nf.listFilesSync(src, type, recursive);
			// console.log(src);
			// console.log(files);
			for (var j = 0; j < files.length; j++) {
				source = path.join(src, files[j]);
				if(keepHierarchy){
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