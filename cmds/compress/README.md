config.json 的配置示例

	"compress_js": {
		"cmd": "compress",
		"source": [
			"js/core/"
			"js/main.js"
		],
		"target": "./",//target如果是目录，必须加上 “/”
		"params":{//params是可选的
			//当source包含有目录时，compress会压缩目录下的所有css和js
			//如果只想限定成一种，可以设置这个参数
			"fileFormat": "js"
		}
	}