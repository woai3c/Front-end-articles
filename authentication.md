# Vue 页面权限控制和登陆验证
### 页面权限控制
页面权限控制是什么意思呢？

就是一个网站有不同的角色，比如管理员和普通用户，要求不同的角色能访问的页面是不一样的。如果一个页面，有角色越权访问，这时就得做出限制了。

[Vue 动态添加路由及生成菜单](https://github.com/woai3c/Front-end-articles/blob/master/dynamic-routing.md)这是我写过的一篇文章，
通过动态添加路由和菜单来做控制，不能访问的页面不添加到路由表里，这是其中一种办法。

另一种办法就是所有的页面都在路由表里，只是在访问的时候要判断一下角色权限。如果有权限就让访问，没有权限就拒绝，跳转到 404 页面。

**思路**：

在每一个路由的 `meta` 属性里，将能访问该路由的角色添加到 `roles` 里。用户每次登陆后，将用户的角色返回。然后在访问页面时，把路由的 `meta` 属性和用户的角色进行对比，如果用户的角色在路由的 `roles` 里，那就是能访问，如果不在就拒绝访问。

**代码示例**：

路由信息
```js
routes: [
    {
        path: '/login',
        name: 'login',
        meta: {
            roles: ['admin', 'user']
        },
        component: () => import('../components/Login.vue')
    },
    {
        path: 'home',
        name: 'home',
        meta: {
            roles: ['admin']
        },
        component: () => import('../views/Home.vue')
    },
]
```
页面控制
```js
// 假设角色有两种：admin 和 user
// 这里是从后台获取的用户角色
const role = 'user'
// 在进入一个页面前会触发 router.beforeEach 事件
router.beforeEach((to, from, next) => {
    if (to.meta.roles.includes(role)) {
        next()
    } else {
        next({path: '/404'})
    }
})
```
### 登陆验证
网站一般只要登陆过一次后，接下来该网站的其他页面都是可以直接访问的，不用再次登陆。
我们可以通过 `token` 或 `cookie` 来实现，下面用代码来展示一下如何用 `token` 控制登陆验证。
```js
router.beforeEach((to, from, next) => {
    // 如果有token 说明该用户已登陆
    if (localStorage.getItem('token')) {
        // 在已登陆的情况下访问登陆页会重定向到首页
        if (to.path === '/login') {
            next({path: '/'})
        } else {
            next({path: to.path || '/'})
        }
    } else {
        // 没有登陆则访问任何页面都重定向到登陆页
        if (to.path === '/login') {
            next()
        } else {
            next(`/login?redirect=${to.path}`)
        }
    }
})
```

上述所有实现，都可以在我的[vue轻量级后台管理系统基础模板](https://github.com/woai3c/vue-admin-template)项目里找到
