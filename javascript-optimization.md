# JavaScript 性能优化

## 加载与执行
* 将`<script>`标签放在`</body>`前面，不要放在`<head>`中，防止造成堵塞
* 尽量减少请求，单个100KB的文件比4个25KB的文件更快，也就是说减少页面中外链的文件会改善性能
* 尽量使用压缩过的JS文件，体积更小，加载更快

## 数据存取
* 使用局部变量和字面量比使用数组和对象有更少的读写消耗
* 尽可能使用局部变量代替全局变量
* 如无必要，不要使用闭包；闭包引用着其他作用域的变量，会造成更大的内存开销
* 原型链不要过深、对象嵌套不要太多
* 对于多次访问的嵌套对象，应该用变量缓存起来

## DOM编程
* 不要频繁修改DOM，因为修改DOM样式会导致重绘(repaint)和重排(reflow)
* 如果要修改DOM的多个样式可以用cssText一次性将要改的样式写入，或将样式写到class里，再修改DOM的class名称
```
const el = document.querySelector('.myDiv')
el.style.borderLeft = '1px'
el.style.borderRight = '2px'
el.style.padding = '5px'
```
可以使用如下语句代替
```
const el = document.querySelector('.myDiv')
el.style.cssText = 'border-left: 1px; border-right: 2px; padding: 5px;'
```
cssText会覆盖已存在的样式，如果不想覆盖已有样式，可以这样
```
el.style.cssText += ';border-left: 1px; border-right: 2px; padding: 5px;'
```
* 避免大量使用`:hover`
* 使用事件委托
```
<ul>
  <li>苹果</li>
  <li>香蕉</li>
  <li>凤梨</li>
</ul>

// good
document.querySelector('ul').onclick = (event) => {
  let target = event.target
  if (target.nodeName === 'LI') {
    console.log(target.innerHTML)
  }
}

// bad
document.querySelectorAll('li').forEach((e) => {
  e.onclick = function() {
    console.log(this.innerHTML)
  }
}) 
```

#### 批量修改DOM
当你需要批量修改DOM时，可以通过以下步骤减少重绘和重排次数：
1. 使元素脱离文档流
2. 对其应用多重改变
3. 把元素带回文档中

该过程会触发两次重排——第一步和第三步。如果你忽略这两个步骤，那么在第二步所产生的任何修改都会触发一次重排。<br>
有三种方法可以使DOM脱离文档：
* 隐藏元素，应用修改，重新显示
* 使用文档片断（document.fragment）在当前DOM之外构建一个子树，再把它拷回文档
* 将原始元素拷贝到一个脱离文档的节点中，修改副本，完成后再替换原始元素

## 算法和流程控制
* 改善性能最佳的方式是减少每次迭代的运算量和减少循环迭代次数
* JavaScript四种循环中`for` `while` `do-while` `for-in`，只有`for-in`循环比其他其中明显要慢，因为`for-in`循环要搜索原型属性
* 限制循环中耗时操作的数量
* 基于函数的迭代`forEach`比一般的循环要慢，如果对运行速度要求很严格，不要使用
* `if-else` `switch`，条件数量越大，越倾向于使用`switch`
* 在判断条件多时，可以使用查找表来代替`if-else` `switch`，速度更快
```
switch(value) {
  case 0:
    return result0
    break
  case 1:
    return result1
    break
  case 2:
    return result2
    break
  case 3:
    return result3
    break

}

// 可以使用查找表代替
const results = [result0, result1, result2, result3]
```
* 如果遇到栈溢出错误，可以使用迭代来代替递归

## 字符串
```
str += 'one' + 'two'
```
此代码运行时，会经历四个步骤：
1. 在内存中创建一个临时字符串
2. 连接后的字符串 `onetwo` 被赋值给该临时字符串
3. 临时字符串与str当前的值连接
4. 结果赋值给str

```
str += 'one' 
str += 'two'
```
第二种方式比第一种方式要更快，因为它避免了临时字符串的产生<br>

你也可以用一个语句就能达到同样的性能提升
```
str = str + 'one' + 'two'
```

## 快速响应用户界面
* 对于执行时间过长的大段代码，可以使用`setTimeout`和`setInterval`来对代码进行分割，避免对页面造成堵塞
* 对于数据处理工作可以交由`Web Workers`来处理，因为`Web Workers`不占用浏览器UI线程的时间

## 编程实践
* 使用Object/Array字面量
```
const obj = new Object()
const newObj = {}

const arry = new Array()
const newArry = []
```
使用字面量会运行得更快，并且节省代码量
* 位操作在JavaScript中性能非常快，可以使用位运算来代替纯数学操作
```
x =* x
// 用位运算代替 
x <<= 1
```
* 如无必要，不要重写原生方法，因为原生方法底层是用C/C++实现的，速度更快

### 参考资料
[高性能JavaScript](https://book.douban.com/subject/26599677/)
