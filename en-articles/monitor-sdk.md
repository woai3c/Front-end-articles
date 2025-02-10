## The Principle Analysis of Frontend Monitoring SDK

A complete frontend monitoring platform consists of three parts: data collection and reporting, data processing and storage, and data visualization.

This article focuses on the first component - data collection and reporting. Below is an outline of the topics we'll cover:

![Monitoring Platform Overview](https://user-images.githubusercontent.com/22117876/136796476-33011270-4975-477f-89a4-c19fa019c76f.png)

![Implementation Details](https://user-images.githubusercontent.com/22117876/136796494-7b75df76-3f34-47ea-92e1-356b2409fa19.png)

Since theoretical knowledge alone can be difficult to grasp, I've created a simple [monitoring SDK](https://github.com/woai3c/monitor-demo) that implements these technical concepts. You can use it to create simple demos and gain a better understanding. Reading this article while experimenting with the SDK will provide the best learning experience.

## Collect Performance Data
The Chrome developer team has proposed a series of metrics to monitor page performance:

* **FP (First Paint)** - Time from when the page starts loading until the first pixel is painted on the screen (essentially the white screen time)
* **FCP (First Contentful Paint)** - Time from page load start until any part of page content is rendered
* **LCP (Largest Contentful Paint)** - Time from page load start until the largest text block or image element completes rendering
* **CLS (Cumulative Layout Shift)** - Cumulative score of all unexpected layout shifts occurring between page load start and when the page's lifecycle state becomes hidden

We can obtain these four performance metrics through [PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) (they can also be retrieved via `performance.getEntriesByName()`, but this method doesn't provide real-time notifications when events occur). PerformanceObserver is a performance monitoring interface used to observe performance measurement events.

### FP
Implementation code:
```ts
const entryHandler = (list) => {        
    for (const entry of list.getEntries()) {
        if (entry.name === 'first-paint') {
            observer.disconnect()
        }
        console.log(entry)
    }
}

const observer = new PerformanceObserver(entryHandler)
// The buffered property indicates whether to observe cached data, 
// allowing observation even if the monitoring code is added after the event occurs
observer.observe({ type: 'paint', buffered: true })
```

The FP measurement output:
```ts
{
    duration: 0,
    entryType: "paint",
    name: "first-paint",
    startTime: 359, // FP time
}
```
The `startTime` value represents the paint timing we need.

### FCP
FCP (First Contentful Paint) - Time from page load start until any part of page content is rendered. The "content" in this metric refers to text, images (including background images), `<svg>` elements, and non-white `<canvas>` elements.

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a4f1c9b61029448dae2b1cfb57b4ef75~tplv-k3u1fbpfcp-watermark.image?)

To provide a good user experience, the FCP score should be kept under 1.8 seconds.

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9818c66879b345e3b4845ff3fe01e8c9~tplv-k3u1fbpfcp-watermark.image?)

The measurement code:
```ts
const entryHandler = (list) => {        
    for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
            observer.disconnect()
        }
        
        console.log(entry)
    }
}

const observer = new PerformanceObserver(entryHandler)
observer.observe({ type: 'paint', buffered: true })
```
We can get the value of FCP via the above code:
```ts
{
    duration: 0,
    entryType: "paint",
    name: "first-contentful-paint",
    startTime: 459, // fcp 时间
}
```
The `startTime` value is the painting time we need.

### LCP
LCP (Largest Contentful Paint) - Time from page load start until the largest text block or image element completes rendering. The LCP metric reports the relative render time of the largest visible image or text block in the viewport, measured from when the page first begins loading.

A good LCP score should be kept under 2.5 seconds.

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c090dd8b042c46d2adaba5395ca68f47~tplv-k3u1fbpfcp-watermark.image?)

The measurement code:
```ts
const entryHandler = (list) => {
    if (observer) {
        observer.disconnect()
    }

    for (const entry of list.getEntries()) {
        console.log(entry)
    }
}

const observer = new PerformanceObserver(entryHandler)
observer.observe({ type: 'largest-contentful-paint', buffered: true })
```
We can get the value of LCP via the above code:
```ts
{
    duration: 0,
    element: p,
    entryType: "largest-contentful-paint",
    id: "",
    loadTime: 0,
    name: "",
    renderTime: 1021.299,
    size: 37932,
    startTime: 1021.299,
    url: "",
}
```
The `startTime` value is the painting time we need. And `element` refers to the element being painted during LCP.

The difference between FCP and LCP is: FCP event occurs when any content is painted, while LCP event occurs when the largest content finishes rendering.

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0e64637ac9d243a58101d8ed01fe886e~tplv-k3u1fbpfcp-watermark.image?)

LCP considers these elements:
* `<img>` elements
* `<image>` elements inside `<svg>`
* `<video>` elements (using poster images)
* Elements with background images loaded via the [`url()`](https://developer.mozilla.org/docs/Web/CSS/url()) function (not using [CSS gradients](https://developer.mozilla.org/docs/Web/CSS/CSS_Images/Using_CSS_gradients))
* Block-level elements containing text nodes or other inline-level text elements