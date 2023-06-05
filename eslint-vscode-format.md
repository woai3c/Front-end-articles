# ESlint + Stylelint + VSCode自动格式化代码(2023)
## eslint 格式化代码
本文用 [Vue 项目](https://github.com/woai3c/vite-vue3-eslint-stylelint-demo)做示范。

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


下载插件
```
npm i -D eslint eslint-config-airbnb-vue3-ts
```
添加 `.eslintrc` 文件，具体配置项为：
```js
module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es6: true,
        jest: true,
    },
    extends: ['eslint-config-airbnb-vue3-ts'],
    rules: {
        
    },
}

```
在根目录下的 `package.json` 文件的 `scripts` 选项里添加以下配置项：
```json
"scripts": {
  "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
},
```
修改完后，现在 js ts vue 文件都可以自动格式化了。

![](https://img-blog.csdnimg.cn/img_convert/e990512dbf4bbf446017ec810b878ec1.gif)
## stylelint 格式化代码
下载依赖
```
npm i -D sass stylelint stylelint-config-standard-scss stylelint-scss
```
在项目根目录下新建一个 `.stylelintrc.js` 文件，并输入以下内容：
```js
module.exports = {
    extends: [
        'stylelint-config-standard-scss',
    ],
    rules: {
        indentation: 4,
        'media-feature-range-notation': null,
        'alpha-value-notation': ['number'],
        'color-function-notation': ['legacy'],
        'no-descending-specificity': null,
        'font-family-no-missing-generic-family-keyword': null,
        'selector-type-no-unknown': null,
        'at-rule-no-unknown': null,
        'no-duplicate-selectors': null,
        'no-empty-source': null,
        'selector-class-pattern': null,
        'selector-pseudo-class-no-unknown': [
            true,
            { ignorePseudoClasses: ['global', 'deep'] },
        ],
        'scss/at-rule-no-unknown': [
            true,
            {
                ignoreAtRules: ['tailwind'],
            },
        ],
    },
};

```
VSCode 添加 `stylelint` 插件：

![在这里插入图片描述](https://img-blog.csdnimg.cn/img_convert/afa020a625f5c5aee5fa304d35eb6682.png)

然后就可以看到效果了。

![在这里插入图片描述](https://img-blog.csdnimg.cn/img_convert/6156343f2a04454fa1d843f8bdecd07e.gif)

如果你想修改插件的默认规则，可以看[官方文档](https://github.com/stylelint/stylelint/blob/5a8465770b4ec17bb1b47f359d1a17132a204a71/docs/user-guide/rules/list.md)，它提供了 170 项规则修改。
## 扩展

如何格式化 HTML 文件中的代码？这需要利用 VSCode 自带的格式化，快捷键是 `shift + alt + f`。假设当前 VSCode 已经打开了一个 HTML 文件，按下 `shift + alt + f` 会提示你选择一种格式化规范。如果没提示，那就是已经有默认的格式化规范了，然后 HTML 文件的所有代码都会格式化，并且格式化规则还可以自己配置。

## 踩坑
### 忽略 `.vue` 文件中的 HTML 模板验证规则无效
举个例子，如果你将 HTML 模板每行的代码文本长度设为 100，当超过这个长度后 eslint 将会报错。此时如果你还是想超过这个长度，可以选择忽略这个规则：
```js
/* eslint-disable max-len */
```
注意，以上这行忽略验证的代码是不会生效的，因为这个注释是 JavaScript 注释，我们需要将注释改为 HTML 格式，这样忽略验证才会生效：
```html
<!-- eslint-disable max-len -->
```
