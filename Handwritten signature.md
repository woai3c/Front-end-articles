# 用canvas实现手写签名功能
最近开发网站有一个需求，要求页面上有一块区域，用户能用鼠标在上面写字，并能保存成图片 base64 码放在服务器。
这样的需求用 canvas 实现是最好的。
需要用到 canvas 的以下几个属性：

  * beginPath 创建一个新的路径
  * globalAlpha 设置图形和图片透明度的属性
  * lineWidth 设置线段厚度的属性（即线段的宽度）
  * strokeStyle 描述画笔（绘制图形）颜色或者样式的属性，默认值是 #000 (black)
  * moveTo(x, y)  将一个新的子路径的起始点移动到(x，y)坐标的方法
  * lineTo(x, y) 使用直线连接子路径的终点到x，y坐标的方法（并不会真正地绘制）
  * closePath 它尝试从当前点到起始点绘制一条直线
  * stroke 它会实际地绘制出通过 moveTo() 和 lineTo() 方法定义的路径，默认颜色是黑色

除了用到这些属性外，还需要监听鼠标点击和鼠标移动事件。

废话就不多说了，直接上[代码](https://github.com/woai3c/2017ife-task/tree/master/hard/drawing)和 [DEMO](http://htmlpreview.github.io/?https://github.com/woai3c/2017ife-task/blob/master/hard/drawing/index.html)。

我对代码做了扩展，除了支持画笔，还支持喷枪、刷子、橡皮擦功能。
### canvas 转成图片
将 canvas 转成图片，需要用到以下属性：
* toDataURL

canvas.toDataURL() 方法返回一个包含图片展示的 data URI 。可以使用 type 参数其类型，默认为 PNG 格式。图片的分辨率为96dpi。

```js
const image = new Image()
// canvas.toDataURL 返回的是一串Base64编码的URL
image.src = canvas.toDataURL("image/png")
```
