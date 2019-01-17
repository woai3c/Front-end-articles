# 程序局部性原理
### 概念
一个编写良好的计算机程序常常具有良好的局部性，它们倾向于引用邻近于其他最近引用过的数据项的数据项，或者最近引用过的数据项本身，这种倾向性，被称为局部性原理。有良好局部性的程序比局部性差的程序运行得更快。

### 局部性通常有两种不同的形式：
* 时间局部性 <br>
在一个具有良好时间局部性的程序中，被引用过一次的内存位置很可能在不远的将来被多次引用。
* 空间局部性 <br>
在一个具有良好空间局部性的程序中，如果一个内存位置被引用了一次，那么程序很可能在不远的将来引用附近的一个内存位置。

### 时间局部性示例
```
function sum(arry) {
	let i, sum = 0
	let len = arry.length

	for (i = 0; i < len; i++) {
		sum += arry[i]
	}

	return sum
}
```
在这个例子中，变量sum在每次循环迭代中被引用一次，因此，对于sum来说，具有良好的时间局部性

### 空间局部性示例
具有良好空间局部性的程序
```
// 二维数组 
function sum1(arry, rows, cols) {
	let i, j, sum = 0

	for (i = 0; i < rows; i++) {
		for (j = 0; j < cols; j++) {
			sum += arry[i][j]
		}
	}
	return sum
}
```
空间局部性差的程序
```
// 二维数组 
function sum2(arry, rows, cols) {
	let i, j, sum = 0

	for (j = 0; j < cols; j++) {
		for (i = 0; i < rows; i++) {
			sum += arry[i][j]
		}
	}
	return sum
}
```
再回头看一下时间局部性的示例，像示例中按顺序访问一个数组每个元素的函数，具有步长为1的引用模式。<br>
如果在数组中，每隔k个元素进行访问，就称为步长为k的引用模式。<br>
一般而言，随着步长的增加，空间局部性下降。<br>

这两个例子有什么区别？区别在于第一个示例是按照列顺序来扫描数组，第二个示例是按照行顺序来扫描数组。<br>
数组在内存中是按照行顺序来存放的，结果就是按行顺序来扫描数组的示例得到了步长为rows的引用模式；
而对于按列顺序来扫描数组的示例来说，其结果是得到一个很好的步长为1的引用模式，具有良好的空间局部性。

### 性能测试
#### 运行环境 
* cpu: i5-7400 
* 浏览器: chrome 70.0.3538.110

对一个长度为9000的二维数组（子数组长度也为9000）进行10次空间局部性测试，时间（毫秒）取平均值，结果如下：<br>

所用示例为上述两个空间局部性示例

|按列排序|按行排序|
|-|-|
|124|2316|

从以上测试结果来看，二维数组按列顺序访问比按行顺序访问快了1个数量级的速度。

### 总结
* 重复引用相同变量的程序具有良好的时间局部性
* 对于具有步长为k的引用模式的程序，步长越小，在内存中以大步长跳来跳去的程序空间局部性会很差

### 测试代码
```
const arry = []
let [num, n, cols, rows] = [9000, 9000, 9000, 9000]
let temp = []

while (num) {
	while (n) {
		temp.push(n)
		n--
	}
	arry.push(temp)
	n = 9000
	temp = []
	num--
}

let last, now, val

last = new Date()
val = sum1(arry, rows, cols)
now = new Date()
console.log(now - last)
console.log(val)

last = new Date()
val = sum2(arry, rows, cols)
now = new Date()
console.log(now - last)
console.log(val)

function sum1(arry, rows, cols) {
	let i, j, sum = 0

	for (i = 0; i < rows; i++) {
		for (j = 0; j < cols; j++) {
			sum += arry[i][j]
		}
	}
	return sum
}

function sum2(arry, rows, cols) {
	let i, j, sum = 0

	for (j = 0; j < cols; j++) {
		for (i = 0; i < rows; i++) {
			sum += arry[i][j]
		}
	}
	return sum
}
```
#### 参考资料
[深入理解计算机系统](https://book.douban.com/subject/26912767/)
