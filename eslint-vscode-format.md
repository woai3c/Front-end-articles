# ESlint + VSCode自动格式化代码(2020)

## eslint 格式化 js 代码
本文用 Vue 项目做示范。

利用 Vue CLI 创建项目时要将 ESlint 选上，下载完依赖后，用 VSCode 打开项目。

安装插件 ESLint，然后 `File` -> `Preference`-> `Settings`（如果装了中文插件包应该是 文件 -> 选项 -> 设置），搜索 eslint，点击 Edit in setting.json
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191128173335896.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)
将以下选项添加到配置文件

```js
    "editor.codeActionsOnSave": {
        "source.fixAll": true,
    },
```
配置完之后，VSCode 会根据你当前 Vue 项目下的 `.eslintrc.js` 文件的规则来验证和格式化代码。

PS：自动格式化代码在保存时自动触发，目前试了 JS 以及 vue 文件中的 JS 代码都没问题，html 和 vue 中的 html 和 css 无效。

#### TypeScript
TypeScript 如果想要自动格式化，需要在 npm 和 vscode 下载 tsilnt 插件：
```
npm i -D tslint
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200814102540832.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70#pic_center)
然后再配置好你项目里的的 jslint 配置文件，它无法和 eslint 的配置文件共用，规则也不一样。

不过我发现 tslint 有点缺陷，例如无法自动格式化缩进，这个可以用 `shift + alt + f` 来实现。

### 扩展
其实还是有办法格式化 vue 文件中的 html 和 css 代码的，利用 vscode 自带的格式化，快捷键是 `shift + alt + f`，假设你当前 vscode 打开的是一个 vue 文件，按下 `shift + alt + f` 会提示你选择一种格式化规范，如果没提示，那就是已经有默认的格式化规范了（一般是 vetur 插件），然后 vue 文件的所有代码都会格式化，并且格式化规则还可以自己配置，如下图所示，可以根据自己的喜好来选择格式化规则。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191129133359274.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)
因为之前已经设置过 eslint 的格式化规则了，所以 vue 文件只需要格式化 html 和 css 中的代码，不需要格式化 javascript 代码，我们可以这样配置来禁止 vetur 格式化 javascript 代码：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191129133619564.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)
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

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020110620542255.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70#pic_center)
然后就可以看到效果了。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201106205719945.gif#pic_center)
如果你想修改插件的默认规则，可以看[官方文档](https://github.com/stylelint/stylelint/blob/5a8465770b4ec17bb1b47f359d1a17132a204a71/docs/user-guide/rules/list.md)，它提供了 170 项规则修改。例如我想要用 4 个空格作为缩进，可以这样配置：
```json
{
    "extends": "stylelint-config-standard",
    "rules": {
        "indentation": 4
    }
}
```
