# Make a tiny browser engine from scratch

## Introduction
Browser rendering principles are essential knowledge for frontend developers and are frequently discussed in interviews and frontend training courses. You can also find related descriptions in [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work).

As a seasoned frontend developer, I understand browser rendering principles, but my knowledge has been limited to theoretical aspects. Therefore, I decided to build a tiny browser engine from scratch.

The rendering engine is a component of the browser that transforms source code (HTML, CSS, JavaScript) into a format that users can read, view, and hear. However, implementing a complete browser engine alone would be too challenging and time-consuming. So, I decided to take a step back and create a tiny browser engine instead. I happened to find an open-source toy rendering engine called [Robinson](https://github.com/mbrubeck/robinson) written in Rust on Github, which inspired me to create my own version using JavaScript. I've also published it on Github as [tiny-rendering-engine](https://github.com/woai3c/tiny-rendering-engine).

This tiny rendering engine consists of five phases:

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/db9434b91f831ee82c3ed0405dd37d19.png)

1. Parse HTML and generate DOM tree
2. Parse CSS and generate CSS rule collection
3. Combine DOM tree and CSS rules to create Style tree
4. Generate Layout tree
5. Painting

I've created separate branches on Github for the code of each phase. Since understanding the entire rendering engine's code at once might be challenging, I advise starting with the first branch and progressing step by step, from easy to difficult, for better learning efficiency.

