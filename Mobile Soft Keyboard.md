# 手机软键盘弹起导致页面变形的一种解决方案
最近用 uniapp（一种第三方 app 开发框架） 开发 app，其中一个页面有十几个 input 输入框，在点击 input 输入时，软键盘弹起，导致页面往上顶，底部的按钮也全部弹到页面上面去了，布局全被打乱。

**原来的样子：**

![在这里插入图片描述](https://github.com/woai3c/Front-end-articles/blob/master/imgs/keyboard1.png)

**软键盘弹出来后：**

![在这里插入图片描述](https://github.com/woai3c/Front-end-articles/blob/master/imgs/keyboard2.png)

在开发APP时，通常情况下页面的宽度和高度都会设为 100%，即页面高度等于屏幕高度，页面宽度等于屏幕宽度。
当 input 获取焦点时，软键盘弹出，页面高度被挤压，此时页面高度 = 屏幕高度 - 软键盘高度。所以，页面高度缩小，元素都挤压在一起，布局被打乱。

**一种可行的解决方案：给页面设置一个最小高度，即一个能让所有元素按原来布局排列的高度。**

举例：

我开发的 APP 运行在 ipad上，横屏显示时，高度为 768px ，我可以把 768px 当做页面的最小高度。

```css
.app {
	min-height: 768px;
	/* 原来定义的高度 100% */
	height: 100vh;
}
```

![在这里插入图片描述](https://github.com/woai3c/Front-end-articles/blob/master/imgs/keyboard3.png)

软键盘还是会弹起，因为页面最小高度被设为了 768px，所以此时总高度为 768px + 软键盘高度，超出了屏幕高度（ipad横屏屏幕高度为768px）。如上图所示，此时原来页面的上半部分“消失”，就是被顶上去了，只显示原来页面的下半部分。**但至少我们要的页面布局不变形已经实现了**。等输入完，软键盘收起时，页面恢复原状。

ipad 的问题解决了，要是 APP 运行在其他手机端上呢？此时，CSS3 `@media` 属性就排上用场了。
假设要适配 iphone5 和 iphone6

```css
/* iphone5 width:320; height:568*/
@media (min-width: 320px) {
	.app {
		min-height: 568px;
		height: 100vh;
	}
}
/* iphone6 width:375; height:667*/
@media (min-width: 375px) {
	.app {
		min-height: 667px;
		height: 100vh;
	}
}
```

这样设置即可适配 iphone5 和 iphone6
