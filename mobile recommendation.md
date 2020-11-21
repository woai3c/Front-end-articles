# 移动端开发一些常见问题的解决方案

## 1. 获取设备的真实开发分辨率（逻辑分辨率）
最近查了好多关于移动端适配的资料，把人都看懵了，收获了一堆名词：
```
CSS像素、物理分辨率、逻辑分辨率、设备像素比、PPI、DPI、DPR、DIP、Viewport
```
其实，对于开发来说，只需要了解三个概念。
1. 物理分辨率，就是设备上标称的分辨率。
2. 逻辑分辨率，开发时所用的分辨率。
3. 设备像素比，物理分辨率和逻辑分辨率之比。

例如 iphone 6，它的物理分辨率是 `750 x 1334`，逻辑分辨率是 `375 x 667`，设备像素比是 2（`750 / 375`）。打开 chrome 控制台，切换到 device toolbar， 选择 iphone 6 设备就能看到它的逻辑分辨率。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121110407618.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70#pic_center)

平时所说的 UI 设计稿 2 倍图、3 倍图。这个倍就是指设备像素比。例如设计稿是 2 倍图，里面的字体是 24 px，那我们用 `24 / 2` 就可以得出开发要用的像素为 12 px。

苹果设备大多都能查到它的逻辑分辨率是多少。但安卓设备不是，所以需要使用其他手段。

### 知道物理分辨率
如果你知道物理分辨率，那可以通过 `window.devicePixelRatio` 获取设备像素比。然后再通过公式得出逻辑分辨率。
```js
逻辑分辨率 = 物理分辨率 / 设备像素比
```
例如 PC 上的设备像素比就是 1。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121111155948.png#pic_center)

开发 PC 页面是很简单的，设计稿上的像素是多少，开发就写多少。

### 什么都不知道
即使你连物理分辨率都不知道，那也不要紧，一样有办法能得到设备的逻辑分辨率。

在页面建立一个刚好铺满全屏的 div 元素，然后获取它的宽高，这个宽高就是该设备的逻辑分辨率。
```css
.test-div {
	position: fixed;
	left: 0;
	top: 0;
	width: 100vw;
	height: 100vh;
	background: red;
}
```
```js
document.querySelector('test-div').clientWidth // 宽
document.querySelector('test-div').clientHeight // 高
```
刚好我手上有一个华为  m5 平板和华为 m5pro 平板，大小分别为 10.1 寸和 10.8 寸，用这种方法获取到它们的逻辑分辨率分别为 `960 x 600`、`1024 x 640`。

如图所示（华为 m5）：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191213104213298.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

为了证明推断是正确的，我拿了一个专门在 m5pro 上使用的 app 放在 chrome 上运行（模拟该设备的逻辑分辨率），完美适配。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191213105110800.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

为什么不使用 `window.screen.width` 或 `window.screen.height` 来获取逻辑分辨率呢？请看 MDN 的解释：
>注意，该属性返回的高度值并不是全部对浏览器窗口可用。小工具（Widgets），如任务栏或其他特殊的程序窗口，可能会减少浏览器窗口和其他应用程序能够利用的空间。

也就是说，返回来的高度有一部分可能会被其他程序占用。

**PS**：如果 app 在移动设备上不需要全屏展示，那么在 chrome 上模拟设备大小时要减去设备状态栏的高度。
## 2. 页面适配
在 css 中有很多相对长度，其中常用的有 em、rem、vw、vh 等，在小程序上还有 rpx。不管是 rem、vw 还是 rpx，都是跟屏幕宽度有关的。用这些计量单位开发的页面，不一定能兼容所有的移动端设备。

例如完美适配 iphone 6 的页面，在平板上就可能会出现样式问题。

**适配 iphone 的页面**：

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020112112523771.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70#pic_center)

**放到平板下就乱了**：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121125328211.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70#pic_center)


为此，有些网站做成了具有多套样式的自适应网站。例如用手机、平板、PC 访问的网站样式是不一样的。不过这种网站维护起来工作量很大，也很繁琐。而且现在手机与手机之间的差异也很大，需要写很多 `@media` 来解决适配的问题。

### 一个可行的解决方案
我觉得有一个比较可行的解决方案，对于适配多种移动设备有一定的帮助。

那就是**整体布局使用 vw、百分比 % 作为计量单位，内容样式上使用 px 作为计量单位**。

![在这里插入图片描述](https://segmentfault.com/img/remote/1460000038246027/view)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121142851802.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121142931403.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70#pic_center)

从上面三个图可以看到，用 px 来做内容样式的计量单位，是可以适配多端的。即使为移动端设备写的网站，放到 PC 下也能适配。

这种解决方案就是简单方便，一劳永逸。目前我所开发过的移动端项目都是用的这种解决方案，暂时还未遇到适配上的问题。

而且这样写还有一个好处，就是**更大的屏幕可以看到更多的内容，而不是看到更大的内容**。例如在手机端下，一行只能显示 x 个字，要是内容超出屏幕就得用省略号代替。如果换成平板，可能就能把内容完整的显示出来。

### 其他解决方案
还有一个解决方案是在这个[网站](https://news.qq.com/zt2020/page/feiyan.htm#/)发现的。这个网站整体布局和内容都是使用 vw 作为计量单位，在移动端上没什么问题。但在 PC 端下，它使用了 `scale` 属性。也就是说，当检测到你的设备是 PC 时，它会使用 `scale` 将网站进行缩小，最大宽度固定在 `750px`。这样，即使内容样式使用 vw 作为计量单位，也不会出现样式错乱的问题。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121152744749.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121152804833.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70#pic_center)
### 栅格化布局
在某些情况下，可以使用栅格化布局。例如当页面分辨率较大时，采取三列布局；当页面分辨率较小时，采用两列布局。

```html
<div class="container">
		<div class="col col-md-4 col-sm-6"></div>
		<div class="col col-md-4 col-sm-6"></div>
		<div class="col col-md-4 col-sm-12"></div>
		<div class="col col-md-3 col-sm-3"></div>
		<div class="col col-md-6 col-sm-6"></div>
		<div class="col col-md-3 col-sm-3"></div>
		<div class="col col-md-1 col-sm-2"></div>
		<div class="col col-md-1 col-sm-2"></div>
		<div class="col col-md-2 col-sm-8"></div>
		<div class="col col-md-2 col-sm-3"></div>
		<div class="col col-md-6 col-sm-3"></div>
	</div>	
```

**分辨率较大时的页面**：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121154641400.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70#pic_center)

**分辨率较小时的页面**：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121154707760.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70#pic_center)

如果你对栅格化原理不太了解，建议阅读我的另一篇文章[栅格化系统的原理以及实现](https://zhuanlan.zhihu.com/p/61401978)。
### 尽量使用移动端专用的 UI 组件库
PC 端的 UI 组件库在移动端上会有很多样式问题，如非必要，不要使用。
