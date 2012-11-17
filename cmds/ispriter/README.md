config.json中的配置示例, 详细说明见 [ispriter](https://github.com/iazrael/ispriter)

	"ispriter": {
		"cmd": "ispriter",
		"source": "style/",
		"target": "style/",
		"params": {//params的参数都是可选
			"algorithm": "growingpacker",//optional 目前只有 growingpacker
		    "input": {
		        "imageRoot": "",//optional 默认 cssRoot
		        "format": "png"//optional
		    },
		    "output": {
		        "imageRoot": "../sprite/",//optional 相对于 cssRoot 的路径, 默认 "./image/", 最终会变成合并后的的图片路径写在css文件中
		        "maxSize": 60,//optional 图片容量的最大大小, 单位 KB, 默认 0
		        "margin": 5,//optional 合成之后, 图片间的空隙, 默认 0
		        "prefix": "sprite_",//optional 
		        "format": "png"//optional 输出的图片格式
		    }
		}
	}

	"ispriter": {
		"cmd": "ispriter",
		"source": "style/",
		"target": "style/",
		"params": {//params的参数都是可选
		        "imageRoot": "images/"
		    },
		    "output": {
		        "imageRoot": "../sprite/",
		        "maxSize": 60
		    }
		}
	}