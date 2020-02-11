# ESlint + VSCode自动格式化代码(2020)

![在这里插入图片描述](https://github.com/woai3c/Front-end-articles/blob/master/imgs/vscode-1.gif)

本文用 Vue 项目做示范。

利用 Vue CLI 创建项目时要将 ESlint 选上，下载完依赖后，用 VSCode 打开项目。

安装插件 ESLint，然后 File -> Preference -> Settings（如果装了中文插件包应该是 文件 -> 选项 -> 用户），搜索 eslint，点击 Edit in setting.json

![在这里插入图片描述](https://github.com/woai3c/Front-end-articles/blob/master/imgs/vscode-2.png)

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
### 2020更新
由于 vscode 版本更新，以上配置已经失效，需要改为
```js
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
    },
```

配置完之后，VSCode 会根据你当前 Vue 项目下的 `.eslintrc.js` 文件的规则来验证和格式化代码。

PS：自动格式化代码在保存时自动触发，目前试了 TS 和 JS 以及 vue 文件中的 JS 代码都没问题，html 和 vue 中的 html 和 css 无效。

### 扩展
其实还是有办法格式化 vue 文件中的 html 和 css 代码的，利用 vscode 自带的格式化，快捷键是 `shift + alt + f`，假设你当前 vscode 打开的是一个 vue 文件，按下 `shift + alt + f` 会提示你选择一种格式化规范，如果没提示，那就是已经有默认的格式化规范了（一般是 vetur 插件），然后 vue 文件的所有代码都会格式化，并且格式化规则还可以自己配置，如下图所示，可以根据自己的喜好来选择格式化规则。

![在这里插入图片描述](https://github.com/woai3c/Front-end-articles/blob/master/imgs/vscode-3.png)

因为之前已经设置过 eslint 的格式化规则了，所以 vue 文件只需要格式化 html 和 css 中的代码，不需要格式化 javascript 代码，我们可以这样配置来禁止 vetur 格式化 javascript 代码：

![在这里插入图片描述](https://github.com/woai3c/Front-end-articles/blob/master/imgs/vscode-4.png)

然后回到刚才的 vue 文件，随意打乱代码的格式，再按下 `shift + alt + f` ，会发现 html 和 css 中的代码已经格式化了，但是 javascript 的代码并没格式化。没关系，因为已经设置了 eslint 格式化，所以只要保存，javascript 的代码也会自动格式化。

同理，其他类型的文件也可以这样来设置格式化规范。
