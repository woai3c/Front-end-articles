# 用 node 搭建个人博客（二）：导出模块同时兼容 import 和 require
一般在项目里使用 es6 的 `export` 语法导出模块，只能用 es6 的 `import` 来引入，如果使用 `require` 就会报错。

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
