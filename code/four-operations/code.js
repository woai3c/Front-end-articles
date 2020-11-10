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
    this.writer = writer
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
                // 没有匹配上相应的操作符 这里为没有匹配上 + - 
                // 将 token 索引后退一位
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
                // 没有匹配上相应的操作符 这里为没有匹配上 * / 
                // 将 token 索引后退一位
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
        // 不支持浮点运算，所以在这要取整
        this.memory.push(Math.floor(a / b))
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

const tokens = lexicalAnalysis('10-8')
const writer = new AssemblyWriter()
const parser = new Parser(tokens, writer)
const instructions = parser.getInstructions()
const emulator = new CpuEmulator(instructions)
console.log(emulator.getResult())
