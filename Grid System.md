# 栅格化系统的原理以及实现
## 什么是栅格化
在一个有限的、固定的平面上，用水平线和垂直线（虚拟的线，“参考线”），将平面划分成有规律的一系列“格子”（虚拟的格子），并依托这些格子、或以格子的边线为基准线，来进行有规律的版面布局。

通俗点来说，就是人为的把网页中的一行，等比例划分,比如将一行划分为 12 等分。然后在每个格子里进行页面开发，这就栅格化。
![grid1](https://github.com/woai3c/Front-end-articles/blob/master/imgs/grid1.jpg)
## 原理
假如在页面里定义了一个 DIV，并设置如下 CSS 属性：
```css
div {
  border: 1px solid #ddd;
  height: 200px;
  width: 100%;
}
```
![grid2](https://github.com/woai3c/Front-end-articles/blob/master/imgs/grid2.jpg)
页面上将会展示一个带有灰色边框的，宽度 100% 的矩形。如果手动控制浏览器放大缩小，此 DIV 也会相应的放大缩小，但宽度始终是 100%。
<br>

如果在页面定义了两个 DIV，并设置如下 CSS 属性：
```css
body {
    font-size: 0; // 将inline-block布局两个DIV之间的距离清除
}
div {
    height: 200px;
    border: 1px solid #ddd;
    width: 50%;
    display: inline-block;
    box-sizing: border-box;
    vertical-align: top; // 顶部对齐
}
```
![grid3](https://github.com/woai3c/Front-end-articles/blob/master/imgs/grid3.jpg)
页面上将会有两个宽度各占 50% 的 DIV，如果页面放大或缩小，这两个 DIV 都会始终保持着页面 50% 的宽度。

相信到这里，应该有人看出来了，这就是栅格化，只不过第一个例子是将一行划分为 1 等分，即只有一个格子。
第二个例子将一行划分为 2 等分，即有两个格子。如果我将一行划分为 12 等分，那就跟 bootstrap 中的栅格化系统一模一样了，有 12 个格子。

## 实现
让我们来亲自实现一个栅格化系统，假设我们要将一行划分为 12 等分，那 1 等分就占有 `100% / 12 = 8.33%` 的宽度。

相应的 CSS 可以这样设置：
```css
.col1  {width: 8.33%}
.col2  {width: 16.66%}
.col3  {width: 25%}
.col4  {width: 33.33%}
.col5  {width: 41.66%}
.col6  {width: 50%}
.col7  {width: 58.33%}
.col8  {width: 66.66%}
.col9  {width: 75%}
.col10 {width: 83.33%}
.col11 {width: 91.66%}
.col12 {width: 100%}
```
上一个完整的示例来看看吧：
```html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        body {
            margin: 0;
        }
        .app {
            font-size: 0;
        }
        .app div {
            box-sizing: border-box;
            border: 1px solid red;
            height: 200px;
            display: inline-block;
            vertical-align: top;
        }
        .col1  {width: 8.33%}
        .col2  {width: 16.66%}
        .col3  {width: 25%}
        .col4  {width: 33.33%}
        .col5  {width: 41.66%}
        .col6  {width: 50%}
        .col7  {width: 58.33%}
        .col8  {width: 66.66%}
        .col9  {width: 75%}
        .col10 {width: 83.33%}
        .col11 {width: 91.66%}
        .col12 {width: 100%}
    </style>
</head>
<body>
    <div class="app">
        <!-- 4个div 占满一行 -->
        <div class="col1"></div>
        <div class="col2"></div>
        <div class="col3"></div>
        <div class="col6"></div>
    </div>
</script>
</body>
</html>
```
最后呈现出来的效果是这样的。
![grid4](https://github.com/woai3c/Front-end-articles/blob/master/imgs/grid4.jpg)

怎么样？是不是很简单。

## 进阶
结合 `@media` 媒体查询，我们可以做得更多。[@media 详情请看MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@media)

相信用过 bootstrap 栅格化系统的都知道，在 bootstrap 栅格化系统中，有一些 `col-md` `col-sm` 属性，它们是干什么用的呢？
其实，它们都是栅格化系统的 CSS 类名，只是针对了不同的屏幕宽度。

假如我们有这样的一个需求：
在 PC 上，因为屏幕比较大，我们要求一行显示 4 列的内容。但是在手机上，因为屏幕比较小，要求一行显示 3 列的内容。
即一个网站同时适配 PC 和手机端，根据不同的端自动调整页面。

此时，我们可以这样做：
```html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        body {
            margin: 0;
        }
        .app {
            font-size: 0;
        }
        .app div {
            box-sizing: border-box;
            border: 1px solid red;
            height: 200px;
            display: inline-block;
            vertical-align: top;
        }
        /* 针对屏幕分辨率大于等于1200的 */
        @media (min-width: 1200px) {
            .col-md1  {width: 8.33%}
            .col-md2  {width: 16.66%}
            .col-md3  {width: 25%}
            .col-md4  {width: 33.33%}
            .col-md5  {width: 41.66%}
            .col-md6  {width: 50%}
            .col-md7  {width: 58.33%}
            .col-md8  {width: 66.66%}
            .col-md9  {width: 75%}
            .col-md10 {width: 83.33%}
            .col-md11 {width: 91.66%}
            .col-md12 {width: 100%}
	}
        /* 针对屏幕分辨率小于1200的 */
	@media (max-width: 1199px) {
            .col-sm1  {width: 8.33%}
            .col-sm2  {width: 16.66%}
            .col-sm3  {width: 25%}
            .col-sm4  {width: 33.33%}
            .col-sm5  {width: 41.66%}
            .col-sm6  {width: 50%}
            .col-sm7  {width: 58.33%}
            .col-sm8  {width: 66.66%}
            .col-sm9  {width: 75%}
            .col-sm10 {width: 83.33%}
            .col-sm11 {width: 91.66%}
            .col-sm12 {width: 100%}
	}
    </style>
</head>
<body>
    <div class="app">
        <div class="col-md3 col-sm4"></div>
        <div class="col-md3 col-sm4"></div>
        <div class="col-md3 col-sm4"></div>
        <div class="col-md3 col-sm4"></div>
    </div>
</script>
</body>
</html>
```
一个 DIV，同时设置两个类名。当屏幕 `>=1200px` 时，一行显示 4 列，当屏幕 `<1200px` 时，一行显示3列，而且是浏览器自动调整。

![grid5](https://github.com/woai3c/Front-end-articles/blob/master/imgs/grid5.jpg)

![grid6](https://github.com/woai3c/Front-end-articles/blob/master/imgs/grid6.jpg)

一个栅格化系统就这样实现了。
## 练习任务
对于栅格化的介绍就到此结束了，但如果你看完了文章后什么都不做，不到一周，就会把学到的知识忘得七七八八，为了帮助你巩固知识，特地布置了一个小任务，按要求实现如下页面：

#### 图一
![grid7](https://github.com/woai3c/Front-end-articles/blob/master/imgs/grid7.jpg)

#### 图二
![grid8](https://github.com/woai3c/Front-end-articles/blob/master/imgs/grid8.jpg)

任务要求：
1. 当页面大于 `768px` 时，页面如图1所示。
2. 当页面小于等于 `768px` 时， 页面如图2所示。

这里是[答案](https://github.com/woai3c/2016ife-task/blob/master/part1/task8.html)和[在线DEMO](http://htmlpreview.github.io/?https://github.com/woai3c/2016ife-task/blob/master/part1/task8.html)，但是最好先试试能不能自己做出来，如果实在做不出来，再看答案。


  [1]: /img/bVbqS0N
  [2]: /img/bVbqS0S
  [3]: /img/bVbqS0U
  [4]: /img/bVbqS03
  [5]: /img/bVbqS06
  [6]: /img/bVbqS07
  [7]: /img/bVbqS1h
  [8]: /img/bVbqS1C
