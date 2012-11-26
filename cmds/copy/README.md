config.json中的配置示例

	"copy_js": {
		"cmd": "copy",
		"source": [
			"js/core/",
			"js/main.js"
		],
		"target": "./",//target如果是目录，必须加上 “/”
		"params": {
			"fileFormat": "js,css",//要拷贝的文件类型
			"recursive": true//如果source 有目录, 指定是否递归该目录, 为false则只拷贝直接子文件
		}
	}