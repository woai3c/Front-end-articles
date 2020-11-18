# 多个请求下 loading 的展示与关闭
一般情况下，在 vue 中结合 axios 的拦截器控制 loading 展示和关闭，是这样的：
在 `App.vue` 配置一个全局 loading。
```html
    <div class="app">
        <keep-alive :include="keepAliveData">
            <router-view/>
        </keep-alive>
        <div class="loading" v-show="isShowLoading">
            <Spin size="large"></Spin>
        </div>
    </div>
```
同时设置 axios 拦截器。
```js
 // 添加请求拦截器
 this.$axios.interceptors.request.use(config => {
     this.isShowLoading = true
     return config
 }, error => {
     this.isShowLoading = false
     return Promise.reject(error)
 })

 // 添加响应拦截器
 this.$axios.interceptors.response.use(response => {
     this.isShowLoading = false
     return response
 }, error => {
     this.isShowLoading = false
     return Promise.reject(error)
 })
```
这个拦截器的功能是在请求前打开 loading，请求结束或出错时关闭 loading。
如果每次只有一个请求，这样运行是没问题的。但同时有多个请求并发，就会有问题了。

**举例**：

假如现在同时发起两个请求，在请求前，拦截器 `this.isShowLoading = true` 将 loading 打开。
现在有一个请求结束了。`this.isShowLoading = false` 拦截器关闭 loading，但是另一个请求由于某些原因并没有结束。
造成的后果就是页面请求还没完成，loading 却关闭了，用户会以为页面加载完成了，结果页面不能正常运行，导致用户体验不好。

**解决方案**
增加一个 `loadingCount` 变量，用来计算请求的次数。
```js
loadingCount: 0
```
再增加两个方法，来对 `loadingCount`  进行增减操作。
```js
    methods: {
        addLoading() {
            this.isShowLoading = true
            this.loadingCount++
        },

        isCloseLoading() {
            this.loadingCount--
            if (this.loadingCount == 0) {
                this.isShowLoading = false
            }
        }
    }
```
现在拦截器变成这样：
```js
        // 添加请求拦截器
        this.$axios.interceptors.request.use(config => {
            this.addLoading()
            return config
        }, error => {
            this.isShowLoading = false
            this.loadingCount = 0
            this.$Message.error('网络异常，请稍后再试')
            return Promise.reject(error)
        })

        // 添加响应拦截器
        this.$axios.interceptors.response.use(response => {
            this.isCloseLoading()
            return response
        }, error => {
            this.isShowLoading = false
            this.loadingCount = 0
            this.$Message.error('网络异常，请稍后再试')
            return Promise.reject(error)
        })
   ```
   
  这个拦截器的功能是：
  每当发起一个请求，打开 loading，同时 `loadingCount` 加1。
  每当一个请求结束， `loadingCount` 减1，并判断  `loadingCount` 是否为 0，如果为 0，则关闭 loading。
这样即可解决，多个请求下有某个请求提前结束，导致 loading 关闭的问题。

### 切换路由时，取消之前的请求
使用 axios，可以在切换路由时把之前没完成的请求取消掉。

具体分析请看这篇文章[axios切换路由取消指定请求与取消重复请求并存方案](https://juejin.im/post/6844903905625653262)。下面展示一下实现效果：

我新建了一个 Vue 项目，设置了 `a` `b` 两个路由，每次进入路由时，发起一个 `get` 请求：
```js
// a.vue
<template>
    <div class="about">
        <h1>This is an a page</h1>
    </div>
</template>

<script>
import { fetchAData } from '@/api'

export default {
    created() {
        fetchAData().then(res => {
            console.log('a 路由请求完成')
        })
    }
}
</script>
```
```js
// b.vue
<template>
    <div class="about">
        <h1>This is an b page</h1>
    </div>
</template>

<script>
import { fetchBData } from '@/api'

export default {
    created() {
        fetchBData().then(res => {
            console.log('b 路由请求完成')
        })
    }
}
</script>
```
![](https://img-blog.csdnimg.cn/img_convert/302164a5f5471595af7ad29aac700b2f.gif)

从上图可以看到，每当进入路由时会发起一个请求，请求完成后打印一句话。现在我把网速调低，然后每次点击 a 路由时，马上就切换到 b 路由。目的是为了取消 a 路由页面的请求（页面中的黑条就是 loading 图）。

![](https://img-blog.csdnimg.cn/img_convert/61e85da9d268a06324e3cad29877d5ef.png)

**下面的动图是实验效果：**

![](https://img-blog.csdnimg.cn/img_convert/9159dbdf44d390b68ac96ab874f76d9c.gif)

可以看到，成功取消了 a 路由页面的请求。

我把这个 Vue DEMO 项目放上 [github](https://github.com/woai3c/toggle-router-abort-request) 了，有兴趣可以亲自试一下。