1. HTML parser - [v1 branch](https://github.com/woai3c/tiny-rendering-engine/tree/v1)
2. CSS parser - [v2 branch](https://github.com/woai3c/tiny-rendering-engine/tree/v2)
3. Style tree - [v3 branch](https://github.com/woai3c/tiny-rendering-engine/tree/v3)
4. Layout tree - [v4 branch](https://github.com/woai3c/tiny-rendering-engine/tree/v4)
5. Painting - [v5 branch](https://github.com/woai3c/tiny-rendering-engine/tree/v5)

Now, let's look at how to create an HTML parser.

## HTML parser
The purpose of the HTML parser is to transform HTML code into a DOM tree. For example:
```html
<div class="lightblue test" id=" div " data-index="1">test!</div>
```
The above of HTML code will be transforming as a DOM tree:
```json
{
    "tagName": "div",
    "attributes": {
        "class": "lightblue test",
        "id": "div",
        "data-index": "1"
    },
    "children": [
        {
            "nodeValue": "test!",
            "nodeType": 3
        }
    ],
    "nodeType": 1
}
```
Writing a parser requires some knowledge of compilation principles such as lexical analysis and syntactic analysis. However, our tiny parser is very simple, so it's okay even if you don't understand these principles - you'll understand once you see the code.

Looking back at the HTML code above, the entire parsing process is shown in the following picture. 

![HTML parsing process](https://i-blog.csdnimg.cn/blog_migrate/1249487abc7d4bc32a38168db68d5b64.png)

Each piece of HTML code has its corresponding parsing method.

To simplify the HTML parser, we need to add some restrictions:
1. HTML tag must be shown with a pair: `<div>...</div>`
2. HTML attribute value must be quoted: `<div class="test">...</div>`
3. Don't support comments
4. No need for most error handling
5. Only support two nodes: `Element` and `Text`

With these restrictions, the HTML parser will be simpler.

### Node Types
First, we need to design data structure to support different node types:
```ts
export enum NodeType {
    Element = 1,
    Text = 3,
}

export interface Element {
    tagName: string
    attributes: Record<string, string>
    children: Node[]
    nodeType: NodeType.Element
}

interface Text {
    nodeValue: string
    nodeType: NodeType.Text
}

export type Node = Element | Text
```
And then we need two create function:
```ts
export function element(tagName: string) {
    return {
        tagName,
        attributes: {},
        children: [],
        nodeType: NodeType.Element,
    } as Element
}

export function text(data: string) {
    return {
        nodeValue: data,
        nodeType: NodeType.Text,
    } as Text
}
```
These two functions will return corresponding DOM nodes when they are called in parsing Element code or Text code.

### HTML Parser Execution Process
The following diagram shows the execution process of the HTML parser:
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/df2f04ff5b19a6867d899d182ff183a9.png)

The entry point of the HTML parser is the `parse()` method, which traverses and parses all HTML text until the end:

1. Check if the current character is `<`. If it is, parse it as an `Element` node by calling `parseElement()`; otherwise, call `parseText()`.

2. `parseText()` is relatively simple - it traverses forward through the string until encountering the `<` character. All characters between the current position and the `<` character become the value of the `Text` node.

3. `parseElement()` is more complex. First, it calls `parseTag()` to parse and obtain the element's tag name.

4. Then it enters the `parseAttrs()` method to check for attribute nodes. If the node has a `class` or other HTML attributes, it calls `parseAttr()` to parse these attributes.

5. At this point, the first half of the element node has been parsed. Next, it needs to parse the element's child nodes. This creates a recursive process, returning to step 1.

6. After all child nodes are parsed, it calls `parseTag()` to verify that the ending tag name matches the starting tag name. If they match, `parseElement()` or `parse()` completes; otherwise, it throws an error. 

### Detailed Implementation of HTML Parser Methods
#### Entry point `parse()`
The entry point of the HTML parser is `parse(rawText)`:
```ts
parse(rawText: string) {
    this.rawText = rawText.trim()
    this.len = this.rawText.length
    this.index = 0
    this.stack = []

    const root = element('root')
    while (this.index < this.len) {
        this.removeSpaces()
        if (this.rawText[this.index].startsWith('<')) {
            this.index++
            this.parseElement(root)
        } else {
            this.parseText(root)
        }
    }
}
```
The `parse()` method traverses through the entire HTML text. It first checks if the current character is `<`. If it is, the text is treated as an Element node and `parseElement()` is called; otherwise, it's treated as a Text node and `parseText()` is called.

#### Parse Element Node `parseElement()`
```ts
private parseElement(parent: Element) {
	// 解析标签
    const tag = this.parseTag()
    // 生成元素节点
    const ele = element(tag)

    this.stack.push(tag)

    parent.children.push(ele)
    // 解析属性
    this.parseAttrs(ele)

    while (this.index < this.len) {
        this.removeSpaces()
        if (this.rawText[this.index].startsWith('<')) {
            this.index++
            this.removeSpaces()
            // 判断是否是结束标签
            if (this.rawText[this.index].startsWith('/')) {
                this.index++
                const startTag = this.stack[this.stack.length - 1]
                // 结束标签
                const endTag = this.parseTag()
                if (startTag !== endTag) {
                    throw Error(`The end tagName ${endTag} does not match start tagName ${startTag}`)
                }

                this.stack.pop()
                while (this.index < this.len && this.rawText[this.index] !== '>') {
                    this.index++
                }

                break
            } else {
                this.parseElement(ele)
            }
        } else {
            this.parseText(ele)
        }
    }

    this.index++
}
```
`parseElement()` first calls `parseTag()` and `parseAttrs()` to parse the tag name and attributes, then recursively parses child nodes until all HTML text has been processed.

#### Parse Text Node `parseText()`
```ts
private parseText(parent: Element) {
    let str = ''
    while (
        this.index < this.len
        && !(this.rawText[this.index] === '<' && /\w|\//.test(this.rawText[this.index + 1]))
    ) {
        str += this.rawText[this.index]
        this.index++
    }

    this.sliceText()
    parent.children.push(text(removeExtraSpaces(str)))
}
```
Parsing text nodes is relatively simpler. The method continues to traverse forward until it encounters the `<` character. For example, when processing the HTML text `<div>test!</div>`, `parseText()` extracts the value `test!`.

#### Parse Tag `parseTag()`
After entering `parseElement()`, the first call is to `parseTag()`, which parses the tag name:
```ts
private parseTag() {
    let tag = ''

    this.removeSpaces()

    // get tag name
    while (this.index < this.len && this.rawText[this.index] !== ' ' && this.rawText[this.index] !== '>') {
        tag += this.rawText[this.index]
        this.index++
    }

    this.sliceText()
    return tag
}
```
For example, when processing the HTML text `<div>test!</div>`, `parseTag()` extracts the tag name `div`.

#### Parse Attribute Nodes `parseAttrs()`
After parsing the tag name, the next step is to parse attribute nodes:
```ts
private parseAttrs(ele: Element) {
    // Continue traversing until encountering '>', indicating the end of the <div ....> segment
    while (this.index < this.len && this.rawText[this.index] !== '>') {
        this.removeSpaces()
        this.parseAttr(ele)
        this.removeSpaces()
    }

    this.index++
}

// 解析单个属性，例如 class="foo bar"
private parseAttr(ele: Element) {
    let attr = ''
    let value = ''
    while (this.index < this.len && this.rawText[this.index] !== '=' && this.rawText[this.index] !== '>') {
        attr += this.rawText[this.index++]
    }

    this.sliceText()
    attr = attr.trim()
    if (!attr.trim()) return

    this.index++
    let startSymbol = ''
    if (this.rawText[this.index] === "'" || this.rawText[this.index] === '"') {
        startSymbol = this.rawText[this.index++]
    }

    while (this.index < this.len && this.rawText[this.index] !== startSymbol) {
        value += this.rawText[this.index++]
    }

    this.index++
    ele.attributes[attr] = value.trim()
    this.sliceText()
}
```
`parseAttr()` can parse HTML text such as `class="test"` into an object `{ class: "test" }`.

#### Helper Methods
Sometimes there are many unnecessary spaces between different nodes and attributes, so we need a method to remove them:
```ts
protected removeSpaces() {
    while (this.index < this.len && (this.rawText[this.index] === ' ' || this.rawText[this.index] === '\n')) {
        this.index++
    }

    this.sliceText()
}
```
For debugging purposes, developers need to check the current character being processed. If all previously processed characters remain in the text, debugging becomes more difficult as developers need to manually find the current character based on the index value. Therefore, we need to remove all processed characters to ensure only unprocessed text remains:
```ts
protected sliceText() {
    this.rawText = this.rawText.slice(this.index)
    this.len = this.rawText.length
    this.index = 0
}
```
The `sliceText()` method removes all processed characters. For example, when parsing the tag name `div`:
[img]()

After parsing, we need to remove the processed text, as shown in the following diagram:
[img]()

### Brief summary
In conclusion, we have covered the complete logic of the HTML parser. The entire implementation consists of approximately 200 lines of code, or around 100 lines excluding TypeScript type declarations.


## CSS Parser
CSS stylesheet is a collection of CSS rules, and the purpose of CSS parser is to transform CSS text into a CSS rule collection.
```css
div, p {
    font-size: 88px;
    color: #000;
}
```

For example, the CSS parser will transform the above CSS text into the following CSS rule collection:
```json
[
    {
        "selectors": [
            {
                "id": "",
                "class": "",
                "tagName": "div"
            },
            {
                "id": "",
                "class": "",
                "tagName": "p"
            }
        ],
        "declarations": [
            {
                "name": "font-size",
                "value": "88px"
            },
            {
                "name": "color",
                "value": "#000"
            }
        ]
    }
]
```

Each rule has a `selectors` and `declarations` attribute, where `selectors` indicates CSS selectors, and `declarations` indicates a collection of CSS property declarations.
```ts
export interface Rule {
    selectors: Selector[]
    declarations: Declaration[]
}

export interface Selector {
    tagName: string
    id: string
    class: string
}

export interface Declaration {
    name: string
    value: string | number
}
```

![CSS Rule Structure](https://i-blog.csdnimg.cn/blog_migrate/2c3b148abca60a3384ffa184c5165efe.png)

Each CSS rule can contain multiple selectors and CSS properties.

### Parse CSS Rule `parseRule()`
```ts
private parseRule() {
    const rule: Rule = {
        selectors: [],
        declarations: [],
    }

    rule.selectors = this.parseSelectors()
    rule.declarations = this.parseDeclarations()

    return rule
}
```

In `parseRule()`, it calls `parseSelectors()` to parse CSS selectors, and then calls `parseDeclarations()` to parse CSS properties from the remaining CSS text.

### Parse Selector `parseSelector()`
```ts
private parseSelector() {
    const selector: Selector = {
        id: '',
        class: '',
        tagName: '',
    }

    switch (this.rawText[this.index]) {
        case '.':
            this.index++
            selector.class = this.parseIdentifier()
            break
        case '#':
            this.index++
            selector.id = this.parseIdentifier()
            break
        case '*':
            this.index++
            selector.tagName = '*'
            break
        default:
            selector.tagName = this.parseIdentifier()
    }

    return selector
}

private parseIdentifier() {
    let result = ''
    while (this.index < this.len && this.identifierRE.test(this.rawText[this.index])) {
        result += this.rawText[this.index++]
    }

    this.sliceText()
    return result
}
```

We only support tag names, ID selectors with the `#` prefix, class selectors with the `.` prefix, or combinations of these. If the tag name is `*`, it represents a universal selector that can match any tag.

The standard CSS parser will skip unrecognized parts and continue parsing the remaining CSS text. This behavior ensures compatibility with older browsers and prevents program interruption due to errors. Our CSS parser is simpler and doesn't include such error handling.

### Parse CSS Properties `parseDeclaration()`
```ts
private parseDeclaration() {
    const declaration: Declaration = { name: '', value: '' }
    this.removeSpaces()
    declaration.name = this.parseIdentifier()
    this.removeSpaces()

    while (this.index < this.len && this.rawText[this.index] !== ':') {
        this.index++
    }

    this.index++ // clear :
    this.removeSpaces()
    declaration.value = this.parseValue()
    this.removeSpaces()

    return declaration
}
```

`parseDeclaration()` will parse CSS text such as `color: red;` into an object `{ name: "color", value: "red" }`.

### Summary
The CSS parser is relatively simpler since most concepts have been covered in the HTML parser section. The entire CSS parser's code is approximately 100 lines, and if you have read the HTML parser's code, you should find the CSS parser's code easier to understand.
