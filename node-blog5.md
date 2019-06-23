# 用 node 搭建个人博客（五）：数据库
因为没有注册功能，所以在使用前需要先把用户信息添加到数据库。使用如下代码添加一条用户信息：
```js
// user 是保存用户信息的表/集合
db.user.insert({
    user: 'admin', // 用户名 随意填写
    password: 'admin', // 密码 随意填写
    visits: 0, // 博客访问次数 每次刷新网站 自增1
    token: '', // 用户登录创建 token 后，保存在这
})
```
用来保存文章数据的表/集合为 `myBlogArticles`, 这个也是自己命名的，可以在代码中自己修改。
注意：在 `windows` 中安装数据库，一定要按照[教程](https://www.runoob.com/mongodb/mongodb-window-install.html)安装。

## 项目相关文档
* [多个请求下 loading 的展示与关闭](https://github.com/woai3c/Front-end-articles/blob/master/control%20loading.md)
* [Vue 实现前进刷新，后退不刷新的效果](https://github.com/woai3c/Front-end-articles/blob/master/vue%20refresh.md)
* [Vue 页面权限控制和登陆验证](https://github.com/woai3c/Front-end-articles/blob/master/authentication.md)
* [用 node 搭建个人博客（一）：代码热更新](https://github.com/woai3c/Front-end-articles/blob/master/node-blog1.md)
* [用 node 搭建个人博客（二）：导出模块同时兼容 import 和 require](https://github.com/woai3c/Front-end-articles/blob/master/node-blog2.md)
* [用 node 搭建个人博客（三）：token](https://github.com/woai3c/Front-end-articles/blob/master/node-blog3.md)
* [用 node 搭建个人博客（四）：评论功能](https://github.com/woai3c/Front-end-articles/blob/master/node-blog4.md)
