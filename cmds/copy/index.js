var fs = require('fs'),
	path = require('path')
	;
var nf = require('node-file');


var readyToCopyFiles;
var nextExecuteTask;

var executeCopyTask = function(){
	// console.log(readyToCopyFiles);
	var fileCount = readyToCopyFiles.length;
	var onCopyFinish = function(){
		fileCount--;
		if(fileCount <= 0){
			nextExecuteTask && nextExecuteTask();
		}
	}
	for(var i = 0, item; item = readyToCopyFiles[i]; i++) {
	    nf.copyFile(item[0], item[1], true, onCopyFinish);
	}
}

//指示该命令是异步执行的, 命令结束后会自动调用 nextTask
exports.async = true;

exports.execute = function(task, config, runOptions, nextTask){
	nextExecuteTask = nextTask;
	readyToCopyFiles = [];
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
		// console.log(src);
		if(fs.statSync(src).isFile()){
			target = task.target;
			if(nf.isDirectoryPath(target)){
				if(keepHierarchy){
					target = path.join(target, src.replace(sourceRoot, ''));
				}
			}
			readyToCopyFiles.push([src, target]);
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
				readyToCopyFiles.push([source, target]);
			};
		}
	}

	executeCopyTask();
	
}