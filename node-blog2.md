# 用 node 搭建个人博客（二）：导出模块同时兼容 import 和 require
一般在项目里使用 es6 的 `export` 语法导出模块，引入只能用 es6 的 `import`，因为使用 `require` 会报错。

如果要同时兼容 `require` 和 `import`，则需要使用 `module.exports` 导出模块。

`test.js`
```js
function test {}

module.exports = {
    test
}
```
如上代码所示，我可以同时使用 `require` 和 `import` 来导入 `test` 函数
```js
import { test } from './test'

// or
const { test } = require('./test')
```
## 项目相关文档
* [多个请求下 loading 的展示与关闭](https://github.com/woai3c/Front-end-articles/blob/master/control%20loading.md)
* [Vue 实现前进刷新，后退不刷新的效果](https://github.com/woai3c/Front-end-articles/blob/master/vue%20refresh.md)
* [Vue 页面权限控制和登陆验证](https://github.com/woai3c/Front-end-articles/blob/master/authentication.md)
* [用 node 搭建个人博客（一）：代码热更新](https://github.com/woai3c/Front-end-articles/blob/master/node-blog1.md)
* [用 node 搭建个人博客（三）：token](https://github.com/woai3c/Front-end-articles/blob/master/node-blog3.md)
* [用 node 搭建个人博客（四）：评论功能](https://github.com/woai3c/Front-end-articles/blob/master/node-blog4.md)
* [用 node 搭建个人博客（五）：数据库](https://github.com/woai3c/Front-end-articles/blob/master/node-blog5.md)
