config.json 的配置示例

	"concat_js": {
		"cmd": "concat",
		"source": [
			"js/jx/",
			"js/site/",
			"js/ace/ace.js",
			"js/ace/mode-javascript.js",
			"js/ace/theme-tumblr.js"
		],
		"target": "js/all.js",
		"params": {
			"fileFormat": "js,css",//要合并的文件类型
		}
	}