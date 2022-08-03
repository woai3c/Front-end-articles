# ESlint + Stylelint + VSCode自动格式化代码(2022)
## eslint 格式化代码
本文用 Vue 项目做示范。

利用 `Vue-CLI`  创建项目时要将 ESlint 选上，下载完依赖后，用 VSCode 打开项目。

安装插件 ESLint，然后 `File` -> `Preference`-> `Settings`（如果装了中文插件包应该是 文件 -> 选项 -> 设置），搜索 eslint，点击 `Edit in setting.json`

![在这里插入图片描述](https://img-blog.csdnimg.cn/img_convert/9820d5a2ec912c0fa232908174911424.png)


将以下选项添加到配置文件

```js
"editor.codeActionsOnSave": {
    "source.fixAll": true,
},
"eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
],
"eslint.alwaysShowStatus": true,
"stylelint.validate": [
    "css",
    "less",
    "postcss",
    "scss",
    "vue",
    "sass"
],
```
同时要确保 VSCode 右下角的状态栏 ESlint 是处于工作状态的。如果右下角看不到 Eslint 的标识，请按照上面讲过的步骤打开 `setting.json`，加上这行代码：
```js
"eslint.alwaysShowStatus": true,
```

![image](https://img-blog.csdnimg.cn/img_convert/e80a254f238a3505aa3531fe30aa9f5c.png)

配置完之后，VSCode 会根据你当前项目下的 `.eslintrc` 文件的规则来验证和格式化代码。

![](https://img-blog.csdnimg.cn/img_convert/2124694cc6805a78697657ba790f69a0.gif)



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
在根目录下的 `package.json` 文件的 `scripts` 选项里添加以下配置项：
```json
"scripts": {
  "lint": "eslint --ext .js,.ts,.tsx test/ src/",
},
```
`test/` `src/` 是你要校验的目录。修改完后，现在 ts 文件也可以自动格式化了。

![](https://img-blog.csdnimg.cn/img_convert/e990512dbf4bbf446017ec810b878ec1.gif)

如果你使用 `Vue-CLI` 创建项目，并且想要格式化 TypeScript 的代码，则需要在 `.eslintrc.js` 文件添加或修改以下几项：
```js
parser: 'vue-eslint-parser',
plugins: [
    '@typescript-eslint',
],
parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
},
```
这样就可以格式化 `.js` `.ts` `.vue` 文件了。
## stylelint 格式化代码
下载依赖
```
npm install --save-dev stylelint stylelint-config-standard
```
在项目根目录下新建一个 `.stylelintrc.js` 文件，并输入以下内容：
```js
module.exports = {
    extends: "stylelint-config-standard"
}
```
VSCode 添加 `stylelint` 插件：

![在这里插入图片描述](https://img-blog.csdnimg.cn/img_convert/afa020a625f5c5aee5fa304d35eb6682.png)

然后就可以看到效果了。

![在这里插入图片描述](https://img-blog.csdnimg.cn/img_convert/6156343f2a04454fa1d843f8bdecd07e.gif)

如果你想修改插件的默认规则，可以看[官方文档](https://github.com/stylelint/stylelint/blob/5a8465770b4ec17bb1b47f359d1a17132a204a71/docs/user-guide/rules/list.md)，它提供了 170 项规则修改。例如我想要用 4 个空格作为缩进，可以这样配置：
```js
module.exports = {
    "extends": "stylelint-config-standard",
    "rules": {
        "indentation": 4
    }
}
```

如果你想格式化 `sass` `scss` 文件，则需要下载 `stylelint-scss` `stylelint-config-standard-scss
` 插件：
```
npm i -D stylelint-scss stylelint-config-standard-scss
```
注意，要把 `stylelint-config-standard` 改成 `stylelint-config-standard-scss`，然后就可以格式化 scss 文件了。
```js
module.exports = {
    extends: "stylelint-config-standard-scss"
}
```
## 扩展

如何格式化 HTML、Vue（或其他后缀） 文件中的 HTML 代码？

`.vue` 文件的 HTML 代码可以使用 `eslint-plugin-vue` 插件来进行格式化：
```js
extends: [
    'plugin:vue/recommended', // 在 .eslintrc.js 文件中加上这一行代码
    '@vue/airbnb',
],
```

其他的 HTML 文件需要利用 VSCode 自带的格式化，快捷键是 `shift + alt + f`。假设当前 VSCode 已经打开了一个 HTML 文件，按下 `shift + alt + f` 会提示你选择一种格式化规范。如果没提示，那就是已经有默认的格式化规范了，然后 HTML 文件的所有代码都会格式化，并且格式化规则还可以自己配置。


## 踩坑
### `Unknown word (CssSyntaxError)` 错误
这个问题主要是因为 stylelint 升级到 14 大版本造成的。
#### 解决方案一
安装 stylelint 新的相关依赖：
```
npm i -D stylelint-config-recommended-vue stylelint-config-standard-scss postcss-html postcss-scss
```
然后修改 `.stylelintrc.js` 文件的配置项：
```js
extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue'
],
customSyntax: 'postcss-html',
overrides: [
    {
        files: ['**/*.{scss,css,sass}'], // css 相关文件由 postcss-scss 处理
        customSyntax: 'postcss-scss'
    },
],
```
这样修改以后，就不会再报错了。

如果出现 `Cannot find module 'postcss-scss'` 错误，请将 `node_modules` `package-lock.json` 文件删了重新安装。
#### 解决方案二
第二个解决方案就是将以上三个插件的版本降一个大版本就好了，最后的版本如下：
```
"stylelint": "^13.13.1",
"stylelint-config-standard": "^22.0.0",
"stylelint-scss": "^3.21.0",
```
同时需要将 VSCode 的 `stylelint` 插件降级，现在插件的最新版本是 1.0.3，不支持 `stylelint` 13 版本。点击插件旁边的小齿轮，再点 `Install Another Version`，选择其他版本进行安装。


![image.png](https://img-blog.csdnimg.cn/img_convert/05c8a3141c46f62b02f98785580c7dde.png)

选 `0.87.6` 版本安装就可以了，这时 css 自动格式化功能恢复正常。
### 忽略 `.vue` 文件中的 HTML 模板验证规则无效
举个例子，如果你将 HTML 模板每行的代码文本长度设为 100，当超过这个长度后 eslint 将会报错。此时如果你还是想超过这个长度，可以选择忽略这个规则：
```js
/* eslint-disable max-len */
```
注意，以上这行忽略验证的代码是不会生效的，因为这个注释是 JavaScript 注释，我们需要将注释改为 HTML 格式，这样忽略验证才会生效：
```html
<!-- eslint-disable max-len -->
```
