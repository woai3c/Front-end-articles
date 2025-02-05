# Implementing Synchronous Scrolling in a Dual-Pane Markdown Editor

As someone who frequently writes technical articles using markdown, I'm quite particular about the writing experience. I've noticed that most technical community markdown editors include synchronous scrolling functionality. However, while some implement this feature well, others do it poorly. Out of curiosity, I decided to implement this feature myself.

After careful consideration, I came up with three solutions:
1. Percentage-based scrolling
2. Simultaneous rendering of large elements in both panes
3. Row-based index synchronization for precise scroll alignment

## Percentage-based Scrolling
Let's say we're scrolling pane `a`. The scroll percentage is calculated as: `scroll position / total content height`, expressed in code as `a.scrollTop / a.scrollHeight`. When scrolling pane `a`, we need to manually synchronize pane b's scroll position by calculating its height based on pane a's scroll percentage:

```js
a.onscroll = () => {
  b.scrollTo({ top: a.scrollTop / a.scrollHeight * b.scrollHeight })
}
```

While the principle is simple, the implementation results are not satisfactory.

![Scroll sync demo](https://i-blog.csdnimg.cn/blog_migrate/79e22b27bca126e02e154262c52a4486.gif#pic_center)

As shown in the animation above, when we stop at the second heading, the content in both panes is synchronized. However, when scrolling to the third heading, there's already a height difference of nearly 300 pixels between the two panes. This solution is barely usable - better than nothing, but far from ideal.

## Simultaneous Rendering of Large Elements
The height inconsistency between the dual panes occurs because markdown elements can have significantly different heights before and after rendering. For example, an image in markdown is just a single line of code, but once rendered, its height can vary from tens to hundreds of pixels. This issue could be resolved by rendering images in both panes simultaneously.

![Rendering comparison](https://i-blog.csdnimg.cn/blog_migrate/55e538de6d2eb8366342b7bb0792c8d3.png)

However, images aren't the only elements that show height differences between their markdown and rendered forms. While not as dramatic as images, elements like h1 and h2 headings also have slight differences. As articles get longer, these small differences accumulate, causing increasingly significant height discrepancies between the two panes. Therefore, this solution isn't particularly reliable either.

## Row-based Index Synchronization
This third solution performs much better than the previous two, achieving almost perfect line-by-line synchronization. Here's how it works:

**First, monitor changes in the markdown content and assign indices to each row element (excluding empty rows and blank text).**

![Index assignment](https://i-blog.csdnimg.cn/blog_migrate/3f439339114ed61968cb2fde0049c323.png)

When rendering markdown content, we need to add a `data-index` value to the rendered elements. This allows us to precisely locate corresponding elements between the edit and preview panes.

![Rendered elements with indices](https://i-blog.csdnimg.cn/blog_migrate/58382fcb21eadfec84b6077f5909eed9.png)

**Second, calculate the scroll position in pane b based on the scroll position of elements with matching indices in pane a.**

When pane a is scrolling, we need to iterate through all elements from top to bottom to find the first visible element. By "visible element," we mean elements that are currently in view, as some elements will scroll out of view during scrolling.

To determine if an element is visible:
```ts
function isInScreen(dom) {
    const { top, bottom } = dom.getBoundingClientRect()
    return bottom >= 0 && top < window.innerHeight
}
```

Beyond checking visibility, we also need to calculate what percentage of the element is visible on screen. For example, if half of a markdown image string is visible, then half of the rendered image should also be visible in the preview pane.

![Scroll synchronization demo](https://i-blog.csdnimg.cn/blog_migrate/98095e39d60c77843a51261b737f3985.gif#pic_center)

The code for calculating the visible percentage of an element:
```ts
function percentOfdomInScreen(dom) {
    // We already know the element is on screen through isInScreen(),
    // so we just need to calculate its visible percentage
    const { height, bottom } = dom.getBoundingClientRect()
    if (bottom <= 0) return 0 // Not visible
    if (bottom >= height) return 1 // Fully visible
    return bottom / height // Partially visible
}
```

Now we can iterate through elements from top to bottom in pane a to find the first visible element:
```ts
// scrollContainer is pane a, ShowContainer is pane b
const nodes = Array.from(scrollContainer.children)
for (const node of nodes) {
    // Find the first visible element
    if (isInScreen(node) && percentOfdomInScreen(node) >= 0) {
        const index = node.dataset.index
        // Find the corresponding element in the preview pane
        const dom = ShowContainer.querySelector(`[data-index="${index}"]`)
        
        // Get the visible percentage in pane a
        const percent = percentOfdomInScreen(node)
        // Calculate the distance from the container top
        const heightToTop = getHeightToTop(dom)
        // Calculate how much of the element should be hidden based on percent
        const domNeedHideHeight = dom.offsetHeight * (1 - percent)
        // Scroll to the correct position
        ShowContainer.scrollTo({ top: heightToTop + domNeedHideHeight })
        break
    }
}
```

![Line-by-line synchronization](https://i-blog.csdnimg.cn/blog_migrate/ef1b8d015de3883d54fdb10485c42820.gif#pic_center)

As shown in the animation above, we've achieved precise line-by-line synchronization.

### Handling Edge Cases
Some elements become nested when rendered, such as tables, which render as:
```html
<table>
    <tbody>
        <tr>
            <td></td>
        </tr>
    </tbody>
</table>
```

With the current rendering logic, if we have a table like:
```
|1|b|
...
```
The `data-index` of `|1|b|` would correspond to the entire `table` element.

![Table index issue 1](https://i-blog.csdnimg.cn/blog_migrate/36a24f09f89ba4bec305fefe7da50568.png)

![Table index issue 2](https://i-blog.csdnimg.cn/blog_migrate/7a57398bf58af93e2c66e9a8be7768fa.png)

This creates a bug where scrolling the first row to 50% visibility causes the entire table to scroll to 50% in the preview pane, as shown below:

![Table scrolling issue](https://i-blog.csdnimg.cn/blog_migrate/2f11f8543b8437d730004dbcdf824e35.png)

This isn't the desired behavior - when the edit pane hasn't finished scrolling past the first row, the preview pane has already scrolled halfway through the entire table.

The solution is to apply the `data-index` to the actual content elements. For tables, this means adding `data-index` to the `tr` elements instead of the table itself.

![Correct table index](https://i-blog.csdnimg.cn/blog_migrate/c9c31c71609a311778fc24db1d71a3e8.png)

This fixes the synchronization issue. The same principle applies to other nested elements like lists (ul, ol).

![Final result](https://i-blog.csdnimg.cn/blog_migrate/83c21eaf42ec83eb32eb17788a399204.png)

## Summary
The complete code is available on GitHub:
* [markdown-editor-sync-scroll-demo](https://github.com/woai3c/markdown-editor-sync-scroll-demo)

Online demos are available at:
* [demo1](https://jsrun.net/hwPKp)
* [demo2](https://jsrun.net/XwPKp)
* [demo3](https://jsrun.net/ywPKp)
* [demo4](https://jsrun.net/bwPKp)
* [demo5](https://jsrun.net/WwPKp)
* [demo6](https://jsrun.net/fwPKp)

If the online demos are loading slowly, you can clone the project and open the HTML files directly.