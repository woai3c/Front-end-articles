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
