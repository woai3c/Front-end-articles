## ESlint + VSCode自动格式化代码(2019)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191128173020158.gif)

本文用 Vue 项目做示范。

利用 Vue CLI 创建项目时要将 ESlint 选上，下载完依赖后，用 VSCode 打开项目。

安装插件 ESLint，然后 File -> Preference -> Settings（如果装了中文插件包应该是 文件 -> 选项 -> 用户），

搜索 eslint，点击 Edit in setting.json

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191128173335896.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

将以下选项添加到配置文件
```js
"eslint.autoFixOnSave": true,
"eslint.validate": [
    {
        "language": "vue",
        "autoFix": true
    },
    {
        "language": "html",
        "autoFix": true
    },
    {
        "language": "javascript",
        "autoFix": true
    },
    {
        "language": "typescript",
        "autoFix": true
    },
],
```
配置完之后，VSCode 会根据你当前 Vue 项目下的 `.eslintrc.js` 文件的规则来验证和格式化代码。

PS：自动格式化代码在保存时自动触发，目前试了 TS 和 JS 以及 vue 文件中的 JS 代码都没问题，html 和
vue 中的 template 无效。
