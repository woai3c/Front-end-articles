## 同步、异步
JS是单线程的，每次只能做一件事情。像以下这种情况，代码会按顺序执行，这个就叫同步。 
```
console.log(1);
console.log(2);
console.log(3);
```

以下代码会输出2、3、1，像这种不按顺序执行的，或者说代码执行中间有时间间隙的，叫异步。
```
setTimeout(() => {
    console.log(1);
}, 0);
console.log(2);
console.log(3);
```

## 事件循环
一个浏览器通常有以下几个常驻的线程：
* 渲染引擎线程：该线程负责页面的渲染
* JS引擎线程：负责JS的解析和执行
* 定时触发器线程：处理定时事件，比如setTimeout, setInterval
* 事件触发线程：处理DOM事件
* 异步http请求线程：处理http请求

渲染线程和JS引擎线程是不能同时进行的。也就是说在执行代码时，渲染会挂起；渲染DOM时，代码也不会执行。
虽然JS是单线程，但是浏览器是多线程的，在遇到像setTimeout、DOM事件、ajax等这种任务时，会转交给浏览器的其他工作线程(上面提到的几个线程)执行，执行完之后将回调函数放入到任务队列。


```
// eventLoop是一个用作队列的数组
// （先进，先出）
var eventLoop = [ ];
var event;
// “永远”执行
while (true) {
    // 一次tick
    if (eventLoop.length > 0) {
        // 拿到队列中的下一个事件
        event = eventLoop.shift();
        // 现在，执行下一个事件
        event();
    }
}
```
我们可以用上面的代码来想像一下JS的执行情况。<br>
JS主线程，就像是一个while循环，会一直执行下去。在这期间，每次都会查看任务队列有没有需要执行的任务（回调函数）。在执行完一个任务之后，
会继续下一个循环，直到任务队列所有任务都执行完为止。

## microtask(微任务)、macrotask(宏任务)
任务队列又分微任务队列和宏任务队列

### 微任务
* Promise
* MutationObserver（Mutation Observer API 用来监视 DOM 变动）
* Object.observe()（已废弃）

### 宏任务
* setTimeout
* setInterval
* setImmediate
* I\O
* UI rendering(DOM event)

## 执行过程
1. 在JS执行完同步任务之后，会开始执行微任务队列
2. 在将所有的微任务执行完之后，会开始执行宏任务队列
3. 在执行完一个宏任务之后，跳出来，重新开始下一个循环(从1开始执行)

也就是说执行微任务队列 会将队列中的所有微任务执行完 而执行宏任务队列 每次只执行一个宏任务 然后重新开始下一个循环
我们可以看看以下代码
```
setTimeout(() => {
    console.log(3)
    new Promise((resolve, reject) => {
        console.log(5)
        resolve()
    }).then(console.log(6))
}, 0)

setTimeout(() => {
    console.log(4)
}, 0)

new Promise((resolve, reject) => {
    console.log(1)
    resolve()
}).then(console.log(2))
```
输出是1 2 3 5 6 4

我们来分析一下代码的执行过程
1. 前面的两个setTimeout都是宏任务，所以现在宏任务队列有2个任务
2. Promise里面的代码是同步任务，所以现在会马上执行 输出1
3. Promise的then是微任务，所以现在微任务队列有1个任务
4. 在执行完同步任务之后，开始执行微任务，也就是console.log(2), 输出2
5. 在执行完微任务之后，会执行宏任务，第一个宏任务也就是第一个setTimeout
6. 第一个setTimeout会先输出3，然后输出5，因为这两个都是同步任务，然后遇到then，加入微任务队列，宏任务执行完重新开始下一个循环。
7. 因为没有同步代码，所以接着执行微任务，此时微任务队列有1个任务(第6步加入), 宏任务队列还有1个任务(第6步执行完了第一个宏任务)
8. 执行微任务，输出6
9. 再执行宏任务，输出4

![eventloop](https://github.com/woai3c/Front-end-articles/blob/master/imgs/eventloop.svg)
