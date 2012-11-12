var fs = require('fs');
var nf = require('node-file');


exports.execute = function(task, config){
	var s, files;
	for (var i = 0; i < task.source.length; i++) {
		s = task.source[i].trim();
		if(!s){
			continue;
		}
		if(fs.statSync(s).isFile()){
			nf.copyFileSync(s, task.target, true)
		}else{
			var type = false;
			if(config.fileFormat){
				type = config.fileFormat.join(',');
				// type = 'css';
			} 
			files = nf.listFilesSync(s, type, true);
			for (var j = 0; j < files.length; j++) {
				nf.copyFileSync(files[j], task.target, true);
			};
		}
	}
	
}