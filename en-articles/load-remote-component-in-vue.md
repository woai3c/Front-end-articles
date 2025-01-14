# How to Load Remote Components in Vue 3

## Background
I recently received a requirement in a Vue 3 low-code project to load remote components. These remote components have unpredictable names and are stored in a database. I need to fetch all component data through an API to determine what components are available. After research, I found two viable solutions to meet this requirement.

## HTML File + UMD Components
This is the simplest solution to implement. We just need to package the component in UMD format and use it directly in the HTML file.

```html
<div id="app">
    <test-input></test-input>
</div>
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
    // Load the component by mounting the script tag and access it through the window object
    await loadScript('http://localhost/component/input/0.1.0/bundle.js')
    app.component('TestInput', window.TestInput)
</script>
```

However, this solution is not suitable for large projects due to its low efficiency.

## Vue 3 Project + ESM/UMD Components
This is the solution I implemented in my low-code project. During my research, I encountered and solved two main problems. Here's how it works:

### Problem 1: Relative References
Since our project doesn't need to be compatible with IE, we can package the source code in ESM format. For example:

```ts
import { reactive } from 'vue'
// other code...
```
then use in project:
```ts
const { default: TestInput } = await import('http://localhost/component/input/0.1.0/bundle.mjs')
```
When loading the remote TestInput component as shown above, it causes a "Relative references must start with either '/', './', or '../'" error. This is because browsers don't support directly using `import { reactive } from 'vue'` - we need to change `'vue'` to `https://..../vue.js` or `'./vue.js'`. Usually, we don't need to worry about this as our build tools handle it automatically.

### Problem 2: Different Vue 3 Contexts
My first attempt to solve the first problem was to package the component with all its dependencies. While this removed all import statements, it unfortunately didn't work. This is because the Vue 3 context in our project and the Vue 3 context from node_modules are incompatible - they need to share the same context to work properly.

![在这里插入图片描述](https://img-blog.csdnimg.cn/18191ed1d5b2427e97331f386542a4fe.png)

Even though all Vue 3 method names are the same across different contexts, their variables are not. This prevents remote components from loading normally.

### Solution
To solve these problems:
1. We can replace `import { reactive } from 'vue'` with `const { reactive } = Vue` to avoid the relative references error.
2. We can import the entire Vue 3 instance in `main.js` instead of packaging it with the source code. This ensures our project and remote components use the same Vue context.

To handle the code transformation, I created a rollup plugin called [`rollup-plugin-import-to-const`](https://github.com/woai3c/rollup-plugin-import-to-const) (supporting both vite and rollup). It automatically transforms code from `import { reactive } from 'vue'` to `const { reactive } = Vue`. With these solutions in place, we can load remote components in our project:

```ts
const { default: TestInput } = await import('http://localhost/component/input/0.1.0/bundle.mjs')
``` 

Actually, we can load components in any format (ESM/UMD/CJS, etc.) as long as we solve these two problems.

## Summary
Loading remote components isn't limited to these two solutions. For example, we can also use [`vue3-sfc-loader`](https://github.com/vuejs/vue-sfc-loader) or [`webpack5 Module Federation`](https://webpack.js.org/concepts/module-federation/). The choice depends on your project's specific requirements.

Generally, loading remote components is most commonly used in low-code platforms.
