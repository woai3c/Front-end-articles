# Vue 实现前进刷新，后退不刷新的效果
### 需求一：
在一个列表页中，第一次进入的时候，请求获取数据。

点击某个列表项，跳到详情页，再从详情页后退回到列表页时，不刷新。

也就是说从其他页面进到列表页，需要刷新获取数据，从详情页返回到列表页时不要刷新。

**解决方案**

 在 `App.vue`设置：
```html
        <keep-alive include="list">
            <router-view/>
        </keep-alive>
 ```

 假设列表页为 `list.vue`，详情页为 `detail.vue`，这两个都是子组件。
 
 我们在 `keep-alive` 添加列表页的名字，缓存列表页。
 
 然后在列表页的 `created` 函数里添加 ajax请求，这样只有第一次进入到列表页的时候才会请求数据，当从列表页跳到详情页，再从详情页回来的时候，列表页就不会刷新。
 这样就可以解决问题了。
 
 ### 需求二：
 
 在需求一的基础上，再加一个要求：可以在详情页中删除对应的列表项，这时返回到列表页时需要刷新重新获取数据。
 
 我们可以在路由配置文件上对 `detail.vue` 增加一个 `meta` 属性。
 ```
         {
            path: '/detail',
            name: 'detail',
            component: () => import('../view/detail.vue'),
            meta: {isRefresh: true}
        },
 ```
 这个 `meta` 属性，可以在详情页中通过 `this.$route.meta.isRefresh` 来读取和设置。
 
 设置完这个属性，还要在 `App.vue` 文件里设置 watch 一下 `$route` 属性。
 ```js
     watch: {
        $route(to, from) {
            const fname = from.name
            const tname = to.name
            if (from.meta.isRefresh || (fname != 'detail' && tname == 'list')) {
                from.meta.isRefresh = false
					// 在这里重新请求数据
            }
        }
    },
 ```
 这样就不需要在列表页的 `created` 函数里用 ajax 来请求数据了，统一放在 `App.vue` 里来处理。
 
 触发请求数据有两个条件：
 
 1. 从其他页面（除了详情页）进来列表时，需要请求数据。
 2. 从详情页返回到列表页时，如果详情页 `meta` 属性中的 `isRefresh` 为 `true`，也需要重新请求数据。
 
当我们在详情页中删除了对应的列表项时，就可以将详情页 `meta` 属性中的 `isRefresh` 设为 `true`。这时再返回到列表页，页面会重新刷新。
 
#### 解决方案二
对于需求二其实还有一个更简洁的方案，那就是使用 router-view 的 `key` 属性。
```html
<keep-alive>
    <router-view :key="$route.fullPath"/>
</keep-alive>
```
首先 keep-alive 让所有页面都缓存，当你不想缓存某个路由页面，要重新加载它时，可以在跳转时传一个随机字符串，这样它就能重新加载了。
例如从列表页进入了详情页，然后在详情页中删除了列表页中的某个选项，此时从详情页退回列表页时就要刷新，我们可以这样跳转：
```js
this.$router.push({
    path: '/list',
    query: { 'randomID': 'id' + Math.random() },
})
```
这样的方案相对来说还是更简洁的。
