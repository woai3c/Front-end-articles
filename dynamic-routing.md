# Vue 动态添加路由及生成菜单
写后台管理系统，估计有不少人遇过这样的需求：根据后台数据动态添加路由和菜单。<br>
为什么这么做呢？因为不同的用户有不同的权限，能访问的页面是不一样的。<br>
在网上找了好多资料，终于想到了解决办法。<br>

### 动态生成路由
利用 vue-router 的 `addRoutes` 方法可以动态添加路由。

先看一下官方介绍：

**router.addRoutes**
```js
router.addRoutes(routes: Array<RouteConfig>)
```
动态添加更多的路由规则。参数必须是一个符合 `routes` 选项要求的数组。

举个例子：
```js
const router = new Router({
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../components/Login.vue')
        },
        {path: '/', redirect: '/home'},
    ]   
})
```
上面的代码和下面的代码效果是一样的
```js
const router = new Router({
    routes: [
        {path: '/', redirect: '/home'},
    ]   
})

router.addRoutes([
    {
        path: '/login',
        name: 'login',
        component: () => import('../components/Login.vue')
    }
])
```
在动态添加路由的过程中，如果有 404 页面，一定要放在最后添加，否则在登陆的时候添加完页面会重定向到 404 页面。

类似于这样，这种规则一定要最后添加。
```js
{path: '*', redirect: '/404'}
```

### 动态生成菜单
假设后台返回来的数据长这样
```js
// 左侧菜单栏数据
menuItems: [
    {
        name: 'home', // 要跳转的路由名称 不是路径
        size: 18, // icon大小
        type: 'md-home', // icon类型
        text: '主页' // 文本内容
    },
    {
        text: '二级菜单',
        type: 'ios-paper',
        children: [
            {
                type: 'ios-grid',
                name: 't1',
                text: '表格'
            },
            {
                text: '三级菜单',
                type: 'ios-paper',
                children: [
                    {
                        type: 'ios-notifications-outline',
                        name: 'msg',
                        text: '查看消息'
                    },
                    {
                        type: 'md-lock',
                        name: 'password',
                        text: '修改密码'
                    },
                    {
                        type: 'md-person',
                        name: 'userinfo',
                        text: '基本资料',
                    }
                ]
            }
        ]
    }
]
```
来看看怎么将它转化为菜单栏，我在这里使用了 `iview` 的组件，不用重复造轮子。
```html
<!-- 菜单栏 -->
<Menu ref="asideMenu" theme="dark" width="100%" @on-select="gotoPage" 
accordion :open-names="openMenus" :active-name="currentPage" @on-open-change="menuChange">
    <!-- 动态菜单 -->
    <div v-for="(item, index) in menuItems" :key="index">
        <Submenu v-if="item.children" :name="index">
            <template slot="title">
                <Icon :size="item.size" :type="item.type"/>
                <span v-show="isShowAsideTitle">{{item.text}}</span>
            </template>
            <div v-for="(subItem, i) in item.children" :key="index + i">
                <Submenu v-if="subItem.children" :name="index + '-' + i">
                    <template slot="title">
                        <Icon :size="subItem.size" :type="subItem.type"/>
                        <span v-show="isShowAsideTitle">{{subItem.text}}</span>
                    </template>
                    <MenuItem class="menu-level-3" v-for="(threeItem, k) in subItem.children" :name="threeItem.name" :key="index + i + k">
                        <Icon :size="threeItem.size" :type="threeItem.type"/>
                        <span v-show="isShowAsideTitle">{{threeItem.text}}</span>
                    </MenuItem>
                </Submenu>
                <MenuItem v-else v-show="isShowAsideTitle" :name="subItem.name">
                    <Icon :size="subItem.size" :type="subItem.type"/>
                    <span v-show="isShowAsideTitle">{{subItem.text}}</span>
                </MenuItem>
            </div>
        </Submenu>
        <MenuItem v-else :name="item.name">
            <Icon :size="item.size" :type="item.type" />
            <span v-show="isShowAsideTitle">{{item.text}}</span>
        </MenuItem>
    </div>
</Menu>
```
代码不用看得太仔细，理解原理即可，其实就是通过三次 `v-for` 不停的对子数组进行循环，生成三级菜单。

动态菜单已经实现了，再来看看动态路由怎么实现。

首先，要把所有的页面路由都列出来，再用后台返回来的数据动态匹配，能匹配上的就把路由加上，不能匹配上的就不加。

到底怎么做呢？还是对后台数据进行多次 `for` 循环来读取数据。

所有的代码实现，我都放在 [github](https://github.com/woai3c/vue-admin-template) 上，动态菜单的实现放在这个项目下的 `src/components/Index.vue`、`src/permission.js` 和 `src/utils/index.js`下


