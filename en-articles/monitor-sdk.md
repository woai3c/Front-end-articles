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
* **CLS (Cumulative Layout Shift)** - Cumulative score of all unexpected layout shifts occurring between page load start and when the [page's lifecycle state](https://developer.chrome.com/docs/web-platform/page-lifecycle-api) becomes hidden

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

### CLS
CLS (Cumulative Layout Shift) - Cumulative score of all unexpected layout shifts occurring between page load start and when the [page's lifecycle state](https://developer.chrome.com/docs/web-platform/page-lifecycle-api) becomes hidden.

The layout shift score is calculated as follows:
```
layout shift score = impact score × distance score
```

The [impact score](https://github.com/WICG/layout-instability#Impact-Fraction) measures how *unstable elements* affect the visible area between two frames. The *distance score* is calculated by taking the greatest distance any *unstable element* has moved (either horizontally or vertically) and dividing it by the viewport's largest dimension (width or height, whichever is greater).

**CLS is the sum of all layout shift scores.**

A layout shift occurs when a DOM element changes position between two rendered frames, as shown below:

![Layout Shift Example](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff07d41c624248a1b66c5761f0482f2c~tplv-k3u1fbpfcp-watermark.image?)

![Layout Shift Movement](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0d5ab8100c9489a991dd0be8e198af0~tplv-k3u1fbpfcp-watermark.image?)

In the above diagram, the rectangle moves from the top-left to the right side, counting as one layout shift. In CLS terminology, there's a concept called "session window": one or more individual layout shifts occurring in rapid succession, with less than 1 second between each shift and a maximum window duration of 5 seconds.

![Session Window Example](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c6af2ec569644013962645820efb16d3~tplv-k3u1fbpfcp-watermark.image?)

For example, in the second session window shown above, there are four layout shifts. Each shift must occur less than 1 second after the previous one, and the time between the first and last shifts must not exceed 5 seconds to qualify as a session window. If these conditions aren't met, it's considered a new session window. This specification comes from extensive experimentation and research by the Chrome team, as detailed in [Evolving the CLS metric](https://web.dev/evolving-cls/).

CLS has three calculation methods:
1. Cumulative
2. Average of all session windows
3. Maximum of all session windows

#### Cumulative
This method adds up all layout shift scores from page load start. However, this approach disadvantages long-lived pages - the longer a page is open, the higher the CLS score becomes.

#### Average of All Session Windows
This method calculates based on session windows rather than individual layout shifts, taking the average of all session window scores. However, this approach has limitations.

![Session Window Comparison](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/42e5208d83f349db84cf4a27194a57f2~tplv-k3u1fbpfcp-watermark.image?)

As shown above, if the first session window has a high CLS score and the second has a low score, averaging them masks the actual page behavior. The average doesn't reflect that the page had more shifts early on and fewer later.

#### Maximum of All Session Windows
This is currently the optimal calculation method, using the highest session window score to reflect the worst-case scenario for layout shifts. For more details, see [Evolving the CLS metric](https://web.dev/evolving-cls/).

Below is the implementation code for the third calculation method:
```js
let sessionValue = 0
let sessionEntries = []
const cls = {
    subType: 'layout-shift',
    name: 'layout-shift',
    type: 'performance',
    pageURL: getPageURL(),
    value: 0,
}

const entryHandler = (list) => {
    for (const entry of list.getEntries()) {
        // Only count layout shifts without recent user input.
        if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0]
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

            // If the entry occurred less than 1 second after the previous entry and
            // less than 5 seconds after the first entry in the session, include the
            // entry in the current session. Otherwise, start a new session.
            if (
                sessionValue
                && entry.startTime - lastSessionEntry.startTime < 1000
                && entry.startTime - firstSessionEntry.startTime < 5000
            ) {
                sessionValue += entry.value
                sessionEntries.push(formatCLSEntry(entry))
            } else {
                sessionValue = entry.value
                sessionEntries = [formatCLSEntry(entry)]
            }

            // If the current session value is larger than the current CLS value,
            // update CLS and the entries contributing to it.
            if (sessionValue > cls.value) {
                cls.value = sessionValue
                cls.entries = sessionEntries
                cls.startTime = performance.now()
                lazyReportCache(deepCopy(cls))
            }
        }
    }
}

const observer = new PerformanceObserver(entryHandler)
observer.observe({ type: 'layout-shift', buffered: true })
```

A single layout shift measurement contains the following data:
```js
{
  duration: 0,
  entryType: "layout-shift",
  hadRecentInput: false,
  lastInputTime: 0,
  name: "",
  sources: (2) [LayoutShiftAttribution, LayoutShiftAttribution],
  startTime: 1176.199999999255,
  value: 0.000005752046026677329,
}
```
The `value` field represents the layout shift score.