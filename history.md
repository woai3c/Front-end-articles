# 前端的发展历程

## 什么是前端
* 前端：针对浏览器的开发，代码在浏览器运行
* 后端：针对服务器的开发，代码在服务器运行

## 前端三剑客
* HTML
* CSS
* JavaScript

### HTML
>HTML（超文本标记语言——HyperText Markup Language）是构成 Web 世界的基石。HTML是一种基础技术，常与CSS、JavaScript一起被众多网站用于设计令人赏心悦目的网页、网页应用程序以及移动应用程序的用户界面。<br>
超文本标记语言（第一版）——在1993年6月作为互联网工程工作小组（IETF）工作草案发布（并非标准）：<br>
HTML 2.0——1995年11月作为RFC 1866发布，在RFC 2854于2000年6月发布之后被宣布已经过时<br>
HTML 3.2——1997年1月14日，W3C推荐标准<br>
HTML 4.0——1997年12月18日，W3C推荐标准<br>
HTML 4.01（微小改进）——1999年12月24日，W3C推荐标准<br>
HTML 5——2014年10月28日，W3C推荐标准<br>

### CSS
>层叠样式表(英文全称：Cascading Style Sheets)是一种用来表现HTML（标准通用标记语言的一个应用）或XML（标准通用标记语言的一个子集）等文件样式的计算机语言。CSS不仅可以静态地修饰网页，还可以配合各种脚本语言动态地对网页各元素进行格式化。<br>
CSS 能够对网页中元素位置的排版进行像素级精确控制，支持几乎所有的字体字号样式，拥有对网页对象和模型样式编辑的能力。

### JavaScript
>JavaScript一种直译式脚本语言，是一种动态类型、弱类型、基于原型的语言，内置支持类型。它的解释器被称为JavaScript引擎，为浏览器的一部分，广泛用于客户端的脚本语言，最早是在HTML（标准通用标记语言下的一个应用）网页上使用，用来给HTML网页增加动态功能。

## 前端的发展离不开浏览器的发展
浏览器的发展其实也是前端的发展<br>
我们来简单了解一下浏览器的发展历史<br>

>1991年，WorldWideWeb 浏览器发布<br>
这款由 Web 之父 Tim Berners-Lee 亲手设计的图形化浏览器还包含一个所见即所得 HTML 编辑器，为了避免同 WWW 混淆，这个浏览器后来改名为 Nexus.<br>
1993年，Mosaic 发布<br>
Internet 的流行应该归功于 Mosaic，这款浏览器将 Web 带向了大众。诸如 IE， Firefox 一类的当代浏览器仍然在延用 Mosaic 的图形化操作界面思想。<br>
1994年，Netscape 成立<br>
Marc Andreessen 带领 Mosaic 的程序员成立了 Netscape 公司，并发布了第一款商业浏览器 Netscape Navigator.<br>
1995年，IE 发布，浏览器之战即将爆发<br>
微软针对 Netscape 发布了他们自己的浏览器，IE，第一场浏览器之战爆发。<br>
1996年，Opera 发布<br>
Telenor 是挪威最大的通讯公司，他们推出了 Opera，并在两年后进军移动市场，推出 Opera 的移动版。<br>
1998年，Mozilla 项目成立<br>
Netscape 成立 Mozilla 开源项目，开发下一代浏览器，后来证明，使用原有代码开发新东西是一种负担，接着他们着手从新开发。<br>
1998年，Netscape 浏览器走向开源<br>
随着同 IE 征战的失利，Netscape 市场份额急剧下降，Netscape 决定将自己的浏览器开源以期重整山河。<br>
2002年，IE 开始主导浏览器市场<br>
市场份额达到95%，借助操作系统的捆绑优势，IE 赢得第一场浏览器之战。<br>
2003年，苹果 Safari 浏览器登场<br>
苹果进入了浏览器市场，推出自己的 Webkit 引擎，该引擎非常优秀，后来被包括 Google， Nokia 之类的厂商用于手机浏览器。<br>
2004年，Firefox 引发第二场浏览器之战<br>
Firefox 1.0 推出。早在 Beta 测试期间就积累了大量人气的 Firefox 引发了第二场浏览器之战，当年年底，Firefox 已经赢得 7.4% 的市场份额。<br>
2006年，IE7 发布<br>
IE6 发布后的第六年，迫于 Firefox 的压力，微软匆匆推出 IE7 应战，吸取了 Firefox 的一些设计思想，如标签式浏览，反钓鱼等。但这款浏览器现在看来并不成功。<br>
2008年，Google 携 Chrome 参战<br>
Google 发布了他们自己的浏览器，加入这场战争。轻量，快，异常的稳固让这款浏览器成为不可轻视的一个对手。<br>

