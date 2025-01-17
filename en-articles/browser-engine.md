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
These two functions will return corresponding DOM nodes when they call in parsing Element code or Text code.