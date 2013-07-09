config.json中的配置示例，详细介绍见[自动生成manifest](http://imatlas.com/posts/auto-generate-the-offline-app-manifest-file/)

注意：需手动安装ioffline (npm install ioffline)

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