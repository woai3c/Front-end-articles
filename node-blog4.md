# 用 node 搭建个人博客（四）：评论功能
评论和对应的文章在数据库里是捆绑在一块的。由于不提供注册功能，所以在游客评论后，会通过 `IP` 地址来代替游客名称。

**文章的数据结构**
```js
{
  _id: '5adf00a6e55e5e5',文章唯一标识符,
  title: '文章标题',
  content: '文章内容',
  tags: ['文章标签'],
  date: '日期',
  year: '年', // 查询用
  month: '月', // 查询用
  comments: []
}
```
文章数据中的 `comments` 就是保存评论数据用的。
```js
{
  user: '127.0.0.1',
  comment: '这里是评论'
}
```
每次游客评论时，会将这一条数据添加到 `comments` 里，当下一次访问该文章时，就可以看到游客的评论了。

## 项目相关文档
* [多个请求下 loading 的展示与关闭](https://github.com/woai3c/Front-end-articles/blob/master/control%20loading.md)
* [Vue 实现前进刷新，后退不刷新的效果](https://github.com/woai3c/Front-end-articles/blob/master/vue%20refresh.md)
* [Vue 页面权限控制和登陆验证](https://github.com/woai3c/Front-end-articles/blob/master/authentication.md)
* [用 node 搭建个人博客（一）：代码热更新](https://github.com/woai3c/Front-end-articles/blob/master/node-blog1.md)
* [用 node 搭建个人博客（二）：导出模块同时兼容 import 和 require](https://github.com/woai3c/Front-end-articles/blob/master/node-blog2.md)
* [用 node 搭建个人博客（三）：token](https://github.com/woai3c/Front-end-articles/blob/master/node-blog3.md)
* [用 node 搭建个人博客（五）：数据库](https://github.com/woai3c/Front-end-articles/blob/master/node-blog5.md)
