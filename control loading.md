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

