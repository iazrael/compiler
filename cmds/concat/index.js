var fs = require('fs'),
	path = require('path')
	;
var nf = require('node-file');

exports.execute = function(task, config, runOptions){
	var ztool = runOptions.ztool;
	var src, files, content = '', suffix;
	for (var i = 0; i < task.source.length; i++) {
		src = task.source[i].trim();
		if(!src){
			continue;
		}
		
		if(fs.statSync(src).isDirectory()){
			var type = task.params.fileFormat || config.fileFormat || false;
			files = nf.listFilesSync(src, type, true);
			// console.log(src);
			// console.log(files);
			for (var j = 0, source; j < files.length; j++) {
				source = path.join(src, files[j]);
				suffix = path.extname(files[j]);
				content += fs.readFileSync(source).toString();
			};
		}else{
			suffix = path.extname(src);
			content += fs.readFileSync(src).toString();
		}
	}
	var target = task.target;
	if(ztool.endsWith(target, path.sep)){
		target = path.join(target, task.id + (suffix || '.tmp'));
		// target = path.join(target, task.id + '.tmp');
	}
	nf.writeFileSync(target, content);
	// return target;
}