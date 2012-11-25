config.json中的配置示例，详细介绍见[自动生成manifest](http://imatlas.com/posts/auto-generate-the-offline-app-manifest-file/)

	"manifest": {
		"cmd": "ioffline",
		"source": [
			"index.html",
			"main.html"
		],
		"target": "./",
		"params": {
		    "linkPrefix": "http://cdn.xxx.com/",
		    "manifestName": "offline.manifest",
		    "network": [  "*"  ],
		    "fallback": [
		        "/ fallback.html"
		    ]
		}
	}