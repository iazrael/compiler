
抽取写在html上的模板代码并转换成js代码

配置说明：
config.json
	{
		//需要抽取模板的文件，如果是一个可以直接写成字符串
		//如果是多个，要写成数组，如：["index.html", "index2.html"]
		"source": "index.html",
		//抽取后的文件的输出目录，默认输出到 ./
		"target": "./out/",
		//容纳模板代码的js文件
		"templateOutput": "output.js",
		//模板代码在 templateOutput 中的占位符
		"templatePlaceholder": "/*%HtmlTemplateFunctions%*/",
		//指定是否把模板代码里的连续空格或TAB压缩成一个空格
		//可能有些地方的空格会意外的被压缩掉，默认 false
		"compressWhitespace": false
	}