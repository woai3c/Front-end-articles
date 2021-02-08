# ESlint + stylelint + VSCode自动格式化代码(2020)


## eslint 格式化 js 代码
![](https://img-blog.csdnimg.cn/img_convert/2124694cc6805a78697657ba790f69a0.gif)

本文用 Vue 项目做示范。

利用 Vue CLI 创建项目时要将 ESlint 选上，下载完依赖后，用 VSCode 打开项目。

安装插件 ESLint，然后 `File` -> `Preference`-> `Settings`（如果装了中文插件包应该是 文件 -> 选项 -> 设置），搜索 eslint，点击 Edit in setting.json

![在这里插入图片描述](https://img-blog.csdnimg.cn/img_convert/9820d5a2ec912c0fa232908174911424.png)

将以下选项添加到配置文件

```js
    "editor.codeActionsOnSave": {
        "source.fixAll": true,
    },
```
配置完之后，VSCode 会根据你当前 Vue 项目下的 `.eslintrc.js` 文件的规则来验证和格式化代码。

PS：自动格式化代码在保存时自动触发，目前试了 JS 以及 vue 文件中的 JS 代码都没问题，html 和 vue 中的 html 和 css 无效。

#### TypeScript
下载插件
```
npm install --save-dev typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

在 `.eslintrc` 配置文件，添加以下两个配置项：
```json
"parser": "@typescript-eslint/parser",
"plugins": [
    "@typescript-eslint"
],
```

将根目录下的 `package.json` 文件的 `scripts` 选项添加以下配置项：
```json
"scripts": {
  "lint": "eslint --ext .js,.ts,.tsx test/ src/",
},
```
`test/` `src/` 是你要校验的目录。修改完后，现在 ts 文件也可以自动格式化了。

![](https://img-blog.csdnimg.cn/img_convert/e990512dbf4bbf446017ec810b878ec1.gif)

### 扩展
其实还是有办法格式化 vue 文件中的 html 和 css 代码的，利用 vscode 自带的格式化，快捷键是 `shift + alt + f`，假设你当前 vscode 打开的是一个 vue 文件，按下 `shift + alt + f` 会提示你选择一种格式化规范，如果没提示，那就是已经有默认的格式化规范了（一般是 vetur 插件），然后 vue 文件的所有代码都会格式化，并且格式化规则还可以自己配置，如下图所示，可以根据自己的喜好来选择格式化规则。

![在这里插入图片描述](https://img-blog.csdnimg.cn/img_convert/f532633b2856c8e1cedaa6c38c176151.png)

因为之前已经设置过 eslint 的格式化规则了，所以 vue 文件只需要格式化 html 和 css 中的代码，不需要格式化 javascript 代码，我们可以这样配置来禁止 vetur 格式化 javascript 代码：

![在这里插入图片描述](https://img-blog.csdnimg.cn/img_convert/64fac739a981493721ae2fbdda495be0.png)

然后回到刚才的 vue 文件，随意打乱代码的格式，再按下 `shift + alt + f` ，会发现 html 和 css 中的代码已经格式化了，但是 javascript 的代码并没格式化。没关系，因为已经设置了 eslint 格式化，所以只要保存，javascript 的代码也会自动格式化。

同理，其他类型的文件也可以这样来设置格式化规范。

## stylelint 格式化 css 代码
下载依赖
```
npm install --save-dev stylelint stylelint-config-standard
```
在项目根目录下新建一个 `.stylelintrc.json` 文件并输入以下内容：
```json
{
    "extends": "stylelint-config-standard"
}
```
VSCode 添加 `stylelint` 插件

![在这里插入图片描述](https://img-blog.csdnimg.cn/img_convert/afa020a625f5c5aee5fa304d35eb6682.png)

然后就可以看到效果了。

![在这里插入图片描述](https://img-blog.csdnimg.cn/img_convert/6156343f2a04454fa1d843f8bdecd07e.gif)

如果你想修改插件的默认规则，可以看[官方文档](https://github.com/stylelint/stylelint/blob/5a8465770b4ec17bb1b47f359d1a17132a204a71/docs/user-guide/rules/list.md)，它提供了 170 项规则修改。例如我想要用 4 个空格作为缩进，可以这样配置：
```json
{
    "extends": "stylelint-config-standard",
    "rules": {
        "indentation": 4
    }
}
```
