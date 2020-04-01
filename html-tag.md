# HTML 元素标签语义化及使用场景

灵魂三问：
1. 标签语义化是什么？
2. 为什么要标签语义化？
3. 标签语义化使用场景有哪些？

下面让我们跟着这三个问题来展开一下本文的内容。

### 一、标签语义化是什么？
标签语义化就是让元素标签做适当的事情。例如 `p` 标签就是代表文本，`button` 标签代表按钮，`nav` 标签代表导航等等。

### 二、为什么要标签语义化？
其实标签语义化是给浏览器和搜索引擎看的。没有人关心你写的 HTML 代码有没有正确的使用语义化，只有它们关心这件事情，是不是很暖心？

#### 为什么浏览器关心？
DOM 的大部分内容具有隐式语义含义。 也就是说，DOM 采用的原生 HTML 元素能够被浏览器识别，并且可以预测其在各类平台上的工作方式。

例如用 `div` 实现的按钮和用原生 `button` 实现的按钮就有一些区别，在表单内 `button` 可以不用绑定 onclick 事件就可以提交表单内容，用 `div` 实现的按钮则不行。另外在浏览器中按 tab 键盘可以在 `button` 之间来回切换，而 `div` 则不可以。

还有 `input` 标签 type 属性，由于值的不同在手机上的表现也不同。例如 type="tel" 和 type="number" 弹出来的数字键盘是不一样的。

#### 为什么搜索引擎关心？
搜索引擎的爬虫根据标签来确定上下文、关键字的权重，有利于 SEO。

如果你觉得以上两点理由都不能打动你，从而正确的使用语义化，没有关系，使用 `div` 一把梭也是可以的。
### 三、标签语义化使用场景有哪些？
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200401134944990.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)
上面是一个比较常见的整体布局方式，其他布局类型其实都是万变不离其宗，逃不出这个使用框架（文末附上 HTML 源码）。

除了整体布局外，我们还要更细节一点，关注其他标签的使用方式。例如：
1. `a` 标签用于跳转。
2. `h1` - `h5` 用于标题
3. `b` `strong` 用于强调
4. `ul` `li` 用于列表

...
这只是其中的一部分标签使用方式，更多的还得参考文档。

方便自己，方便他人，请正确使用语义化。
### 参考资料
* [HTML5 标签列表](https://developer.mozilla.org/zh-CN/docs/Web/Guide/HTML/HTML5/HTML5_element_list)
* [HTML 元素参考](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element)
* [原生 HTML 中的语义](https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/the-accessibility-tree?hl=zh-cn)

### 文中 DEMO 源码
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>demo1</title>
    <style>
        html, body {
            height: 100%;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        main {
            height: calc(100% - 120px);
            border: 1px solid blue;
        }
        header, footer {
            height: 60px;;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid red;
        }
        header {
            justify-content: flex-end;
        }
        ul {
            display: flex;
            align-items: center;
            justify-content: space-around;
        }
        li {
            list-style: none;
            border: 1px solid orange;
            height: 60px;
            line-height: 60px;
            width: 100px;
            text-align: center;
        }
        main {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        aside {
            width: 20%;
            border: 1px solid #000;
            height: 100%;
        }
        .right {
            width: 80%;
            height: 100%;
        }
        section {
            height: 200px;
            border: 1px solid green;
        }
    </style>
</head>
<body>
    <header>
        <nav>
            <ul>
                <li>1</li>
                <li>2</li>
                <li>3</li>
                <li>4</li>
            </ul>
        </nav>
    </header>
    <main>
        <aside>
            <p>这是一个侧边栏 aside</p>
        </aside>
        <div class="right">
            <section>
                <p>p1</p>
                <p>p2</p>
            </section>
            <section>
                <p>p3</p>
                <p>p4</p>
            </section>
        </div>
    </main>
    <footer>

    </footer>
</body>
</html>
```
