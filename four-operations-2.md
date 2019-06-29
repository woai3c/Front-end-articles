## 编译原理实战入门：用 JavaScript 写一个简单的四则运算编译器（二）语法分析
### 四则运算的语法规则（语法规则是分层的）
1. x* 表示 x 出现零次或多次
2. x | y 表示 x 或 y 将出现
3. ( ) 圆括号，用于语言构词的分组

* **expression**: addExpression
* **addExpression**: mulExpression (op mulExpression)*
* **mulExpression**: term (op term)*
* **term**: '(' expression ')' | integerConstant
* **op**: + - * /

PS: `addExpression` 对应 `+` `-` 表达式，`mulExpression` 对应 `*` `/` 表达式。

### 语法分析
对输入的文本进行分析并确定其语法结构的一种过程，称为语法分析。

一般语法分析的输出为抽象语法树（AST）或语法分析树（parse tree）。但由于四则运算比较简单，所以这里采取的方案是即时地进行代码生成和错误报告，这样就不需要在内存中保存整个程序结构。

先来看看怎么分析一个四则运算表达式 `1 + 2 * 3`

首先匹配的是 `expression`，由于目前 `expression` 往下分只有一种可能，即  `addExpression`，所以分解为 `addExpression`。

依次类推，接下来的顺序为 `mulExpression`、`term`、`1`、`op`、`+`、`mulExpression`、`term`、`2`、`op`、`*`、`mulExpression`、`term`、`3`

如下图所示

![img](https://github.com/woai3c/Front-end-articles/blob/master/imgs/four-operation.jpg)

这里可能会有人有疑问，为什么一个表达式搞得这么复杂，`expression` 下面有 `addExpression`，`addExpression` 下面还有 `mulExpression`。
其实这里是为了考虑将来能继续扩展以及运算符优先级。
