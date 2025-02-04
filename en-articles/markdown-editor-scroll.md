#  Implementing Synchronous Scrolling in a Dual-Pane Markdown Editor

Since I frequently write technical articles using markdown, I'm quite sensitive to the writing experience. I've noticed that most technical community markdown editors have synchronous scrolling functionality. However, only some implement this feature well, while others do it poorly. Out of curiosity, I decided to implement this feature myself.

After some consideration, I came up with three solutions:
1. Percentage-based scrolling
2. Rendering large elements in both panes simultaneously
3. Assigning indices to each row element and synchronizing scroll heights precisely based on these indices

## Percentage-based Scrolling
Let's assume we're scrolling pane `a`. The scroll percentage is calculated as: `scroll position / total content height`, expressed in code as `a.scrollTop / a.scrollHeight`. When scrolling pane `a`, we need to manually synchronize pane b's scroll position by calculating its height based on pane a's scroll percentage:

```js
a.onscroll = () => {
  b.scrollTo({ top: a.scrollTop / a.scrollHeight * b.scrollHeight })
}
```
Although the principle is simple, the implementation results are not satisfactory.

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/79e22b27bca126e02e154262c52a4486.gif#pic_center)

As shown in the animation above, when we stop at the second heading, the content in both panes is synchronized. However, when scrolling to the third heading, there's already a height difference of nearly 300 pixels between the two panes. So this solution is barely usable - better than nothing, but not ideal.

## Rendering Large-area Elements in Both Panes Simultaneously
The inconsistency in the heights of the dual-pane content is caused by the fact that the same markdown element can have different heights before and after rendering. For example, an image written in markdown is only a single line of code, but once rendered, its size can vary significantly—with heights ranging from a few tens to several hundreds of pixels. If the markdown image code were rendered simultaneously in both panes, this issue could be resolved.

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/55e538de6d2eb8366342b7bb0792c8d3.png)

However, aside from images, many other elements also exhibit differences in height before and after rendering (although not as drastic as with images). For instance, headings like h1 and h2—when an article becomes longer—the small differences in height accumulate, making the overall height discrepancy between the two panes increasingly significant. Therefore, this solution is not very reliable.