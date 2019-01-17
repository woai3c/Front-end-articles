# 优化循环的方法-循环展开
循环展开是一种程序变换，通过增加每次迭代计算的元素的数量，减少循环的迭代次数。

用代码来说明就是将
```
for (i = 0; i < len; i++) {
	sum += arry[i]
}
```
替换为
```
for (i = 0; i < len; i += 2) {
	newSum += arry[i] + arry[i + 1]
}
```
循环展开对于算术运算来说，优化的作用是很大的。我分别对整数运算和浮点数运算作了多次测试，得出表格如下（时间为毫秒）：

|操作|整数|整数(优化后)|浮点数|浮点数(优化后)|
|-|-|-|-|-|
|+|360|163|354|164|
|-|379|167|341|177|
|*|350|160|364|163|
|/|118|57|152|63|

### 测试环境
* cpu:i5-7400
* 浏览器: chrome 70.0.3538.110

运算是用了1千万个数，取值是运行十次测试得出的平均数。附上加法测试的代码
```
const arry = []
let num = 10000000
while (num) {
	arry.push(num)
	num--
}

let sum = 0
let i 
let len = arry.length
let last = new Date()
for (i = 0; i < len; i++) {
	sum += arry[i]
}
let now = new Date()
console.log(now - last)

let newSum = 0
last = new Date()
for (i = 0; i < len; i += 2) {
	newSum += arry[i] + arry[i + 1]
}
now = new Date()
console.log(now - last)

console.log(sum, newSum)
```

#### 参考资料
[深入理解计算机系统](https://book.douban.com/subject/26912767/)
