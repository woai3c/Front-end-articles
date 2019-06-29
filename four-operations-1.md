## 编译原理实战入门：用 JavaScript 写一个简单的四则运算编译器（一）词法分析

### 编译器
编译器是一个程序，作用是将一门语言翻译成另一门语言。

一般的程序，CPU 是无法直接执行的，因为 CPU 只能识别机器指令。所以要想执行一个程序，首先要将高级语言编写的程序翻译为汇编代码，再将汇编代码翻译为机器指令，这样 CPU 才能识别并执行。

示例：
```js
// CPU 无法识别
10 + 5

// 翻译成汇编语言
push 10
push 5
add

// 最后翻译为机器指令 汇编代码和机器指令一一对应
// 机器指令由 1 和 0 组成，以下指令非真实指令，只做演示用
0011101001010101
1101010011100101
0010100111100001
```
学会编译原理有什么好处？

对编译过程内部原理的掌握将会使你成为更好的高级程序员。

### 词法分析
程序最简单的语法形式就是存储在文本文件中的一系列字符，词法分析就是将字符分解成字元（token，也称为终结符），忽略空格和注释。

示例：
```js
// 程序代码
10 + 5 + 6

// 词法分析后得到的 token
10
+
5
+
6
```

#### 终结符
终结符就是语言中用到的基本元素,一般不能再被分解。

四则运算中的终结符包括符号和整数常量。

**符号**：`+` `-` `*` `/` `(` `)` `~`

**整数常量**：12、1000、111...

### 代码示例
来看看怎么将一个四则运算表达式分解成 token
```js
const symbol = ['(', ')', '+', '-', '*', '/']
const re = /\d/

function lexicalAnalysis(expression) {
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

console.log(lexicalAnalysis('100    +   23   +    34 * 10 / 2')) 
// ["100", "+", "23", "+", "34", "*", "10", "/", "2"]
```
