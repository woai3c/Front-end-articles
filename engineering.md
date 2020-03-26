# 前端工程化建设

随着浏览器和前端技术的发展，现在的前端项目越来越大、业务也越来越复杂，前端工程化已经成为一件势在必行的事情。

前端工程化其实就是软件工程在前端方向上的实施，不过篇幅有限，本文只讲解其中的几个点。

## 团队规范
如果前端团队只有一两个人，规范的作用微乎其微；但团队人数超过一定数量时，规范的作用就显现出来了。举个例子，拿代码风格规范来说，有些人喜欢用两个空格缩进，有些人喜欢用四个空格缩进，如果这两个人合作写一个项目，即使嘴上不说，心里也会相互吐槽。所以统一规范是非常有必要的，在制定规范前，大家可以相互讨论，提意见；规范制定后，所有人都得遵守，强制执行。

本文说的规范主要包括以下几种：
* 代码规范
* UI 规范
* 项目结构规范
* git commit 规范

#### 代码规范
代码规范的好处
* 规范的代码可以促进团队合作
* 规范的代码可以降低维护成本
* 规范的代码有助于代码审查
* 养成代码规范的习惯，有助于程序员自身的成长

每个程序员都不喜欢修改别人的代码，无论代码好坏，因为第一眼看上去没有熟悉感，下意识就会排斥。

所以当团队的成员都严格按照代码规范来写代码时，可以保证每个人的代码看起来都像是一个人写的，看别人的代码就像是在看自己的代码。

重要的是我们能够认识到规范的重要性，并坚持规范的开发习惯。

* [百度前端代码规范](https://github.com/ecomfe/spec)
* [Airbnb 翻译版](https://github.com/woai3c/javascript)
* [如何编写高质量代码](https://github.com/woai3c/Front-end-articles/blob/master/high-quality-code.md)

#### UI 规范
UI 规范需要前端、UI、产品沟通，互相商量，最后制定下来，建议使用统一的 UI 组件库。

制定 UI 规范的好处：
* 统一页面 UI 标准，节省 UI 设计时间
* 提高前端开发效率

#### 项目结构规范
项目结构规范包括文件命名、文件目录组织方式，用 Vue 项目举个例子。
```
├─public
├─src
├─tests
```
一个项目包含 public（公共资源，不会被 webpack 处理）、src（源码）、tests（测试），其中 src 目录，又可以细分。
```
├─api （接口）
├─assets （静态资源）
├─components （公共组件）
├─styles （公共样式）
├─router （路由）
├─store （vuex）
├─utils （工具函数）
└─views （页面）
```
每个前端团队的项目命名及组织方式都可能不一样，以上仅提供参考。
* [Vue 风格指南](https://cn.vuejs.org/v2/style-guide/)

#### git commit 规范
良好的 git commit 规范，让人只看描述就能明白这个 commit 是干什么的，提高解决 BUG 的效率。

推荐阅读： [git commit 提交规范](https://github.com/woai3c/Front-end-articles/blob/master/git%20commit%20style.md)。

#### 其他规范
除了上述几个规范，还有：
* 前后端接口规范
* 文档规范
* 代码分支规范
...

由于篇幅有限，并且研究不深，就只能到这了。

#### 执行

规范制定下来了，如何保证执行？

基本上都得靠代码审查以及测试人员测试，不过代码规范有一个工具能用得上，那就是 vscode + eslint 自动格式化代码。

推荐阅读： [ESlint + VSCode自动格式化代码(2020)](https://github.com/woai3c/Front-end-articles/blob/master/eslint-vscode-format.md)。


## 性能优化
前端性能优化是一个老生常谈的问题，网上关于性能优化的文章与书籍也有很多。我之前还写过一篇关于 JavaScript 性能优化的[文章](https://github.com/woai3c/Front-end-articles/blob/master/javascript-optimization.md)。

性能优化包括代码优化和非代码优化。

##### 代码优化
* 复用代码
* 避免全局变量
* 使用事件委托
* 使用Object/Array字面量
* 位操作在JavaScript中性能非常快，可以使用位运算来代替纯数学操作
...
##### 非代码优化
* 减少HTTP请求次数
* 使用CDN
* 使用缓存
* 压缩资源
* css 放头部，js 放底部
* 减少 DOM 操作
...

推荐阅读：
* [高性能网站建设指南](https://github.com/woai3c/recommended-books/blob/master/%E5%89%8D%E7%AB%AF/%E9%AB%98%E6%80%A7%E8%83%BD%E7%BD%91%E7%AB%99%E5%BB%BA%E8%AE%BE%E6%8C%87%E5%8D%97.pdf)
* [高性能网站建设进阶指南](https://github.com/woai3c/recommended-books/blob/master/%E5%89%8D%E7%AB%AF/%E9%AB%98%E6%80%A7%E8%83%BD%E7%BD%91%E7%AB%99%E5%BB%BA%E8%AE%BE%E8%BF%9B%E9%98%B6%E6%8C%87%E5%8D%97.pdf)
* [Web性能权威指南](https://github.com/woai3c/recommended-books/blob/master/%E5%89%8D%E7%AB%AF/Web%E6%80%A7%E8%83%BD%E6%9D%83%E5%A8%81%E6%8C%87%E5%8D%97.pdf)

## 测试
测试是前端工程化建设必不可少的一部分，它的作用就是找出 bug，越早发现 bug，所需要付出的成本就越低。

在前端测试中，单元测试和集成测试一般用得比较多，工具也有很多，例如 Karma + Mocha + PhantomJS / Chai 等。

但是自动化测试工具可以说几乎没有，因为 UI 界面自动化测试太难了，目前只能靠人工测试。

* [张云龙-如何进行前端自动化测试？](https://www.zhihu.com/question/29922082/answer/46141819)
* [Jest](https://jestjs.io/zh-Hans/)
* [Mocha](https://mochajs.cn/)
* [Karma](https://github.com/karma-runner/karma)
## 构建、部署
得益于 node 和 webpack 的发展，自动化构建不再是梦。通过 webpack 以及相关配置，一行命令就可以做到下列所有事情：
* 代码检查
* 单元测试、集成测试
* 语言编译
* 依赖分析、打包、替换等
* 代码压缩、图片压缩等

自动化部署通过 Jenkins、Docker 等工具也可以很方便的实现。


推荐阅读：[yumminhuang-如何理解持续集成、持续交付、持续部署？](https://www.zhihu.com/question/23444990/answer/89426003)
## 性能和错误监控
**性能监控**
前端页面性能是一个非常核心的用户体验指标，影响到了用户的留存率，如果一个页面性能太差，用户等待时间过长，很有可能就直接离开了。

**错误监控** 
因为测试永远无法做到100%覆盖，用户也不会总是按照我们所预期的进行操作，因此当生产环境出现 bug 时，需要对其进行收集。

监控是前端工程化建设中的最后一环，当项目上线后，通过监控系统可以了解到项目在生产环境中的运行情况，开发团队可以根据监控报告对项目做进一步的调整和优化。

目前市面上有大量成熟的监控产品可以使用，对于没有精力开发监控系统的团队来说，可以算是一个好消息。此前我还针对监控系统进行了一番调查和研究，
并写了一篇文章，对监控系统原理有兴趣的可以看一下，[前端性能和错误监控](https://github.com/woai3c/Front-end-articles/blob/master/monitor.md)。
