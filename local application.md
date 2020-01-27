# 在浏览器调起本地应用的方法
最近公司有个需求，要求在浏览器中点击某个按钮，自动调起电脑中的一个应用。

**首先**，将以下代码复制到一个 `reg` 文件，例如 `test.reg`。
```
Windows Registry Editor Version 5.00
[HKEY_CLASSES_ROOT\ptl]
@="URL:ptl Protocol Handler"
"URL Protocol"=""
[HKEY_CLASSES_ROOT\ptl\shell]
[HKEY_CLASSES_ROOT\ptl\shell\open]
[HKEY_CLASSES_ROOT\ptl\shell\open\command]
@="D:\\software\\tim\\Bin\\QQScLauncher.exe"
```
这段代码注册了一个 `ptl`  协议，作用是调起电脑中的 `tim` 应用 ，路径是 `D:\\software\\tim\\Bin\\QQScLauncher.exe`。

保存完成后，双击注册。

**PS：协议，应用可以自由设置**

**其次**，建一个 `html` 文件
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
    <a href="ptl:">tim</a>
</body>
</html>
```
`a` 标签里的 `ptl` 就是刚才注册的协议，现在打开浏览器点击 `tim` 将会弹出一个提示，是否打开 `TIM`。

![在这里插入图片描述](https://github.com/woai3c/Front-end-articles/blob/master/imgs/call1.png)

点击确定，即可打开 `TIM`，我们可以将提示的勾打上，以后点击 `tim` 就会直接弹出 `TIM`，不会再提示。

![在这里插入图片描述](https://github.com/woai3c/Front-end-articles/blob/master/imgs/call2.png)
