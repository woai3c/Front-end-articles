## 编译原理实战入门：用 JavaScript 写一个简单的四则运算编译器（三）模拟执行
现在来模拟一下 CPU 执行机器指令的情况，由于汇编代码和机器指令一一对应，所以我们可以创建一个直接执行汇编代码的模拟器。
在创建模拟器前，先来讲解一下相关指令的操作。
* 栈

在内存中，栈的特点是只能在同一端进行插入和删除的操作，即只有 push 和 pop 两种操作。

* push

push 指令的作用是将一个操作数推入栈中。

* pop

pop 指令的作用是将一个操作数弹出栈。

* add

add 指令的作用是执行两次 pop 操作，弹出两个操作数 a 和 b，然后执行 a + b，再将结果 push 到栈中。

* sub

sub 指令的作用是执行两次 pop 操作，弹出两个操作数 a 和 b，然后执行 a - b，再将结果 push 到栈中。

* mul

mul 指令的作用是执行两次 pop 操作，弹出两个操作数 a 和 b，然后执行 a * b，再将结果 push 到栈中。

* div

sub 指令的作用是执行两次 pop 操作，弹出两个操作数 a 和 b，然后执行 a / b，再将结果 push 到栈中。

四则运算的所有指令已经讲解完毕了，是不是觉得很简单？

### 代码实现
注意：需要引入前两篇文章词法分析和语法分析的代码
```js
function CpuEmulator(instructions) {
    this.ins = instructions.split('\r\n')
    this.memory = []
    this.re = /^(push)\s\w+/
    this.execute()
}

CpuEmulator.prototype = {
    execute() {
        this.ins.forEach(i => {
            switch (i) {
                case 'add':
                    this.add()
                    break
                case 'sub':
                    this.sub()
                    break
                case 'mul':
                    this.mul()
                    break
                case 'div':
                    this.div()
                    break                
                default:
                    if (this.re.test(i)) {
                        this.push(i.split(' ')[1])
                    }
            }
        })
    },

    add() {
        const b = this.pop()
        const a = this.pop()
        this.memory.push(a + b)
    },

    sub() {
        const b = this.pop()
        const a = this.pop()
        this.memory.push(a - b)
    },

    mul() {
        const b = this.pop()
        const a = this.pop()
        this.memory.push(a * b)
    },

    div() {
        const b = this.pop()
        const a = this.pop()
        this.memory.push(a / b)
    },

    push(x) {
        this.memory.push(parseInt(x))
    },

    pop() {
        return this.memory.pop()
    },

    getResult() {
        return this.memory[0]
    }
}

const tokens = lexicalAnalysis('(100+  10)*  10-100/  10      +8*  (4+2)')
const writer = new AssemblyWriter()
const parser = new Parser(tokens, writer)
const instructions = parser.getInstructions()
const emulator = new CpuEmulator(instructions)
console.log(emulator.getResult()) // 1138
```
* [编译原理实战入门：用 JavaScript 写一个简单的四则运算编译器（一）词法分析](https://github.com/woai3c/Front-end-articles/blob/master/four-operations-1.md)
* [编译原理实战入门：用 JavaScript 写一个简单的四则运算编译器（二）语法分析](https://github.com/woai3c/Front-end-articles/blob/master/four-operations-2.md)
* [编译原理实战入门：用 JavaScript 写一个简单的四则运算编译器（三）模拟执行](https://github.com/woai3c/Front-end-articles/blob/master/four-operations-3.md)
* [编译原理实战入门：用 JavaScript 写一个简单的四则运算编译器（四）结语](https://github.com/woai3c/Front-end-articles/blob/master/four-operations-4.md)
* [完整源码](https://github.com/woai3c/Front-end-articles/blob/master/code/four-operations/code.js)
## 参考资料：[计算机系统要素](https://book.douban.com/subject/1998341/)
