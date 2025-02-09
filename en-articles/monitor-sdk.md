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