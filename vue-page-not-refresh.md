# Vue 改变数据，页面不刷新的问题
最近在用 element-ui 开发一个网站，使用 table 组件时，发现修改完数据，有时候会延迟一两秒，页面才会发生变化。

![demo](https://github.com/woai3c/Front-end-articles/blob/master/imgs/vue1.gif)

看了一下代码，发现修改数据的代码是这样的
```js
// popupData是修改的数据，修改完后，赋值给对应的表格数据
this.tableData[this.currentRow] = this.popupData
```
### 注意事项（以下内容摘自[官方文档](https://cn.vuejs.org/v2/guide/list.html#%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9)）
由于 JavaScript 的限制，Vue 不能检测以下数组的变动：

1. 当你利用索引直接设置一个数组项时，例如：`vm.items[indexOfItem] = newValue`
2. 当你修改数组的长度时，例如：`vm.items.length = newLength`

举个例子：
```js
var vm = new Vue({
  data: {
    items: ['a', 'b', 'c']
  }
})
vm.items[1] = 'x' // 不是响应性的
vm.items.length = 2 // 不是响应性的
```
为了解决第一类问题，以下两种方式都可以实现和 `vm.items[indexOfItem] = newValue` 相同的效果，同时也将在响应式系统内触发状态更新：
```js
// Vue.set
Vue.set(vm.items, indexOfItem, newValue)
```
```js
// Array.prototype.splice
vm.items.splice(indexOfItem, 1, newValue)
```
你也可以使用 `vm.$set` 实例方法，该方法是全局方法 `Vue.set` 的一个别名：
```js
vm.$set(vm.items, indexOfItem, newValue)
```
为了解决第二类问题，你可以使用 `splice`：
```js
vm.items.splice(newLength)
```

所以，解决方法就是用 `Vue.set` 来代替直接赋值
```js
this.$set(this.tableData, this.currentRow, this.popupData)
```
