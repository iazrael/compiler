var fs = require('fs'),
	path = require('path')
	;
var nf = require('node-file');


exports.execute = function(task, config){
	var src, files;
	for (var i = 0; i < task.source.length; i++) {
		src = task.source[i].trim();
		if(!src){
			continue;
		}
		if(fs.statSync(src).isFile()){
			nf.copyFileSync(src, task.target, true);
		}else{
			var type = false;
			if(config.fileFormat){
				type = config.fileFormat.join(',');
				// type = 'css';
			} 
			files = nf.listFilesSync(src, type, true);
			// console.log(src);
			// console.log(files);
			for (var j = 0, target, source; j < files.length; j++) {
				target = path.join(task.target, files[j]);
				source = path.join(src, files[j]);
				// console.log('>>', source, target);
				nf.copyFileSync(source, target, true);
			};
		}
	}
	
}