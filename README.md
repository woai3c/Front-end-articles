# 前端的发展历程

## 什么是前端
* 前端：针对浏览器的开发，代码在浏览器运行
* 后端：针对服务器的开发，代码在服务器运行

## 前端三剑客
* HTML
* CSS
* JavaScript

#### HTML
>HTML（超文本标记语言——HyperText Markup Language）是构成 Web 世界的基石。HTML是一种基础技术，常与CSS、JavaScript一起被众多网站用于设计令人赏心悦目的网页、网页应用程序以及移动应用程序的用户界面。<br>
超文本标记语言（第一版）——在1993年6月作为互联网工程工作小组（IETF）工作草案发布（并非标准）：<br>
HTML 2.0——1995年11月作为RFC 1866发布，在RFC 2854于2000年6月发布之后被宣布已经过时<br>
HTML 3.2——1997年1月14日，W3C推荐标准<br>
HTML 4.0——1997年12月18日，W3C推荐标准<br>
HTML 4.01（微小改进）——1999年12月24日，W3C推荐标准<br>
HTML 5——2014年10月28日，W3C推荐标准<br>

#### CSS
>层叠样式表(英文全称：Cascading Style Sheets)是一种用来表现HTML（标准通用标记语言的一个应用）或XML（标准通用标记语言的一个子集）等文件样式的计算机语言。CSS不仅可以静态地修饰网页，还可以配合各种脚本语言动态地对网页各元素进行格式化。<br>
CSS 能够对网页中元素位置的排版进行像素级精确控制，支持几乎所有的字体字号样式，拥有对网页对象和模型样式编辑的能力。

#### JavaScript
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

#### 浏览器现状
![浏览器现状](https://github.com/woai3c/Front-end-development-process/blob/master/imgs/llq.jpg)

#### 浏览器内核
![浏览器内核](https://github.com/woai3c/Front-end-development-process/blob/master/imgs/llq2.jpg)

## 早期的前端
早期受制于浏览器以及技术、兼容性等问题，导致网页的显示效果非常的单一，几乎都是静态页，前端的工作也是非常简单，说是前端，其实只是一个模板工程师，编写页面模板，然后让后端负责渲染。所以在互联网早期，前端工程师这个职位可以说是不存在，通常由后端或者是美工来兼任。


![1](https://github.com/woai3c/Front-end-development-process/blob/master/imgs/zq1.jpg)
![2](https://github.com/woai3c/Front-end-development-process/blob/master/imgs/zq2.png)

像这种古老的设计风格，现在已经很难看到了

## 后端MVC的开发模式
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

## Ajax
Ajax技术诞生，改变了一切。前端不再是后端的模板，可以独立得到各种数据。<br>
Ajax是一种在无需重新加载整个网页的情况下，能够更新部分网页的技术。<br>
通过在后台与服务器进行少量数据交换，Ajax可以使网页实现异步更新。这意味着可以在不重新加载整个网页的情况下，对网页的某部分进行更新。<br>

#### 举个例子：用户注册
如果仔细观察一个表单的提交，你就会发现，一旦用户点击“提交”按钮，表单开始提交，浏览器就会刷新页面，然后在新页面里告诉你操作是成功了还是失败了。如果不幸由于网络太慢或者其他原因，就会得到一个404页面。<br>
这就是Web的运作原理：一次HTTP请求对应一个页面。<br>
如果要让用户留在当前页面中，同时发出新的HTTP请求，就可以使用Ajax发送这个新请求，接收到数据后，再用JavaScript更新页面，这样一来，用户就感觉自己仍然停留在当前页面，但是数据却可以不断地更新。<br>

2004年：最早大规模使用AJAX的就是Gmail，Gmail的页面在首次加载后，剩下的所有数据都依赖于AJAX来更新。

## Web 2.0
Ajax技术促成了 Web 2.0 的诞生。
Web 1.0：静态网页，纯内容展示
Web 2.0：动态网页，富交互，前端数据处理

至此，前端早期的发展史就介绍完了，当时对于前端的要求并不高，只要掌握html css js和一个jquery就足够开发网页了

## 新时代的前端
到目前为止
HTML已经发展到5.0的版本<br>
CSS已经发展到3.0版本<br>
JavaScript已经发展到ES9，但是常用的还是ES5和ES6<br>
现代的标准浏览器基本已经支持HTML5 CSS3 ES6的绝大部分特性<br>

![浏览器市场份额](https://github.com/woai3c/Front-end-development-process/blob/master/imgs/share.jpg)

由于IE的不思上进，导致市场份额越来越少，现在几乎是现代标准浏览器的天下。<br>
所以前端开发一个网页几乎不需要考虑兼容性（特殊情况除外）<br>

得益于前端技术和浏览器的发展，现在的网页能展示越来越丰富的内容了，比如各种动画效果 网页游戏 数据缓存等等
所以，对于前端的要求也越来越高 

参考资料：http://software.cnw.com.cn/software-application/htm2009/20091013_183968.shtml
