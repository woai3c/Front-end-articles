
# 24 Front-end Performance Optimization Tips

Performance optimization is a double-edged sword, with both good and bad aspects. The good side is that it can improve website performance, while the bad side is that it's complicated to configure, or there are too many rules to follow. Additionally, some performance optimization rules aren't suitable for all scenarios and should be used with caution. Readers should approach this article with a critical eye.

The references for the optimization suggestions in this article will be provided after each suggestion or at the end of the article.

### 1. Reduce HTTP Requests
A complete HTTP request needs to go through DNS lookup, TCP handshake, browser sending the HTTP request, server receiving the request, server processing the request and sending back a response, browser receiving the response, and other processes. Let's look at a specific example to understand HTTP:

![Image description](https://i-blog.csdnimg.cn/blog_migrate/d376d71460c7c7c11db1c85146b041dc.png)

This is an HTTP request, and the file size is 28.4KB.

Terminology explained:
* Queueing: Time spent in the request queue.
* Stalled: The time difference between when the TCP connection is established and when data can actually be transmitted, including proxy negotiation time.
* Proxy negotiation: Time spent negotiating with the proxy server.
* DNS Lookup: Time spent performing DNS lookup. Each different domain on a page requires a DNS lookup.
* Initial Connection / Connecting: Time spent establishing a connection, including TCP handshake/retry and SSL negotiation.
* SSL: Time spent completing the SSL handshake.
* Request sent: Time spent sending the network request, usually a millisecond.
* Waiting (TFFB): TFFB is the time from when the page request is made until the first byte of response data is received.
* Content Download: Time spent receiving the response data.

From this example, we can see that the actual data download time accounts for only `13.05 / 204.16 = 6.39%` of the total. The smaller the file, the smaller this ratio; the larger the file, the higher the ratio. This is why it's recommended to combine multiple small files into one large file, thereby reducing the number of HTTP requests.

Reference:
* [understanding-resource-timing](https://developers.google.com/web/tools/chrome-devtools/network/understanding-resource-timing)

### 2. Use HTTP2
Compared to HTTP1.1, HTTP2 has several advantages:
#### Faster parsing
When parsing HTTP1.1 requests, the server must continuously read bytes until it encounters the CRLF delimiter. Parsing HTTP2 requests isn't as complicated because HTTP2 is a frame-based protocol, and each frame has a field indicating its length.
#### Multiplexing
With HTTP1.1, if you want to make multiple requests simultaneously, you need to establish multiple TCP connections because one TCP connection can only handle one HTTP1.1 request at a time.

In HTTP2, multiple requests can share a single TCP connection, which is called multiplexing. Each request and response is represented by a stream with a unique stream ID to identify it.
Multiple requests and responses can be sent out of order within the TCP connection and then reassembled at the destination using the stream ID.

#### Header compression
HTTP2 provides header compression functionality.

For example, consider the following two requests:
```
:authority: unpkg.zhimg.com
:method: GET
:path: /za-js-sdk@2.16.0/dist/zap.js
:scheme: https
accept: */*
accept-encoding: gzip, deflate, br
accept-language: zh-CN,zh;q=0.9
cache-control: no-cache
pragma: no-cache
referer: https://www.zhihu.com/
sec-fetch-dest: script
sec-fetch-mode: no-cors
sec-fetch-site: cross-site
user-agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
```
```
:authority: zz.bdstatic.com
:method: GET
:path: /linksubmit/push.js
:scheme: https
accept: */*
accept-encoding: gzip, deflate, br
accept-language: zh-CN,zh;q=0.9
cache-control: no-cache
pragma: no-cache
referer: https://www.zhihu.com/
sec-fetch-dest: script
sec-fetch-mode: no-cors
sec-fetch-site: cross-site
user-agent: Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
```
From the two requests above, you can see that a lot of data is repeated. If we could store the same headers and only send the differences between them, we could save a lot of bandwidth and speed up the request time.

HTTP/2 uses "header tables" on the client and server sides to track and store previously sent key-value pairs, and for identical data, it's no longer sent through each request and response.

Here's a simplified example. Suppose the client sends the following header requests in sequence:
```
Header1:foo
Header2:bar
Header3:bat
```
When the client sends a request, it creates a table based on the header values:

|Index|Header Name|Value|
|-|-|-|
|62|Header1|foo|
|63|Header2|bar|
|64|Header3|bat|

If the server receives the request, it will create the same table.
When the client sends the next request, if the headers are the same, it can directly send a header block like this:
```
62 63 64
```
The server will look up the previously established table and restore these numbers to the complete headers they correspond to.

#### Priority
HTTP2 can set a higher priority for more urgent requests, and the server can prioritize handling them after receiving such requests.

#### Flow control
Since the bandwidth of a TCP connection (depending on the network bandwidth from client to server) is fixed, when there are multiple concurrent requests, if one request occupies more traffic, another request will occupy less. Flow control can precisely control the flow of different streams.

#### Server push
A powerful new feature added in HTTP2 is that the server can send multiple responses to a single client request. In other words, in addition to responding to the initial request, the server can also push additional resources to the client without the client explicitly requesting them.

For example, when a browser requests a website, in addition to returning the HTML page, the server can also proactively push resources based on the URLs of resources in the HTML page.

Many websites have already started using HTTP2, such as Zhihu:

![Image description](https://img-blog.csdnimg.cn/img_convert/9cae1e2191a0594f983766df5cbe75b5.png)

Where "h2" refers to the HTTP2 protocol, and "http/1.1" refers to the HTTP1.1 protocol.

References:
* [HTTP2 Introduction](https://developers.google.com/web/fundamentals/performance/http2/?hl=zh-cn)
* [Understanding HTTP, HTTPS, and HTTP2 in Half an Hour](https://github.com/woai3c/Front-end-articles/blob/master/http-https-http2.md)

### 3. Use Server-Side Rendering
Client-side rendering: Get the HTML file, download JavaScript files as needed, run the files, generate the DOM, and then render.

Server-side rendering: The server returns the HTML file, and the client only needs to parse the HTML.

* Pros: Faster first-screen rendering, better SEO.
* Cons: Complicated configuration, increases the computational load on the server.

Below, I'll use Vue SSR as an example to briefly describe the SSR process.
#### Client-side rendering process
1. Visit a client-rendered website.
2. The server returns an HTML file containing resource import statements and `<div id="app"></div>`.
3. The client requests resources from the server via HTTP, and when the necessary resources are loaded, it executes `new Vue()` to instantiate and render the page.

#### Server-side rendering process
1. Visit a server-rendered website.
2. The server checks which resource files the current route component needs, then fills the content of these files into the HTML file. If there are AJAX requests, it will execute them for data pre-fetching and fill them into the HTML file, and finally return this HTML page.
3. When the client receives this HTML page, it can start rendering the page immediately. At the same time, the page also loads resources, and when the necessary resources are fully loaded, it begins to execute `new Vue()` to instantiate and take over the page.

From the two processes above, we can see that the difference lies in the second step. A client-rendered website will directly return the HTML file, while a server-rendered website will render the page completely before returning this HTML file.

**What's the benefit of doing this? It's a faster time-to-content.**

Suppose your website needs to load four files (a, b, c, d) to render completely. And each file is 1 MB in size.

Calculating this way: a client-rendered website needs to load 4 files and an HTML file to complete the home page rendering, totaling 4MB (ignoring the HTML file size). While a server-rendered website only needs to load a fully rendered HTML file to complete the home page rendering, totaling the size of the already rendered HTML file (which isn't usually too large, generally a few hundred KB; my personal blog website (SSR) loads an HTML file of 400KB). **This is why server-side rendering is faster.**

References:
* [vue-ssr-demo](https://github.com/woai3c/vue-ssr-demo)
* [Vue.js Server-Side Rendering Guide](https://ssr.vuejs.org/zh/)

### 4. Use CDN for Static Resources
A Content Delivery Network (CDN) is a set of web servers distributed across multiple geographic locations. We all know that the further the server is from the user, the higher the latency. CDNs are designed to solve this problem by deploying servers in multiple locations, bringing users closer to servers, thereby shortening request times.

#### CDN Principles
When a user visits a website without a CDN, the process is as follows:
1. The browser needs to resolve the domain name into an IP address, so it makes a request to the local DNS.
2. The local DNS makes successive requests to the root server, top-level domain server, and authoritative server to get the IP address of the website's server.
3. The local DNS sends the IP address back to the browser, and the browser makes a request to the website server's IP address and receives the resources.

![](https://img-blog.csdnimg.cn/img_convert/0118e3238909c8cc33b7b0e3e908f338.png)

If the user is visiting a website that has deployed a CDN, the process is as follows:
1. The browser needs to resolve the domain name into an IP address, so it makes a request to the local DNS.
2. The local DNS makes successive requests to the root server, top-level domain server, and authoritative server to get the IP address of the Global Server Load Balancing (GSLB) system.
3. The local DNS then makes a request to the GSLB. The main function of the GSLB is to determine the user's location based on the local DNS's IP address, filter out the closest local Server Load Balancing (SLB) system to the user, and return the IP address of that SLB to the local DNS.
4. The local DNS sends the SLB's IP address back to the browser, and the browser makes a request to the SLB.
5. The SLB selects the optimal cache server based on the resource and address requested by the browser and sends it back to the browser.
6. The browser then redirects to the cache server based on the address returned by the SLB.
7. If the cache server has the resource the browser needs, it sends the resource back to the browser. If not, it requests the resource from the source server, sends it to the browser, and caches it locally.

![](https://img-blog.csdnimg.cn/img_convert/94ae3f2d8809c79f21a7803f2a15c15b.png)

References:
* [What is CDN? What are the advantages of using CDN?](https://www.zhihu.com/question/36514327/answer/193768864)
* [CDN Principles Simplified](https://juejin.im/post/6844903873518239752)

### 5. Place CSS in the head and JavaScript Files at the Bottom
* CSS execution blocks rendering and prevents JS execution
* JS loading and execution block HTML parsing and prevent CSSOM construction

If these CSS and JS tags are placed in the HEAD tag, and they take a long time to load and parse, then the page will be blank. Therefore, JS files should be placed at the bottom (not blocking DOM parsing but will block rendering) so that HTML parsing is completed before loading JS files, presenting the page content to the user as early as possible.

So why should CSS files still be placed in the head?

Because loading HTML first and then loading CSS will make users see an unstyled, "ugly" page at first glance. To avoid this situation, CSS files should be placed in the head.

Additionally, JS files can also be placed in the head as long as the script tag has the defer attribute, which means asynchronous download and delayed execution.

Reference:
* [Adding Interactivity with JavaScript](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/adding-interactivity-with-javascript)

### 6. Use Font Icons (iconfont) Instead of Image Icons
A font icon is an icon made into a font. When using it, it's just like a font, and you can set attributes such as font-size, color, etc., which is very convenient. Moreover, font icons are vector graphics and won't lose clarity. Another advantage is that the generated files are particularly small.

#### Compress Font Files
Use the [fontmin-webpack](https://github.com/patrickhulce/fontmin-webpack) plugin to compress font files (thanks to [Frontend Xiaowei](https://juejin.im/user/237150239985165) for providing this).

![](https://img-blog.csdnimg.cn/img_convert/77b2eb5e3e09320087e3370686da9300.png)

References:
* [fontmin-webpack](https://github.com/patrickhulce/fontmin-webpack)
* [Iconfont-Alibaba Vector Icon Library](https://www.iconfont.cn/)

### 7. Make Good Use of Caching, Avoid Reloading the Same Resources
To prevent users from having to request files every time they visit a website, we can control this behavior by adding Expires or max-age. Expires sets a time, and as long as it's before this time, the browser won't request the file but will directly use the cache. Max-age is a relative time, and it's recommended to use max-age instead of Expires.

However, this creates a problem: what happens when the file is updated? How do we notify the browser to request the file again?

This can be done by updating the resource link addresses referenced in the page, making the browser actively abandon the cache and load new resources.

The specific approach is to associate the URL modification of the resource address with the file content, which means that only when the file content changes, the corresponding URL will change, thereby achieving file-level precise cache control. What is related to file content? We naturally think of using [digest algorithms](https://baike.baidu.com/item/%E6%B6%88%E6%81%AF%E6%91%98%E8%A6%81%E7%AE%97%E6%B3%95/3286770?fromtitle=%E6%91%98%E8%A6%81%E7%AE%97%E6%B3%95&fromid=12011257) to derive digest information for the file. The digest information corresponds one-to-one with the file content, providing a basis for cache control that's precise to the granularity of individual files.

References:
* [webpack + express implementing precise file caching](https://github.com/woai3c/node-blog/blob/master/doc/node-blog7.md)
* [webpack-caching](https://www.webpackjs.com/guides/caching/)
* [Zhang Yunlong - How to develop and deploy front-end code in big companies?](https://www.zhihu.com/question/20790576/answer/32602154)

### 8. Compress Files
Compressing files can reduce file download time, providing a better user experience.

Thanks to the development of webpack and node, file compression is now very convenient.

In webpack, the following plugins can be used for compression:
* JavaScript: UglifyPlugin
* CSS: MiniCssExtractPlugin
* HTML: HtmlWebpackPlugin

In fact, we can do even better by using gzip compression. This can be enabled by adding the gzip identifier to the Accept-Encoding header in the HTTP request header. Of course, the server must also support this feature.

Gzip is currently the most popular and effective compression method. For example, the app.js file generated after building a project I developed with Vue has a size of 1.4MB, but after gzip compression, it's only 573KB, reducing the volume by nearly 60%.

Here are the methods for configuring gzip in webpack and node.

**Download plugins**
```
npm install compression-webpack-plugin --save-dev
npm install compression
```

**webpack configuration**
```
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  plugins: [new CompressionPlugin()],
}
```

**node configuration**
```
const compression = require('compression')
// Use before other middleware
app.use(compression())
```

### 9. Image Optimization
#### (1). Lazy Loading Images
In a page, don't initially set the path for images, only load the actual image when it appears in the browser's viewport. This is lazy loading. For websites with many images, loading all images at once can have a significant impact on user experience, so image lazy loading is necessary.

First, set up the images like this, where images won't load when they're not visible in the page:
```html
<img data-src="https://avatars0.githubusercontent.com/u/22117876?s=460&u=7bd8f32788df6988833da6bd155c3cfbebc68006&v=4">
```
When the page becomes visible, use JS to load the image:
```js
const img = document.querySelector('img')
img.src = img.dataset.src
```
This is how the image gets loaded. For the complete code, please refer to the reference materials.

Reference:
* [Web front-end image lazy loading implementation principles](https://juejin.im/entry/6844903482164510734)

#### (2). Responsive Images
The advantage of responsive images is that browsers can automatically load appropriate images based on screen size.

Implementation through `picture`
```html
<picture>
	<source srcset="banner_w1000.jpg" media="(min-width: 801px)">
	<source srcset="banner_w800.jpg" media="(max-width: 800px)">
	<img src="banner_w800.jpg" alt="">
</picture>
```
Implementation through `@media`
```html
@media (min-width: 769px) {
	.bg {
		background-image: url(bg1080.jpg);
	}
}
@media (max-width: 768px) {
	.bg {
		background-image: url(bg768.jpg);
	}
}
```
#### (3). Adjust Image Size
For example, if you have a 1920 * 1080 size image, you show it to users as a thumbnail, and only display the full image when users hover over it. If users never actually hover over the thumbnail, the time spent downloading the image is wasted.

Therefore, we can optimize this with two images. Initially, only load the thumbnail, and when users hover over the image, then load the large image. Another approach is to lazy load the large image, manually changing the src of the large image to download it after all elements have loaded.

#### (4). Reduce Image Quality
For example, with JPG format images, there's usually no noticeable difference between 100% quality and 90% quality, especially when used as background images. When cutting background images in PS, I often cut the image into JPG format and compress it to 60% quality, and basically can't see any difference.

There are two compression methods: one is through the webpack plugin `image-webpack-loader`, and the other is through online compression websites.

Here's how to use the webpack plugin `image-webpack-loader`:
```
npm i -D image-webpack-loader
```
webpack configuration
```js
{
  test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
  use:[
    {
    loader: 'url-loader',
    options: {
      limit: 10000, /* Images smaller than 1000 bytes will be automatically converted to base64 code references */
      name: utils.assetsPath('img/[name].[hash:7].[ext]')
      }
    },
    /* Compress images */
    {
      loader: 'image-webpack-loader',
      options: {
        bypassOnDebug: true,
      }
    }
  ]
}
```

#### (5). Use CSS3 Effects Instead of Images When Possible
Many images can be drawn with CSS effects (gradients, shadows, etc.), and in these cases, CSS3 effects are better. This is because code size is usually a fraction or even a tenth of the image size.

Reference:
* [Using images in webpack](https://juejin.im/post/6844903816081457159)

#### (6). Use webp Format Images
>WebP's advantage is reflected in its better image data compression algorithm, which brings smaller image volume while maintaining image quality that's indistinguishable to the naked eye. It also has lossless and lossy compression modes, Alpha transparency, and animation features. Its conversion effects on JPEG and PNG are quite excellent, stable, and uniform.

Reference:
* [What are the advantages of WebP compared to PNG and JPG?](https://www.zhihu.com/question/27201061)

### 10. Load Code on Demand Through Webpack, Extract Third-Party Libraries, Reduce Redundant Code When Converting ES6 to ES5
>Lazy loading or on-demand loading is a great way to optimize a website or application. This approach actually separates your code at some logical breakpoints, and then immediately references or is about to reference some new code blocks after completing certain operations in some code blocks. This speeds up the initial loading of the application and lightens its overall volume because some code blocks may never be loaded.

#### Generate File Names Based on File Content, Combined with Import Dynamic Import of Components to Achieve On-Demand Loading
This requirement can be achieved by configuring the filename property of output. One of the value options in the filename property is [contenthash], which creates a unique hash based on file content. When the file content changes, [contenthash] also changes.
```js
output: {
	filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    path: path.resolve(__dirname, '../dist'),
},
```
#### Extract Third-Party Libraries
Since imported third-party libraries are generally stable and don't change frequently, extracting them separately as long-term caches is a better choice.
This requires using the cacheGroups option of webpack4's splitChunk plugin.
```js
optimization: {
  	runtimeChunk: {
        name: 'manifest' // Split webpack's runtime code into a separate chunk.
    },
    splitChunks: {
        cacheGroups: {
            vendor: {
                name: 'chunk-vendors',
                test: /[\\/]node_modules[\\/]/,
                priority: -10,
                chunks: 'initial'
            },
            common: {
                name: 'chunk-common',
                minChunks: 2,
                priority: -20,
                chunks: 'initial',
                reuseExistingChunk: true
            }
        },
    }
},
```
* test: Used to control which modules are matched by this cache group. If passed unchanged, it defaults to select all modules. Types of values that can be passed: RegExp, String, and Function;
* priority: Indicates extraction weight, with higher numbers indicating higher priority. Since a module might meet the conditions of multiple cacheGroups, extraction is determined by the highest weight;
* reuseExistingChunk: Indicates whether to use existing chunks. If true, it means that if the current chunk contains modules that have already been extracted, new ones won't be generated.
* minChunks (default is 1): The minimum number of times this code block should be referenced before splitting (note: to ensure code block reusability, the default strategy doesn't require multiple references to be split)
* chunks (default is async): initial, async, and all
* name (name of the packaged chunks): String or function (functions can customize names based on conditions)

#### Reduce Redundant Code When Converting ES6 to ES5
To achieve the same functionality as the original code after Babel conversion, some helper functions are needed, for example:
```js
class Person {}
```
will be converted to:
```js
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Person = function Person() {
  _classCallCheck(this, Person);
};
```
Here, `_classCallCheck` is a `helper` function. If classes are declared in many files, then many such `helper` functions will be generated.

The `@babel/runtime` package declares all the helper functions needed, and the role of `@babel/plugin-transform-runtime` is to import all files that need `helper` functions from the `@babel/runtime package`:
```js
"use strict";

var _classCallCheck2 = require("@babel/runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var Person = function Person() {
  (0, _classCallCheck3.default)(this, Person);
};
```
Here, the `helper` function `classCallCheck` is no longer compiled, but instead references `helpers/classCallCheck` from `@babel/runtime`.

**Installation**
```
npm i -D @babel/plugin-transform-runtime @babel/runtime
```
**Usage**
In the `.babelrc` file
```
"plugins": [
        "@babel/plugin-transform-runtime"
]
```

References:
* [Babel 7.1 Introduction transform-runtime polyfill env](https://www.jianshu.com/p/d078b5f3036a)
* [Lazy Loading](http://webpack.docschina.org/guides/lazy-loading/)
* [Vue Route Lazy Loading](https://router.vuejs.org/zh/guide/advanced/lazy-loading.html#%E8%B7%AF%E7%94%B1%E6%87%92%E5%8A%A0%E8%BD%BD)
* [webpack caching](https://webpack.docschina.org/guides/caching/)
* [Step-by-step understanding of webpack4's splitChunk plugin](https://juejin.im/post/6844903614759043079)

### 11. Reduce Reflows and Repaints
**Browser Rendering Process**
1. Parse HTML to generate DOM tree.
2. Parse CSS to generate CSSOM rules tree.
3. Combine DOM tree and CSSOM rules tree to generate rendering tree.
4. Traverse the rendering tree to begin layout, calculating the position and size information of each node.
5. Paint each node of the rendering tree to the screen.

![Image description](https://img-blog.csdnimg.cn/img_convert/5647d9ad4ad5a57178919deae5175b83.png)

**Reflow**

When the position or size of DOM elements is changed, the browser needs to regenerate the rendering tree, a process called reflow.

**Repaint**

After regenerating the rendering tree, each node of the rendering tree needs to be painted to the screen, a process called repaint. Not all actions will cause reflow, for example, changing font color will only cause repaint. Remember, reflow will cause repaint, but repaint will not cause reflow.

Both reflow and repaint operations are very expensive because the JavaScript engine thread and the GUI rendering thread are mutually exclusive, and only one can work at a time.

What operations will cause reflow?
* Adding or removing visible DOM elements
* Element position changes
* Element size changes
* Content changes
* Browser window size changes

How to reduce reflows and repaints?
* When modifying styles with JavaScript, it's best not to write styles directly, but to replace classes to change styles.
* If you need to perform a series of operations on a DOM element, you can take the DOM element out of the document flow, make modifications, and then bring it back to the document. It's recommended to use hidden elements (display:none) or document fragments (DocumentFragement), both of which can implement this approach well.

### 12. Use Event Delegation
Event delegation takes advantage of event bubbling, allowing you to specify a single event handler to manage all events of a particular type. All events that use buttons (most mouse events and keyboard events) are suitable for the event delegation technique. Using event delegation can save memory.
```js
<ul>
  <li>Apple</li>
  <li>Banana</li>
  <li>Pineapple</li>
</ul>

// good
document.querySelector('ul').onclick = (event) => {
  const target = event.target
  if (target.nodeName === 'LI') {
    console.log(target.innerHTML)
  }
}

// bad
document.querySelectorAll('li').forEach((e) => {
  e.onclick = function() {
    console.log(this.innerHTML)
  }
}) 
```

### 13. Pay Attention to Program Locality
A well-written computer program often has good locality; it tends to reference data items near recently referenced data items or the recently referenced data items themselves. This tendency is known as the principle of locality. Programs with good locality run faster than those with poor locality.

**Locality usually takes two different forms:**
* Temporal locality: In a program with good temporal locality, memory locations that have been referenced once are likely to be referenced multiple times in the near future.
* Spatial locality: In a program with good spatial locality, if a memory location has been referenced once, the program is likely to reference a nearby memory location in the near future.

Temporal locality example
```js
function sum(arry) {
	let i, sum = 0
	let len = arry.length

	for (i = 0; i < len; i++) {
		sum += arry[i]
	}

	return sum
}
```
In this example, the variable sum is referenced once in each loop iteration, so it has good temporal locality.

Spatial locality example

**Program with good spatial locality**
```js
// Two-dimensional array 
function sum1(arry, rows, cols) {
	let i, j, sum = 0

	for (i = 0; i < rows; i++) {
		for (j = 0; j < cols; j++) {
			sum += arry[i][j]
		}
	}
	return sum
}
```
**Program with poor spatial locality**
```js
// Two-dimensional array 
function sum2(arry, rows, cols) {
	let i, j, sum = 0

	for (j = 0; j < cols; j++) {
		for (i = 0; i < rows; i++) {
			sum += arry[i][j]
		}
	}
	return sum
}
```
Looking at the two spatial locality examples above, the method of accessing each element of the array sequentially starting from each row, as shown in the examples, is called a reference pattern with a stride of 1.
If in an array, every k elements are accessed, it's called a reference pattern with a stride of k.
Generally, as the stride increases, spatial locality decreases.

What's the difference between these two examples? The difference is that the first example scans the array by row, scanning one row completely before moving on to the next row; the second example scans the array by column, scanning one element in a row and immediately going to scan the same column element in the next row.

Arrays are stored in memory in row order, resulting in the example of scanning the array row by row getting a stride-1 reference pattern with good spatial locality; while the other example has a stride of rows, with extremely poor spatial locality.

#### Performance Testing
Running environment:
* CPU: i5-7400 
* Browser: Chrome 70.0.3538.110

Testing spatial locality on a two-dimensional array with a length of 9000 (child array length also 9000) 10 times, taking the average time (milliseconds), the results are as follows:<br>

The examples used are the two spatial locality examples mentioned above.

|Stride 1|Stride 9000|
|-|-|
|124|2316|

From the test results above, the array with a stride of 1 executes an order of magnitude faster than the array with a stride of 9000.

Conclusion:
* Programs that repeatedly reference the same variables have good temporal locality
* For programs with a reference pattern with a stride of k, the smaller the stride, the better the spatial locality; while programs that jump around in memory with large strides will have very poor spatial locality

Reference:
* [Computer Systems: A Programmer's Perspective](https://book.douban.com/subject/26912767/)

### 14. if-else vs switch
As the number of judgment conditions increases, it becomes more preferable to use switch instead of if-else.
```js
if (color == 'blue') {

} else if (color == 'yellow') {

} else if (color == 'white') {

} else if (color == 'black') {

} else if (color == 'green') {

} else if (color == 'orange') {

} else if (color == 'pink') {

}

switch (color) {
    case 'blue':

        break
    case 'yellow':

        break
    case 'white':

        break
    case 'black':

        break
    case 'green':

        break
    case 'orange':

        break
    case 'pink':

        break
}
```
In situations like the one above, from a readability perspective, using switch is better (JavaScript's switch statement is not based on hash implementation but on loop judgment, so from a performance perspective, if-else and switch are the same).

### 15. Lookup Tables
When there are many conditional statements, using switch and if-else is not the best choice. In such cases, you might want to try lookup tables. Lookup tables can be constructed using arrays and objects.
```js
switch (index) {
    case '0':
        return result0
    case '1':
        return result1
    case '2':
        return result2
    case '3':
        return result3
    case '4':
        return result4
    case '5':
        return result5
    case '6':
        return result6
    case '7':
        return result7
    case '8':
        return result8
    case '9':
        return result9
    case '10':
        return result10
    case '11':
        return result11
}
```
This switch statement can be converted to a lookup table
```js
const results = [result0,result1,result2,result3,result4,result5,result6,result7,result8,result9,result10,result11]

return results[index]
```
If the conditional statements are not numerical values but strings, you can use an object to build a lookup table
```js
const map = {
  red: result0,
  green: result1,
}

return map[color]
```

### 16. Avoid Page Stuttering
**60fps and Device Refresh Rate**
>Currently, most devices have a screen refresh rate of 60 times/second. Therefore, if there's an animation or gradient effect on the page, or if the user is scrolling the page, the browser needs to render animations or pages at a rate that matches the device's screen refresh rate.
The budget time for each frame is just over 16 milliseconds (1 second / 60 = 16.66 milliseconds). But in reality, the browser has housekeeping work to do, so all your work needs to be completed within 10 milliseconds. If you can't meet this budget, the frame rate will drop, and content will jitter on the screen. This phenomenon is commonly known as stuttering and has a negative impact on user experience.

![Image description](https://img-blog.csdnimg.cn/img_convert/1beefa7a6e2094ded9feba3aec820158.png)

Suppose you use JavaScript to modify the DOM, trigger style changes, go through reflow and repaint, and finally paint to the screen. If any of these takes too long, it will cause the rendering time of this frame to be too long, and the average frame rate will drop. Suppose this frame took 50 ms, then the frame rate would be 1s / 50ms = 20fps, and the page would appear to stutter.

For some long-running JavaScript, we can use timers to split and delay execution.
```js
for (let i = 0, len = arry.length; i < len; i++) {
	process(arry[i])
}
```
Suppose the loop structure above takes too long due to either the high complexity of process() or too many array elements, or both, you might want to try splitting.
```js
const todo = arry.concat()
setTimeout(function() {
	process(todo.shift())
	if (todo.length) {
		setTimeout(arguments.callee, 25)
	} else {
		callback(arry)
	}
}, 25)
```
If you're interested in learning more, check out [High Performance JavaScript](https://github.com/woai3c/recommended-books/blob/master/%E5%89%8D%E7%AB%AF/%E9%AB%98%E6%80%A7%E8%83%BDJavaScript.pdf) Chapter 6 and [Efficient Front-end: Web Efficient Programming and Optimization Practices](https://book.douban.com/subject/30170670/) Chapter 3.

Reference:
* [Rendering Performance](https://developers.google.com/web/fundamentals/performance/rendering)

### 17. Use requestAnimationFrame to Implement Visual Changes
From point 16, we know that most devices have a screen refresh rate of 60 times/second, which means the average time per frame is 16.66 milliseconds. When using JavaScript to implement animation effects, the best case is that the code starts executing at the beginning of each frame. The only way to ensure JavaScript runs at the beginning of a frame is to use `requestAnimationFrame`.
```js
/**
 * If run as a requestAnimationFrame callback, this
 * will be run at the start of the frame.
 */
function updateScreen(time) {
  // Make visual updates here.
}

requestAnimationFrame(updateScreen);
```
If you use `setTimeout` or `setInterval` to implement animations, the callback function will run at some point in the frame, possibly right at the end, which can often cause us to miss frames, leading to stuttering.

![Image description](https://img-blog.csdnimg.cn/img_convert/28b8f4c10fdc39630158ebdabbbd5d2f.png)

Reference:
* [Optimize JavaScript Execution](https://developers.google.com/web/fundamentals/performance/rendering/optimize-javascript-execution?hl=zh-cn)

### 18. Use Web Workers
Web Workers use other worker threads to operate independently of the main thread. They can perform tasks without interfering with the user interface. A worker can send messages to the JavaScript code that created it by sending messages to the event handler specified by that code (and vice versa).

Web Workers are suitable for processing pure data or long-running scripts unrelated to the browser UI.

Creating a new worker is simple, just specify a script URI to execute the worker thread (main.js):


```js
var myWorker = new Worker('worker.js');
// You can send messages to the worker through the postMessage() method and onmessage event
first.onchange = function() {
  myWorker.postMessage([first.value, second.value]);
  console.log('Message posted to worker');
}

second.onchange = function() {
  myWorker.postMessage([first.value, second.value]);
  console.log('Message posted to worker');
}
```

In the worker, after receiving the message, we can write an event handler function code as a response (worker.js):
```js
onmessage = function(e) {
  console.log('Message received from main script');
  var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
  console.log('Posting message back to main script');
  postMessage(workerResult);
}
```

The onmessage handler function executes immediately after receiving the message, and the message itself is used as the data property of the event. Here we simply multiply the two numbers and use the postMessage() method again to send the result back to the main thread.

Back in the main thread, we use onmessage again to respond to the message sent back from the worker:
```js
myWorker.onmessage = function(e) {
  result.textContent = e.data;
  console.log('Message received from worker');
}
```

Here we get the data from the message event and set it as the textContent of result, so the user can directly see the result of the calculation.

Note that inside the worker, you cannot directly manipulate DOM nodes, nor can you use the default methods and properties of the window object. However, you can use many things under the window object, including data storage mechanisms such as WebSockets, IndexedDB, and Firefox OS-specific Data Store API.

Reference:
* [Web Workers](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers)

### 19. Use Bitwise Operations
Numbers in JavaScript are stored in 64-bit format using the IEEE-754 standard. But in bitwise operations, numbers are converted to 32-bit signed format. Even with the conversion, bitwise operations are much faster than other mathematical and boolean operations.

##### Modulo
Since the lowest bit of even numbers is 0 and odd numbers is 1, modulo operations can be replaced with bitwise operations.
```js
if (value % 2) {
	// Odd number
} else {
	// Even number 
}
// Bitwise operation
if (value & 1) {
	// Odd number
} else {
	// Even number
}
```
##### Floor
```js
~~10.12 // 10
~~10 // 10
~~'1.5' // 1
~~undefined // 0
~~null // 0
```
##### Bitmask
```js
const a = 1
const b = 2
const c = 4
const options = a | b | c
```
By defining these options, you can use the bitwise AND operation to determine if a/b/c is in the options.
```js
// Is option b in the options?
if (b & options) {
	...
}
```

### 20. Don't Override Native Methods
No matter how optimized your JavaScript code is, it can't match native methods. This is because native methods are written in low-level languages (C/C++) and compiled into machine code, becoming part of the browser. When native methods are available, try to use them, especially for mathematical operations and DOM manipulations.

### 21. Reduce the Complexity of CSS Selectors
#### (1). When browsers read selectors, they follow the principle of reading from right to left.

Let's look at an example
```css
#block .text p {
	color: red;
}
```
1. Find all P elements.
2. Check if the elements found in result 1 have parent elements with class name "text"
3. Check if the elements found in result 2 have parent elements with ID "block"

#### (2). CSS selector priority
```
Inline > ID selector > Class selector > Tag selector
```
Based on the above two pieces of information, we can draw conclusions.
1. The shorter the selector, the better.
2. Try to use high-priority selectors, such as ID and class selectors.
3. Avoid using the universal selector *.  

Finally, I should say that according to the materials I've found, there's no need to optimize CSS selectors because the performance difference between the slowest and fastest selectors is very small.

References:
* [CSS selector performance](https://ecss.io/appendix1.html)
* [Optimizing CSS: ID Selectors and Other Myths](https://www.sitepoint.com/optimizing-css-id-selectors-and-other-myths/)

### 22. Use Flexbox Instead of Earlier Layout Models
In early CSS layout methods, we could position elements absolutely, relatively, or using floats. Now, we have a new layout method [flexbox](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox), which has an advantage over earlier layout methods: better performance.

The screenshot below shows the layout cost of using floats on 1300 boxes:

![Image description](https://img-blog.csdnimg.cn/img_convert/742da2bd59ee7a319b9606d4a9592249.png)

Then we recreate this example using flexbox:

![Image description](https://img-blog.csdnimg.cn/img_convert/cc81f11a64d22a8cec4d95af8c167e76.png)

Now, for the same number of elements and the same visual appearance, the layout time is much less (3.5 milliseconds versus 14 milliseconds in this example).

However, flexbox compatibility is still an issue, not all browsers support it, so use it with caution.

Browser compatibility:
* Chrome 29+
* Firefox 28+
* Internet Explorer 11
* Opera 17+
* Safari 6.1+ (prefixed with -webkit-)
* Android 4.4+
* iOS 7.1+ (prefixed with -webkit-)

Reference:
* [Use flexbox instead of earlier layout models](https://developers.google.com/web/fundamentals/performance/rendering/avoid-large-complex-layouts-and-layout-thrashing?hl=zh-cn)

### 23. Use Transform and Opacity Properties to Implement Animations
In CSS, transforms and opacity property changes don't trigger reflow and repaint, they are properties that can be processed by the compositor alone.

![Image description](https://img-blog.csdnimg.cn/img_convert/fbd63916537c6b51773c2fb1442cf10c.png)

Reference:
* [Use transform and opacity property changes to implement animations](https://developers.google.com/web/fundamentals/performance/rendering/stick-to-compositor-only-properties-and-manage-layer-count?hl=zh-cn)

### 24. Use Rules Reasonably, Avoid Over-Optimization
Performance optimization is mainly divided into two categories:
1. Load-time optimization
2. Runtime optimization

Of the 23 suggestions above, the first 10 belong to load-time optimization, and the last 13 belong to runtime optimization. Usually, there's no need to apply all 23 performance optimization rules. It's best to make targeted adjustments based on the website's user group, saving effort and time.

Before solving a problem, you need to identify the problem first, otherwise you won't know where to start. So before doing performance optimization, it's best to investigate the website's loading and running performance.

##### Check Loading Performance
A website's loading performance mainly depends on white screen time and first screen time.
* White screen time: The time from entering the URL to when the page starts displaying content.
* First screen time: The time from entering the URL to when the page is completely rendered.

You can get the white screen time by placing the following script before `</head>`.
```html
<script>
  new Date() - performance.timing.navigationStart
  // You can also use domLoading and navigationStart
  performance.timing.domLoading - performance.timing.navigationStart
</script>
```
You can get the first screen time by executing `new Date() - performance.timing.navigationStart` in the `window.onload` event.

##### Check Runtime Performance

With Chrome's developer tools, we can check the website's performance during runtime.

Open the website, press F12 and select performance, click the gray dot in the upper left corner, it turns red to indicate it has started recording. At this point, you can simulate users using the website, and after you're done, click stop, then you'll see the website's performance report during the runtime. If there are red blocks, it means there are frame drops; if it's green, it means the FPS is good. For detailed usage of performance, please search using a search engine, as the scope is limited.

By checking the loading and runtime performance, I believe you already have a general understanding of the website's performance. So what you need to do now is to use the 23 suggestions above to optimize your website. Go for it!

References:
* [performance.timing.navigationStart](https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceTiming/navigationStart)

## Other References
* [Why Performance Matters](https://developers.google.com/web/fundamentals/performance/why-performance-matters?hl=zh-cn)
* [High-Performance Website Construction Guide](https://github.com/woai3c/recommended-books/blob/master/%E5%89%8D%E7%AB%AF/%E9%AB%98%E6%80%A7%E8%83%BD%E7%BD%91%E7%AB%99%E5%BB%BA%E8%AE%BE%E6%8C%87%E5%8D%97.pdf)
* [Web Performance Authority Guide](https://github.com/woai3c/recommended-books/blob/master/%E5%89%8D%E7%AB%AF/Web%E6%80%A7%E8%83%BD%E6%9D%83%E5%A8%81%E6%8C%87%E5%8D%97.pdf)
* [High-Performance JavaScript](https://github.com/woai3c/recommended-books/blob/master/%E5%89%8D%E7%AB%AF/%E9%AB%98%E6%80%A7%E8%83%BDJavaScript.pdf)
* [Efficient Front-end: Web Efficient Programming and Optimization Practices](https://book.douban.com/subject/30170670/)
