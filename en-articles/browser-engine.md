# Make a tiny browser engine from scratch

## Introduction
Browser rendering principles are essential knowledge for frontend developers and are frequently discussed in interviews and frontend training courses. You can also find related descriptions in [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work).

As a seasoned frontend developer, I understand browser rendering principles, but my knowledge has been limited to theoretical aspects. Therefore, I decided to build a tiny browser engine from scratch.

The rendering engine is a component of the browser that transforms source code (HTML, CSS, JavaScript) into a format that users can read, view, and hear. However, implementing a complete browser engine alone would be too challenging and time-consuming. So, I decided to take a step back and create a tiny browser engine instead. I happened to find an open-source toy rendering engine called [Robinson](https://github.com/mbrubeck/robinson) written in Rust on Github, which inspired me to create my own version using JavaScript. I've also published it on Github as [tiny-rendering-engine](https://github.com/woai3c/tiny-rendering-engine).

This tiny rendering engine consists of five phases:

![Rendering engine](https://i-blog.csdnimg.cn/blog_migrate/db9434b91f831ee82c3ed0405dd37d19.png)

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

### Brief Summary
The CSS parser is relatively simpler since most concepts have been covered in the HTML parser section. The entire CSS parser's code is approximately 100 lines, and if you have read the HTML parser's code, you should find the CSS parser's code easier to understand.


## Build Style Tree
The purpose of this phase is to write a style tree builder that takes a DOM tree and a collection of CSS rules as input and generates a style tree.
![img](https://i-blog.csdnimg.cn/blog_migrate/db9434b91f831ee82c3ed0405dd37d19.png)

Each node in the style tree contains CSS property values and a reference to its corresponding DOM node:
```ts
interface AnyObject {
    [key: string]: any
}

export interface StyleNode {
    node: Node // DOM node
    values: AnyObject // style property values
    children: StyleNode[] // style tree children
}
```

Let's look at a simple example:
```html
<div>test</div>
```
```css
div {
    font-size: 88px;
    color: #000;
}
```

The above HTML and CSS will be transformed by the style builder into a style tree:
```json
{
    "node": { // DOM node
        "tagName": "div",
        "attributes": {},
        "children": [
            {
                "nodeValue": "test",
                "nodeType": 3
            }
        ],
        "nodeType": 1
    },
    "values": { // CSS property values
        "font-size": "88px",
        "color": "#000"
    },
    "children": [ // style tree children
        {
            "node": {
                "nodeValue": "test",
                "nodeType": 3
            },
            "values": { // text node inherits parent's styles
                "font-size": "88px",
                "color": "#000"
            },
            "children": []
        }
    ]
}
```
### Traverse DOM Tree
Now we need to traverse the DOM tree and check if each node matches any CSS rules.
```ts
export function getStyleTree(eles: Node | Node[], cssRules: Rule[], parent?: StyleNode) {
    if (Array.isArray(eles)) {
        return eles.map((ele) => getStyleNode(ele, cssRules, parent))
    }

    return getStyleNode(eles, cssRules, parent)
}
```
### Match Selector
The selector matching is easier to implement since our CSS parser only supports simple selectors. We just need to check if the element itself matches the selector.

```ts
/**
 * Check if CSS selector matches the element
 */
function isMatch(ele: Element, selectors: Selector[]) {
    return selectors.some((selector) => {
        // Universal selector
        if (selector.tagName === '*') return true
        if (selector.tagName === ele.tagName) return true
        if (ele.attributes.id === selector.id) return true

        if (ele.attributes.class) {
            const classes = ele.attributes.class.split(' ').filter(Boolean)
            const classes2 = selector.class.split(' ').filter(Boolean)
            for (const name of classes) {
                if (classes2.includes(name)) return true
            }
        }

        return false
    })
}
```

Once we find the matching DOM node, we need to combine the DOM node with its matching CSS properties to output a style tree node:

```ts
function getStyleNode(ele: Node, cssRules: Rule[], parent?: StyleNode) {
    const styleNode: StyleNode = {
        node: ele,
        values: getStyleValues(ele, cssRules, parent),
        children: [],
    }

    if (ele.nodeType === NodeType.Element) {
        // Merge inline styles
        if (ele.attributes.style) {
            styleNode.values = { ...styleNode.values, ...getInlineStyle(ele.attributes.style) }
        }

        styleNode.children = ele.children.map((e) => getStyleNode(e, cssRules, styleNode)) as unknown as StyleNode[]
    }

    return styleNode
}

function getStyleValues(ele: Node, cssRules: Rule[], parent?: StyleNode) {
    const inheritableAttrValue = getInheritableAttrValues(parent)

    // Text nodes inherit inheritable properties from parent
    if (ele.nodeType === NodeType.Text) return inheritableAttrValue

    return cssRules.reduce((result: AnyObject, rule) => {
        if (isMatch(ele as Element, rule.selectors)) {
            result = { ...result, ...cssValueArrToObject(rule.declarations) }
        }

        return result
    }, inheritableAttrValue)
}
```

In CSS selectors, different selectors have different priorities. For example, ID selector's priority is higher than class selectors. However, for simplicity, we haven't implemented selector priorities - all selectors have the same priority.

### Inherit Property
Text nodes can't match any selector, so where do their styles come from? The answer is inheritance - text nodes inherit styles from their parent nodes.

There are many inheritable properties in CSS. Even when child nodes haven't declared certain properties, they can still inherit them from their parents. For example, font color, font family and so on are all inheritable. For simplicity, we only support inheriting the `color` and `font-size` properties from parent nodes.

```ts
// Inheritable properties for child elements, only two listed here but there are many more
const inheritableAttrs = ['color', 'font-size']

/**
 * Get inheritable property values from parent element
 */
function getInheritableAttrValues(parent?: StyleNode) {
    if (!parent) return {}
    const keys = Object.keys(parent.values)
    return keys.reduce((result: AnyObject, key) => {
        if (inheritableAttrs.includes(key)) {
            result[key] = parent.values[key]
        }

        return result
    }, {})
}
```

### Inline Style
In CSS, inline styles have the highest priority except for `!important`.
```html
<span style="color: red; background: yellow;">
```

We first call `getStyleValues()` to get the current DOM node's CSS property values, and then get the node's inline styles. The inline styles will override the current node's styles.

## Layout Tree
The fourth phase involves transforming a style tree into a layout tree, which is one of the more complex parts of the entire rendering engine.

![Rendering engine phases](https://i-blog.csdnimg.cn/blog_migrate/db9434b91f831ee82c3ed0405dd37d19.png)

### CSS Box Model
In CSS, every DOM node can be represented as a box. The box model includes content, padding, border, margin, and the node's position information on the page.

![CSS Box Model](https://i-blog.csdnimg.cn/blog_migrate/990f4896e5bef784fb854f68d456595b.png)

We can represent the box model using the following data structures:

```ts
export default class Dimensions {
    content: Rect
    padding: EdgeSizes
    border: EdgeSizes
    margin: EdgeSizes
}

export default class Rect {
    x: number
    y: number
    width: number
    height: number
}

export interface EdgeSizes {
    top: number
    right: number
    bottom: number
    left: number
}
```

### Block Layout and Inline Layout
The CSS `display` property determines how a box model is laid out. While the `display` property can have many values such as `block`, `inline`, `flex`, and others, we will only support `block` and `inline` layouts in our implementation. By default, all box models have `display: inline`.

Let's look at the differences between these layouts using HTML code:
```html
<container>
  <a></a>
  <b></b>
  <c></c>
  <d></d>
</container>
```
With `block` layout, elements are stacked vertically (top to bottom):
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/8ef7819edb4366a86dc91872ba0e41a3.png)

With `inline` layout, elements are arranged horizontally (left to right):
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/417422f697c29f7ba38c529a6e13e782.png)

When a container has both `block` and `inline` elements, we wrap the inline elements in an anonymous block container:
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/24dc7bab858fa8ac370f4477dc45eae1.png)

This allows us to properly handle both inline and block elements within the same container.

Generally, page content grows vertically. When child nodes are added to a container, they increase the container's height rather than its width. In other words, child nodes typically expand to fill their container's width, while the container's height expands to accommodate its child nodes.

### Layout Tree
The layout tree is a collection of box models.
```ts
export default class LayoutBox {
    dimensions: Dimensions
    boxType: BoxType
    children: LayoutBox[]
    styleNode: StyleNode
}
```

Each box model can be of type `block`, `inline`, or `anonymous`:
```ts
export enum BoxType {
    BlockNode = 'BlockNode',
    InlineNode = 'InlineNode',
    AnonymousBlock = 'AnonymousBlock',
}
```
We generate box models according to each DOM node's `display` property when building the style tree.

When a block node contains an inline child node, we need to create an anonymous node (which is actually a block node) to wrap the child node. If there are multiple inline child nodes in a row, they all need to be placed in the same anonymous node.

```ts
function buildLayoutTree(styleNode: StyleNode) {
    if (getDisplayValue(styleNode) === Display.None) {
        throw new Error('Root node has display: none.')
    }

    const layoutBox = new LayoutBox(styleNode)

    let anonymousBlock: LayoutBox | undefined
    for (const child of styleNode.children) {
        const childDisplay = getDisplayValue(child)
        // Skip if DOM node has display: none
        if (childDisplay === Display.None) continue

        if (childDisplay === Display.Block) {
            anonymousBlock = undefined
            layoutBox.children.push(buildLayoutTree(child))
        } else {
            // Create an anonymous container for inline nodes
            if (!anonymousBlock) {
                anonymousBlock = new LayoutBox()
                layoutBox.children.push(anonymousBlock)
            }

            anonymousBlock.children.push(buildLayoutTree(child))
        }
    }

    return layoutBox
}
```

### Traverse Layout Tree
To start building the layout tree, we use the entry point function `getLayoutTree()`:
```ts
export function getLayoutTree(styleNode: StyleNode, parentBlock: Dimensions) {
    parentBlock.content.height = 0
    const root = buildLayoutTree(styleNode)
    root.layout(parentBlock)
    return root
}
```

The entry point traverses the style tree, combines the relevant information from style tree nodes to generate a `LayoutBox` object, and then calls the `layout()` method. This method calculates the position and dimension information for each box model.

As mentioned at the beginning of the chapter, a box model's width depends on its parent, while its height depends on its child nodes. This means our code needs to traverse the tree top-down when calculating widths (so we can set child node widths after knowing their parent's width), and then bottom-up when calculating heights (so we can calculate parent heights after knowing their children's dimensions).

```ts
layout(parentBlock: Dimensions) {
    // Calculate current node's width before traversing children
    // since child width depends on parent width
    this.calculateBlockWidth(parentBlock)
    // Calculate box node position
    this.calculateBlockPosition(parentBlock)
    // Traverse children and calculate their positions and dimensions
    this.layoutBlockChildren()
    // Calculate current node's height after children
    // since parent height depends on children's height
    this.calculateBlockHeight()
}
```

This method performs one complete traversal of the layout tree - top-down for width calculations and bottom-up for height calculations. A production-grade layout engine might perform multiple tree traversals, alternating between top-down and bottom-up passes as needed.



