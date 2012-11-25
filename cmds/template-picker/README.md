config.json中的配置示例，详细说明见[template-picker](https://github.com/iazrael/template-picker)

	"pickup_template": {
		"cmd": "template-picker",
		"source": [//需要抽取模板代码的页面
			"index.html",
			"main.html"
		],
		"target": "./",//抽取后的页面的输入位置
		"params": {
			//容纳模板代码的js文件
			"templateOutput": "output.js",
			//模板代码在 templateOutput 中的占位符
			"templatePlaceholder": "/*%HtmlTemplateFunctions%*/",
			//指定是否把模板代码里的连续空格或TAB压缩成一个空格
			//可能有些地方的空格会意外的被压缩掉，默认 false
			"compressWhitespace": false
		}
	}