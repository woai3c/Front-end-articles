# 用node搭建个人博客（一）：代码热更新
一般来说，web 项目都是分为前端和后端代码，放在不同的项目。

本项目为了开发方便，前后端代码都是放在同一项目，`src` 目录为前端代码，`server` 目录为后端代码。

这篇文章的目的是为了讲解怎么用 node 配合 webpack 让前端代码热更新。
## 依赖
* express
* webpack
* webpack-hot-middleware
* webpack-dev-middleware

需要用到两个 webpack 的中间件。

先来看一下代码示例。

`dev-server.js`
```js
const express = require('express')
const webpack = require('webpack')
const webpackConfig = require('../build/webpack.dev')
const compiler = webpack(webpackConfig)
const app = express()

app.use(require('webpack-hot-middleware')(compiler))
app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    stats: {
        colors: true
    }
}))
```
同时需要在 webpack 的入口文件加上这一行代码 `webpack-hot-middleware/client?reload=true`

`webpack.dev.js`
```js
const merge = require('webpack-merge')
const webpackBaseConfig = require('./webpack.base.js')

module.exports = merge(webpackBaseConfig, {
    mode: 'development',
    entry: {
        app: ['webpack-hot-middleware/client?reload=true' , './src/main.js'] // 开启热模块更新
    },
})
```
这样就可以通过 node 来开启前端代码热更新了。