### 浏览器现状
![浏览器现状](https://github.com/woai3c/Front-end-development-process/blob/master/imgs/llq.jpg)

### 浏览器内核
![浏览器内核](https://github.com/woai3c/Front-end-development-process/blob/master/imgs/llq2.jpg)

## 早期的前端
早期受制于浏览器以及技术、兼容性等问题，导致网页的显示效果非常的单一，几乎都是静态页，前端的工作也是非常简单，说是前端，其实只是一个模板工程师，编写页面模板，然后让后端负责渲染。所以在互联网早期，前端工程师这个职位可以说是不存在，通常由后端或者是美工来兼任。


![1](https://github.com/woai3c/Front-end-development-process/blob/master/imgs/zq1.jpg)

像这种古老的设计风格，现在已经很难看到了

### 后端MVC的开发模式
***
当时的网站开发，采用的是后端MVC模式
* Model（模型层）：提供/保存数据
* Controller（控制层）：数据处理，实现业务逻辑
* View（视图层）：展示数据，提供用户界面
前端只是后端 MVC 的 V

当用户访问网站时，会向后台发送一个请求，后台接收到请求，生成静态HTML页面，发送到浏览器。
比如JSP
```
<html>
<head><title>Hello World</title></head>
<body>
Hello World!<br/>
<%
out.println("Your IP address is " + request.getRemoteAddr());
%>
</body>
</html>
```
![jsp](https://github.com/woai3c/Front-end-development-process/blob/master/imgs/jsp_hello_world.jpg)

### Ajax
***
Ajax技术诞生，改变了一切。前端不再是后端的模板，可以独立得到各种数据。<br>
Ajax是一种在无需重新加载整个网页的情况下，能够更新部分网页的技术。<br>
通过在后台与服务器进行少量数据交换，Ajax可以使网页实现异步更新。这意味着可以在不重新加载整个网页的情况下，对网页的某部分进行更新。<br>

#### 举个例子：用户注册
如果仔细观察一个表单的提交，你就会发现，一旦用户点击“提交”按钮，表单开始提交，浏览器就会刷新页面，然后在新页面里告诉你操作是成功了还是失败了。如果不幸由于网络太慢或者其他原因，就会得到一个404页面。<br>
这就是Web的运作原理：一次HTTP请求对应一个页面。<br>
如果要让用户留在当前页面中，同时发出新的HTTP请求，就可以使用Ajax发送这个新请求，接收到数据后，再用JavaScript更新页面，这样一来，用户就感觉自己仍然停留在当前页面，但是数据却可以不断地更新。<br>

2004年：最早大规模使用AJAX的就是Gmail，Gmail的页面在首次加载后，剩下的所有数据都依赖于AJAX来更新。

### Web 2.0
***
Ajax技术促成了 Web 2.0 的诞生。<br>
Web 1.0：静态网页，纯内容展示<br>
Web 2.0：动态网页，富交互，前端数据处理<br>

至此，前端早期的发展史就介绍完了，当时对于前端的要求并不高，只要掌握html css js和一个jquery就足够开发网页了

## 新时代的前端
到目前为止
HTML已经发展到HTML5<br>
CSS已经发展到CSS3.0<br>
JavaScript已经发展到ES9，但是常用的还是ES5和ES6<br>
现代标准浏览器(遵循W3C标准的浏览器)基本已经支持HTML5 CSS3 ES6的大部分特性<br>

### 浏览器市场份额(2018.9)
![浏览器市场份额](https://github.com/woai3c/Front-end-development-process/blob/master/imgs/share.jpg)

由于IE的不思上进，导致市场份额越来越少，现在几乎是现代标准浏览器的天下。<br>
所以前端开发一个网页几乎不需要考虑IE兼容性<br>

得益于前端技术和浏览器的发展，现在的网页能展示越来越丰富的内容了，比如动画 游戏 画图等等<br>
所以，对于前端的要求也越来越高，特别是近几年框架、技术、工具呈爆发式发展，前端变化特别快！

### MVVM
***
MVVM最早由微软提出来，它借鉴了桌面应用程序的MVC思想，在前端页面中，把Model用纯JavaScript对象表示，View负责显示，两者做到了最大限度的分离
把Model和View关联起来的就是ViewModel。<br>
ViewModel负责把Model的数据同步到View显示出来，还负责把View的修改同步回Model<br>
View 和 Model 之间的同步工作完全是自动的，无需人为干涉<br>
因此开发者只需关注业务逻辑，不需要手动操作DOM, 不需要关注数据状态的同步问题，复杂的数据状态维护完全由 MVVM 来统一管理<br>

![mvvm1](https://github.com/woai3c/Front-end-development-process/blob/master/imgs/mvvm.jpg)


一个MVVM框架和jQuery操作DOM相比有什么区别？
我们先看用jQuery实现的修改两个DOM节点的例子：
```
<!-- HTML -->
<p>Hello, <span id="name">Bart</span>!</p>
<p>You are <span id="age">12</span>.</p>

Hello, Bart!

You are 12.
```
用jQuery修改name和age节点的内容：
```
var name = 'Homer';
var age = 51;

$('#name').text(name);
$('#age').text(age);
```

如果我们使用MVVM框架来实现同样的功能，我们首先并不关心DOM的结构，而是关心数据如何存储。最简单的数据存储方式是使用JavaScript对象：
```
var person = {
    name: 'Bart',
    age: 12
}
```
我们把变量person看作Model，把HTML某些DOM节点看作View，并假定它们之间被关联起来了。

要把显示的name从Bart改为Homer，把显示的age从12改为51，我们并不操作DOM，而是直接修改JavaScript对象：
```
person.name = 'Homer';
person.age = 51;
```

执行上面的代码，我们惊讶地发现，改变JavaScript对象的状态，会导致DOM结构作出对应的变化！这让我们的关注点从如何操作DOM变成了如何更新JavaScript对象的状态，而操作JavaScript对象比DOM简单多了！

这就是MVVM的设计思想：关注Model的变化，让MVVM框架去自动更新DOM的状态，从而把开发者从操作DOM的繁琐步骤中解脱出来！

![mvvm2](https://github.com/woai3c/mini-vue/blob/master/imgs/mvvm.jpg)

### 三大MVVM框架
***
* Vue
* React
* Angular

#### Vue
***
Vue框架诞生于2014年，其作者为中国人——尤雨溪，也是新人最容易入手的框架之一，不同于React和Angular,其中文文档也便于大家阅读和学习。

#### React
***
React起源于Facebook的内部项目，因为该公司对市场上所有JavaScript MVC框架，都不满意，就决定自己写一套，用来架设Instagram的网站。做出来以后，发现这套东西很好用，就在2013年5月开源了。

#### Angular
***
Angular是谷歌开发的 Web 框架，具有优越的性能和绝佳的跨平台性。通常结合TypeScript开发，也可以使用JavaScript或Dart，提供了无缝升级的过渡方案。于2016年9月正式发布。

目前国内使用人数最多、最火的框架是Vue

### webpack
***
如今对于每一个前端工程师来说，webpack已经成为了一项基础技能，它基本上包办了本地开发、编译压缩、性能优化的所有工作。<br>
它的诞生意味着一整套工程化体系开始普及，并且让前端开发彻底告别了以前刀耕火种的时代。现在webpack之于前端开发，正如同gcc/g++之于C/C++，是一个无论如何都绕不开的工具。

### TypeScript(TS)
***
TypeScript 是 Microsoft 开发和维护的一种面向对象的编程语言。它是JavaScript的超集，包含了JavaScript的所有元素，可以载入JavaScript代码运行，并扩展了JavaScript的语法。
TypeScript 具有以下特点：

* TypeScript是Microsoft推出的开源语言，使用Apache授权协议
* TypeScript增加了静态类型、类、模块、接口和类型注解

在开发大型项目时使用TS更有优势

### NodeJs
***
Node.js是一个Javascript运行环境(runtime environment)，发布于2009年5月，由Ryan Dahl开发，实质是对Chrome V8引擎进行了封装。Node.js对一些特殊用例进行优化，提供替代的API，使得V8在非浏览器环境下运行得更好。严格的来说，Node.js其实是一个后端语言。

特点：
* 单线程
* 非阻塞IO
* 事件驱动
* V8引擎

### 现在的前端能做什么？
* 游戏开发(Egret Layabox coco2d-js)
* web开发(pc 移动端设备)
* webApp开发(Dcloud RN weex ionic)
* 图形开发WebGl(three.js)
* 小程序/快应用
* 后端(nodejs)
* 桌面应用(electron)
* 嵌入式开发(Ruff)

## 前端的未来
现在基于Web的前端技术，将演变为未来所有软件的通用的GUI解决方案。
所以前端有可能会变成一名端工程师。
* PC端
* 手机端
* TV端
* VR端

......

## 一名合格的前端需要掌握哪些技能
* photoshop切图(必修)
* html css js(特别是html5 css3 es6)(必修)
* 三大前端框架至少精通一个(必修)
* nodejs(选修)
* 自动化构建工具webpack(必修)
* http协议(必修)
* 浏览器渲染流程及原理(必修)
* TypeScript(选修)

## 技能会过时 计算机基础知识不会过时
* 算法
* 编译原理

建议学习编译原理和算法这两门课程<br>
算法的好处相信大家都懂 在这里简单说一下<br>
懂算法的人善于计算时空复杂度，相当于在你做事情前，懂得怎么去衡量效率和开销

编译原理：将源语言转化为目标语言,也就是将一门语言转化为另一门语言

### 编译原理在前端中的应用
* babel
* TypeScript
* Vue的VNode 

......

参考资料：http://software.cnw.com.cn/software-application/htm2009/20091013_183968.shtml<br>
参考资料：https://github.com/ruanyf/jstraining/blob/master/docs/history.md<br>
参考资料：https://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000
