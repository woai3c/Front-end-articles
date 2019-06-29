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

先来看看怎么分析一个四则运算表达式 `1 + 2 * 3`。

首先匹配的是 `expression`，由于目前 `expression` 往下分只有一种可能，即  `addExpression`，所以分解为 `addExpression`。
依次类推，接下来的顺序为 `mulExpression`、`term`、`1`、`+`、`mulExpression`、`term`、`2`、`*`、`mulExpression`、`term`、`3`。

如下图所示：

![img](https://github.com/woai3c/Front-end-articles/blob/master/imgs/four-operation.jpg)

这里可能会有人有疑问，为什么一个表达式搞得这么复杂，`expression` 下面有 `addExpression`，`addExpression` 下面还有 `mulExpression`。
其实这里是为了考虑将来能继续扩展以及运算符优先级。
```
1 + 2 * 3
compileExpression
   | compileAddExpr
   |  | compileMultExpr
   |  |  | compileTerm
   |  |  |  |_ matches integerConstant		push 1
   |  |  |_
   |  | matches '+'
   |  | compileMultExpr
   |  |  | compileTerm
   |  |  |  |_ matches integerConstant		push 2
   |  |  | matches '*'
   |  |  | compileTerm
   |  |  |  |_ matches integerConstant		push 3
   |  |  |_ compileOp('*')                *
   |  |_ compileOp('+')                   +
   |_
 ```

### 代码示例
编译原理的理论知识像天书，看得云里雾里，但真正动手做起来，你会发现，其实还挺简单的。

如果上面的理论知识看不太懂，没关系，先看代码，再和理论知识结合起来看。

代码示例包括词法分析、语法分析、代码生成、错误报告（生成的代码为汇编代码）。
```js
// 词法分析 输出 tokens
function lexicalAnalysis(expression) {
    const symbol = ['(', ')', '+', '-', '*', '/']
    const re = /\d/
    const tokens = []
    const chars = expression.trim().split('')
    let token = ''
    chars.forEach(c => {
        if (re.test(c)) {
            token += c
        } else if (c == ' ' && token) {
            tokens.push(token)
            token = ''
        } else if (symbol.includes(c)) {
            if (token) {
                tokens.push(token)
                token = ''
            } 

            tokens.push(c)
        }
    })

    if (token) {
        tokens.push(token)
    }

    return tokens
}

// 汇编代码生成器
function AssemblyWriter() {
    this.output = ''
}

AssemblyWriter.prototype = {
    writePush(digit) {
        this.output += `push ${digit}\r\n`
    },

    writeOP(op) {
        this.output += op + '\r\n'
    },

    //输出汇编代码
    outputStr() {
        return this.output
    }
}

// 语法分析器
function Parser(tokens, writer) {
    this.writer = new AssemblyWriter()
    this.tokens = tokens
    // tokens 数组索引
    this.i = -1
    this.opMap1 = {
        '+': 'add',
        '-': 'sub',
    }

    this.opMap2 = {
        '/': 'div',
        '*': 'mul'
    }

    this.init()
}

Parser.prototype = {
    init() {
        this.compileExpression()
    },

    compileExpression() {
        this.compileAddExpr()
    },

    compileAddExpr() {
        this.compileMultExpr()
        while (true) {
            this.getNextToken()
            if (this.opMap1[this.token]) {
                let op = this.opMap1[this.token]
                this.compileMultExpr()
                this.writer.writeOP(op)
            } else {
                this.i--
                break
            }
        }
    },

    compileMultExpr() {
        this.compileTerm()
        while (true) {
            this.getNextToken()
            if (this.opMap2[this.token]) {
                let op = this.opMap2[this.token]
                this.compileTerm()
                this.writer.writeOP(op)
            } else {
                this.i--
                break
            }
        }
    },

    compileTerm() {
        this.getNextToken()
        if (this.token == '(') {
            this.compileExpression()
            this.getNextToken()
            if (this.token != ')') {
                throw '缺少右括号：)'
            }
        } else if (/^\d+$/.test(this.token)) {
            this.writer.writePush(this.token)
        } else {
            throw '错误的 token：第 ' + (this.i + 1) + ' 个 token (' + this.token + ')'
        }
    },

    getNextToken() {
        this.token = this.tokens[++this.i]
    },

    getInstructions() {
        return this.writer.outputStr()
    }
}

const tokens = lexicalAnalysis('100+10*10')
const writer = new AssemblyWriter()
const parser = new Parser(tokens, writer)
const instructions = parser.getInstructions()
console.log(instructions)
/*
push 100
push 10
push 10
mul
add
*/
```
