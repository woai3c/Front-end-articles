# Vue Cli 3 打包配置--自动忽略 console.log 语句
下载插件
```js
npm i -D uglifyjs-webpack-plugin
```
在 vue.config.js 引入使用
```js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
    configureWebpack: {
        plugins: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: {
                        drop_console: true,
                    },
                },
            }),
        ],
    },
    devServer: {
        proxy: {
            '/xxx': {
                target: 'http://192.168.150.17:8080/',
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/xxx': 'xxx',
                },
            },
        },
    },
    publicPath: './',
}
```
这时执行 `npm run build` 打包后的文件就没有 `console.log` 语句了。

不过这时会有一个问题，就是在开发环境的时候编译会非常慢。例如修改了一个变量的值，我的电脑要编译 10 秒才能重新刷出来页面，一直卡在 `92% chunk asset optimization`。

由于去掉 `console.log` 语句这个功能只有在打包时才需要，所以我们可以加一个判断，只在生产环境时才把上述配置代码加上。

所以正确的配置如下：
```js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const config = {
    devServer: {
        proxy: {
            '/xxx': {
                target: 'http://192.168.150.17:8080/',
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/xxx': 'xxx',
                },
            },
        },
    },
    publicPath: './',
}

if (process.env.NODE_ENV === 'production') {
    config.configureWebpack = {
        plugins: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: {
                        drop_console: true,
                    },
                },
            }),
        ],
    }
}

module.exports = config
```

## 参考资料
* [uglifyjs-webpack-plugin](https://github.com/webpack-contrib/uglifyjs-webpack-plugin)
