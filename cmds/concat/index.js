var fs = require('fs'),
	path = require('path')
	;
var nf = require('node-file');

exports.execute = function(task, config){
	var src, files, content = '';
	
	for (var i = 0; i < task.source.length; i++) {
		src = task.source[i].trim();
		if(!src){
			continue;
		}
		
		if(fs.statSync(src).isDirectory()){
			var type = false;
			if(config.fileFormat){
				type = config.fileFormat.join(',');
				// type = 'css';
			} 
			files = nf.listFilesSync(src, type, true);
			// console.log(src);
			// console.log(files);
			for (var j = 0, source; j < files.length; j++) {
				source = path.join(src, files[j]);
				content += fs.readFileSync(source).toString();
			};
		}else{
			content += fs.readFileSync(src).toString();
		}
	}
	nf.writeFileSync(task.target, content);
}