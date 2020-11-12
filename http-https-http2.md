# 半小时搞懂 HTTP、HTTPS和HTTP2

本文将尽量用通俗易懂的方式来向读者讲述 HTTP 的知识。

另外，建议在学习 HTTP 知识的时候，利用 Chrome 开发者工具来做实践，这可以帮助你理解得更深刻。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201111210314964.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70#pic_center)

（此图在网上找来的，侵删）
## HTTP 概述
HTTP 超文本传输​​协议是位于 TCP/IP 体系结构中的应用层协议，它是万维网数据通信的基础。

当我们访问一个网站时，需要通过统一资源定位符（uniform resource locator，URL）来定位服务器并获取资源。
```
<协议>://<域名>:<端口>/<路径>
```
一个 URL 的一般形式通常如上所示（`http://test.com/index.html` ），现在最常用的协议就是 HTTP，HTTP 的默认端口是 80，通常可以省略。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200515112635158.png)
## HTTP/1.1
HTTP/1.1 是目前使用最广泛的版本，一般没有特别标明版本都是指 HTTP/1.1。

### HTTP 连接建立过程
我们来看一下在浏览器输入 URL 后获取 HTML 页面的过程。
1. 先通过[域名系统（Domain Name System，DNS）](https://baike.baidu.com/item/%E5%9F%9F%E5%90%8D%E7%B3%BB%E7%BB%9F%EF%BC%88%E6%9C%8D%E5%8A%A1%EF%BC%89%E5%8D%8F%E8%AE%AE/15134609?fromtitle=dns&fromid=427444)查询将域名转换为 IP 地址。即将 `test.com` 转换为 `221.239.100.30` 这一过程。
2. 通过三次握手（稍后会讲）建立 TCP 连接。
3. 发起 HTTP 请求。
4. 目标服务器接收到 HTTP 请求并处理。
5. 目标服务器往浏览器发回 HTTP 响应。
6. 浏览器解析并渲染页面。

下图中的 RTT 为往返时延（Round-Trip Time： 往返时延。表示从发送端发送数据开始，到发送端收到来自接收端的确认，总共经历的时延）。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200515114014659.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)
### HTTP 连接拆除过程
所有 HTTP 客户端（浏览器）、服务器都可在任意时刻关闭 TCP 连接。通常会在一条报文结束时关闭连接，但出错的时候，也可能在首部行的中间或其他任意位置关闭连接。

### TCP 三次握手和四次挥手
由于 HTTP 是基于 TCP 的，所以打算在这补充一下 TCP 连接建立和拆除的过程。

首先，我们需要了解一些 TCP 报文段的字段和标志位：
1. 32 比特的序号字段和确认号字段，TCP 字节流每一个字节都按顺序编号。确认号是接收方期望从对方收到的下一字节的序号。
2. ACK 标志位，用于指示确认字段中的值是有效的 ACK=1 有效，ACK=0 无效。
3. SYN 标志位，用于连接建立，SYN 为 1 时，表明这是一个请求建立连接报文。
4. FIN 标志位，用于连接拆除，FIN 为 1 时，表明发送方数据已发送完毕，并要求释放连接。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516195526169.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)
#### TCP 三次握手建立连接
TCP 标准规定，ACK 报文段可以携带数据，但不携带数据就不用消耗序号。
1. 客户端发送一个不包含应用层数据的 TCP 报文段，首部的 SYN 置为 1，随机选择一个初始序号（一般为 0）放在 TCP 报文段的序号字段中。（SYN 为 1 的时候，不能携带数据，但要消耗掉一个序号）
2. TCP 报文段到达服务器主机后，服务器提取报文段，并为该 TCP 连接分配缓存和变量。然后向客户端发送允许连接的 ACK 报文段（不包含应用层数据）。这个报文段的首部包含 4 个信息：ACK 置 为 1，SYN 置为 1；确认号字段置为客户端的序号 + 1；随机选择自己的初始序号（一般为 0）。
3. 收到服务器的 TCP 响应报文段后，客户端也要为该 TCP 连接分配缓存和变量，并向服务器发送一个 ACK 报文段。这个报文段将服务器端的序号 + 1 放置在确认号字段中，用来对服务器允许连接的报文段进行响应，因为连接已经建立，所以 SYN 置为 0。最后一个阶段，报文段可以携带客户到服务器的数据。并且以后的每一个报文段，SYN 都置为 0。

下图是一个具体的示例：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516200926474.png)

（此截图是我使用 Wireshark 抓包工具截取的 TCP 报文段截图）。
#### TCP 四次挥手拆除连接
FIN 报文段即使不携带数据，也要消耗序号。
1. 客户端发送一个 FIN 置为 1 的报文段。
2. 服务器回送一个确认报文段。
3. 服务器发送 FIN 置为 1 的报文段。
4. 客户端回送一个确认报文段。

#### TCP 为什么是四次挥手，而不是三次？
1. 当 A 给 B 发送 FIN 报文时，代表 A 不再发送报文，但仍可以接收报文。
2. B 可能还有数据需要发送，因此先发送 ACK 报文，告知 A “我知道你想断开连接的请求了”。这样 A 便不会因为没有收到应答而继续发送断开连接的请求（即 FIN 报文）。
3. B 在处理完数据后，就向 A 发送一个 FIN 报文，然后进入 LAST_ACK 阶段（超时等待）。
4. A 向 B 发送 ACK 报文，双方都断开连接。


参考资料：
* [知乎网友-魔方的回答](https://www.zhihu.com/question/63264012)

### HTTP 报文格式
HTTP 报文由请求行、首部、实体主体组成，它们之间由 CRLF（回车换行符） 分隔开。

**注意：实体包括首部(也称为实体首部)和实体主体，sp 即是空格 space**。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200515150351783.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

请求行和首部是由 ASCII 文本组成的，实体主体是可选的，可以为空也可以是任意二进制数据。

请求报文和响应报文的格式基本相同。

**请求报文格式**：
```
<method> <request-URL> <version>
<headers>
<entity-body>
```
**响应报文格式**：
```
<version> <status> <reason-phrase>
<headers>
<entity-body>
```

**一个请求或响应报文由以下字段组成**：
1. 请求方法，客户端希望服务器对资源执行的动作。
2. 请求 URL，命名了所请求的资源。
3. 协议版本，报文所使用的 HTTP 版本。
4. 状态码，这三位数字描述了请求过程中所发生的情况。
5. 原因短语，数字状态码的可读版本（例如上面的响应示例跟在 200 后面的 OK，一般按规范写最好）。
6. 首部，可以有零或多个首部。
7. 实体的主体部分，可以为空也可以包含任意二进制数据。


**一个 HTTP 请求示例**：
```
GET /2.app.js HTTP/1.1
Host: 118.190.217.8:3389
Connection: keep-alive
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
Accept: */*
Referer: http://118.190.217.8:3389/
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
```
**一个 HTTP 响应示例**：
```
HTTP/1.1 200 OK
X-Powered-By: Express
Accept-Ranges: bytes
Cache-Control: public, max-age=0
Last-Modified: Sat, 07 Mar 2020 03:52:30 GMT
ETag: W/"253e-170b31f7de7"
Content-Type: application/javascript; charset=UTF-8
Vary: Accept-Encoding
Content-Encoding: gzip
Date: Fri, 15 May 2020 05:38:05 GMT
Connection: keep-alive
Transfer-Encoding: chunked
```
#### 方法

|方法| 描述 |
|-|-|
|GET|从服务器获取一份文档|
|HEAD|只从服务器获取文档的头部|
|POST|向服务器发送需要处理的数据|
|PUT|将请求的数据部分存储在服务器上|
|TRACE|对可能经过代理服务器传送到服务器上去的报文进行追踪|
|OPTIONS|决定可以在服务器上执行哪些方法|
|DELETE|从服务器上删除一份文档|

##### GET 和 HEAD
其中 GET 和 HEAD 被称为安全方法，因为它们是幂等的（如果一个请求不管执行多少次，其结果都是一样的，这个请求就是**幂等的**），类似于 POST 就不是幂等的。

HEAD 方法和 GET 方法很类似，但服务器在响应中只返回首部。这就允许客户端在未获取实际资源的情况下，对资源的首部进行检查。使用 HEAD，可以：
1. 在不获取资源的情况下了解资源的情况。
2. 通过查看响应状态码，看看某个对象是否存在。
3. 通过查看首部，了解测试资源是否被修改了。

服务器开发者必须确保返回的首部与 GET 请求所返回的首部完全相同。遵循 HTTP/1.1 规范，就必须实现 HEAD 方法。
##### PUT
与 GET 方法从服务器读取文档相反，PUT 方法会向服务器写入文档。PUT 方法的语义就是让服务器用请求的主体部分来创建一个由所请求的 URL 命名的新文档。 如果那个文档已存在，就覆盖它。

##### POST
POST 方法通常用来向服务器发送表单数据。

##### TRACE
客户端发起一个请求时，这个请求可能要穿过路由器、防火墙、代理、网关等。每个中间节点都可能会修改原始的 HTTP 请求，TRACE 方法允许客户端在最终发起请求时，看看它变成了什么样子。

TRACE 请求会在目的服务器端发起一个“环回”诊断。行程最后一站的服务器会弹回一条 TRACE 响应，并在响应主体中携带它收到的原始请求报文。 这样客户端就可以查看在所有中间 HTTP 应用程序组成的请求/响应链上，原始报文是否被毁坏或修改过。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200515142917465.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

TRACE 方法主要用于诊断，用于验证请求是否如愿穿过了请求/响应链。它也是一种工具，用来查看代理和其他应用程序对用户请求所产生的效果。 TRACE 请求中不能带有实体的主体部分。TRACE 响应的实体主体部分包含了响应服务器收到的请求的精确副本。

##### OPTIONS
OPTIONS 方法请求 Web 服务器告知其支持的各种功能。
##### DELETE
DELETE 方法就是让服务器删除请求 URL 所指定的资源。

#### 状态码
|整体范围| 已定义范围 | 分类 |
|-|-|-|
|100~199|100~101|信息提示|
|200~299|200~206|成功|
|300~399|300~305|重定向|
|400~499|400~415|客户端错误|
|500~599|500~505|服务器错误|

##### 300~399 重定向状态码
重定向状态码要么告诉客户端使用替代位置来访问他们感兴趣的资源，要么提供一个替代的响应而不是资源的内容。 如果资源已被移动，可以发送一个重定向状态码和一个可选的 Location 首部来告知客户端资源已被移走，以及现在在哪里可以找到它。这样，浏览器可以在不打扰使用者的情况下，透明地转入新的位置。

##### 400~499 客户端错误状态码
有时客户端会发送一些服务器无法处理的东西，例如格式错误的请求报文、一个不存在的 URL。

##### 500~599 服务器错误状态码
有时客户端发送了一条有效请求，服务器自身却出错了。

#### 首部
首部和方法共同配合工作，决定了客户端和服务器能做什么事情。

**首部分类**：
1. 通用首部，可以出现在请求或响应报文中。
2. 请求首部，提供更多有关请求的信息。
3. 响应首部，提供更多有关响应的信息。
4. 实体首部，描述主体的长度和内容，或者资源自身。
5. 扩展首部，规范中没有定义的新首部。

##### 通用首部
有些首部提供了与报文相关的最基本信息，它们被称为通用首部。以下是一些常见的通用首部：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200515144159939.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)
##### 请求首部
请求首部是只在请求报文中有意义的首部，用于说明请求的详情。以下是一些常见的请求首部：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200515144349828.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)
##### 响应首部
响应首部让服务器为客户端提供了一些额外的信息。

##### 实体首部
实体首部提供了有关实体及其内容的大量信息，从有关对象类型的信息，到能够对资源使用的各种有效的请求方法。

例如**内容首部**，提供了与实体内容有关的特定信息，说明了其类型、尺寸以及处理它所需的其他有用信息。
另外，通用的缓存首部说明了如何或什么时候进行缓存。**实体的缓存首部**提供了与被缓存实体有关的信息。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200515151459881.png)
### 性能优化
#### 1. 减少 HTTP 请求
每发起一个 HTTP 请求，都得经历三次握手建立 TCP 连接，如果连接只用来交换少量数据，这个过程就会严重降低 HTTP 性能。所以我们可以将多个小文件合成一个大文件，从而减少 HTTP 请求次数。

其实由于持久连接（重用 TCP 连接，以消除连接及关闭时延；HTTP/1.1 默认开启持久连接）的存在，每个新请求不一定都需要建立一个新的 TCP 连接。但是，浏览器处理完一个 HTTP 请求才能发起下一个，所以在 TCP 连接数没达到浏览器规定的上限时，还是会建立新的 TCP 连接。从这点来看，减少 HTTP 请求仍然是有必要的。
#### 2. 静态资源使用 CDN
内容分发网络（CDN）是一组分布在多个不同地理位置的 Web 服务器。我们都知道，当服务器离用户越远时，延迟越高。CDN 就是为了解决这一问题，在多个位置部署服务器，让用户离服务器更近，从而缩短请求时间。
#### 3. 善用缓存
为了避免用户每次访问网站都得请求文件，我们可以通过添加 Expires 头来控制这一行为。Expires 设置了一个时间，只要在这个时间之前，浏览器都不会请求文件，而是直接使用缓存。

不过这样会产生一个问题，当文件更新了怎么办？怎么通知浏览器重新请求文件？

可以通过更新页面中引用的资源链接地址，让浏览器主动放弃缓存，加载新资源。

具体做法是把资源地址 URL 的修改与文件内容关联起来，也就是说，只有文件内容变化，才会导致相应 URL 的变更，从而实现文件级别的精确缓存控制。什么东西与文件内容相关呢？我们会很自然的联想到利用[数据摘要要算法](https://baike.baidu.com/item/%E6%B6%88%E6%81%AF%E6%91%98%E8%A6%81%E7%AE%97%E6%B3%95/3286770?fromtitle=%E6%91%98%E8%A6%81%E7%AE%97%E6%B3%95&fromid=12011257)对文件求摘要信息，摘要信息与文件内容一一对应，就有了一种可以精确到单个文件粒度的缓存控制依据了。

参考资料：
* [张云龙--大公司里怎样开发和部署前端代码？](https://www.zhihu.com/question/20790576/answer/32602154)

#### 4. 压缩文件
压缩文件可以减少文件下载时间，让用户体验性更好。

gzip 是目前最流行和最有效的压缩方法。可以通过向 HTTP 请求头中的 Accept-Encoding 头添加 gzip 标识来开启这一功能。当然，服务器也得支持这一功能。

举个例子，我用 Vue 开发的项目构建后生成的 app.js 文件大小为 1.4MB，使用 gzip 压缩后只有 573KB，体积减少了将近 60%。

#### 5. 通过 max-age 和 no-cache 实现文件精确缓存
 通用消息头部 `Cache-Control` 其中有两个选项：
 1. `max-age`: 设置缓存存储的最大周期，超过这个时间缓存被认为过期(单位秒)。在这个时间前，浏览器读取文件不会发出新请求，而是直接使用缓存。
2. `no-cache`: 指定 no-cache 表示客户端可以缓存资源，每次使用缓存资源前都必须重新验证其有效性。

我们可以将那些长期不变的静态资源设置一个非常长的缓存时间，例如设置成缓存一年。

然后将 `index.html` 文件设置成 `no-cache`。这样每次访问网站时，浏览器都会询问 `index.html` 是否有更新，如果没有，就使用旧的 `index.html` 文件。如果有更新，就读取新的 `index.html` 文件。当加载新的 `index.html` 时，也会去加载里面新的  URL 资源。

例如 `index.html` 原来引用了 `a.js` 和 `b.js`，现在更新了变成 `a.js` 和 `c.js`。那就只会加载 `c.js` 文件。

具体请看 [webpack + express 实现文件精确缓存](https://github.com/woai3c/node-blog/blob/master/doc/node-blog7.md)。
## HTTPS
HTTPS 是最流行的 HTTP 安全形式，由网景公司首创，所有主要的浏览器和服务器都支持此协议。 使用 HTTPS 时，所有的 HTTP 请求和响应数据在发送之前，都要进行加密。加密可以使用 SSL 或 TLS。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200515163019467.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

SSL/TLS 协议作用在 HTTP 协议之下，对于上层应用来说，原来的发送/接收数据流程不变，这就很好地兼容了老的 HTTP 协议。由于 SSL/TLS 差别不大，下面统一使用 SSL。

要想了解 HTTPS 为何安全，还得继续了解一下这些概念：**加密算法**、**摘要算法**、**数字签名**和**数字证书**。

### 加密算法
#### 对称密钥密码体制
对称密钥密码体制，即加密密钥和解密密钥是使用相同的密码体制。对称密钥加密技术的缺点之一就是发送者和接收者在对话之前，一定要有一个共享的密钥，所以不太安全。
#### 公钥密码体制
公钥密码体制使用不同的加密密钥与解密密钥。公钥密码体制产生的主要原因有两个：一是对称密钥密码体制的密钥分配问题，二是对数字签名的需求。

在公钥密码体制中，加密密钥是公开的，解密密钥是需要保密的，加密算法和解密算法也是公开的。

公钥密码体制的加密和解密有如下特点：
1. **密钥对产生器**产生出接收者 B 的一对密钥，即加密密钥 PK 和解密密钥 SK。
2. 发送者 A 用 B 的公钥 PK 作为加密密钥来加密信息，B 接收后用解密密钥 SK 解密。

![\[外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传(img-uWP5p7So-1589532545350)(../imgs/is3.png)\]](https://img-blog.csdnimg.cn/202005151646456.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

使用对称密钥时，由于双方使用同样的密钥，因此在通信信道上可以进行一对一的双向保密通信，双方都可以用同一个密钥加密解密。

使用公开密钥时，在通信信道上可以是多对一的单向保密信道。即可以有多人持有 B 的公钥，但只有 B 才能解密。
### 摘要算法
摘要算法的主要特征是加密过程不需要密钥，并且经过加密的数据无法被解密，目前可以被解密逆向的只有CRC32算法，只有输入相同的明文数据经过相同的消息摘要算法才能得到相同的密文。

### 数字签名
用加密系统对报文进行签名，以说明是谁编写的报文，同时证明报文未被篡改过，这种技术称为**数字签名**。

数字签名是附加在报文上的特殊加密校验码。使用数字签名的好处有：
1. 签名可以证明是作者编写了这条报文。只有作者才会有最机密的私有密钥，因此，只有作者才能计算出这些校验和。
2. 签名可以防止报文被篡改，如果有人在报文传输过程中对其进行了修改，校验和就不再匹配了。

数字签名通常是用非对称公开密钥技术产生的。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200515165509385.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

看上图，任何人都能用 A 的公钥 PK 对密文进行 E 运算后得到 A 发送的明文。可见这种通信并非为了保密，而是为了进行签名和核实签名，即确认此信息是 A 发送的（使用 A 的密钥进行加密的报文，只有使用 A 的公钥才能正确解密）。 但上述过程仅对报文进行了签名，对报文 X 本身却未保密，所以要采用下图的方法，同时实现秘密通信和数字签名。

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020051517022758.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)
### 数字证书
假如你想访问一个网站，怎么确保对方给你的公钥是你想访问的网站的公钥，而不是被中间人篡改过的？

数字证书的出现就是为了解决这个问题，它是由数字证书认证机构颁发的，用来证明公钥拥有者的身份。换句话说，数字证书的作用就相当于人的身份证，身份证证明了张三就是张三，而不是别人。

**数字证书一般包含以下内容**：
1. 对象的名称（人、服务器、组织等）；
2. 过期时间；
3. 证书发布者（由谁为证书担保）；
4. 来自证书发布者的数字签名；
5. 对象的公钥；
6. 对象和所用签名算法的描述性信息。

任何人都可以创建一个数字证书，但由谁来担保才是重点。

**数字证书的数字签名计算过程**：
1. 用摘要算法对数字证书的内容计算出摘要；
2. 用数字证书的私钥对摘要进行加密得到数字签名。

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020051520222228.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

当浏览器收到证书时，会对签名颁发机构进行验证，如果颁发机构是个很有权威的公共签名机构，浏览器可能就知道其公开密钥了（浏览器会预装很多签名颁发机构的证书）。如果对签名颁发机构一无所知，浏览器通常会向用户显示一个对话框，看看他是否相信这个签名发布者。

因为数字证书的公钥是公开的，任何人都可以用公钥解密出数字证书的数字签名的摘要，然后再用同样的摘要算法对证书内容进行摘要计算，将得出的摘要和解密后的摘要作对比，如果内容一致则说明这个证书没有被篡改过，可以信任。

这个过程是建立在被大家所认可的证书机构之上得到的公钥，所以这是一种安全的方式。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200515174341422.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)
### HTTPS 连接建立过程
HTTPS 连接建立过程和 HTTP 差不多，区别在于 HTTP（默认端口 80） 请求只要在 TCP 连接建立后就可以发起，而 HTTPS（默认端口 443） 在 TCP 连接建立后，还需要经历 SSL 协议握手，成功后才能发起请求。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200515214925750.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200515215036491.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

我知道肯定会有人不满足于简化版的 SSL 握手过程，所以我找了一篇文章[SSL/TLS 握手过程详解](https://www.jianshu.com/p/7158568e4867)，这篇文章非常详细的讲解了 SSL 握手的每一步骤。建议有兴趣的同学看一看。
## HTTP/2
HTTP/2 是 HTTP/1.x 的扩展，而非替代。所以 HTTP 的语义不变，提供的功能不变，HTTP 方法、状态码、URL 和首部字段等这些核心概念也不变。

之所以要递增一个大版本到 2.0，主要是因为它改变了客户端与服务器之间交换数据的方式。HTTP 2.0 增加了新的二进制分帧数据层，而这一层并不兼容之前的 HTTP 1.x 服务器及客户端——是谓 2.0。
### HTTP/2 连接建立过程
现在的主流浏览器 HTTP/2 的实现都是基于 SSL/TLS 的，也就是说使用 HTTP/2 的网站都是 HTTPS 协议的，所以本文只讨论基于 SSL/TLS 的 HTTP/2 连接建立过程。

基于 SSL/TLS 的 HTTP/2 连接建立过程和 HTTPS 差不多。在 SSL/TLS 握手协商过程中，客户端在 ClientHello 消息中设置 ALPN（应用层协议协商）扩展来表明期望使用 HTTP/2 协议，服务器用同样的方式回复。通过这种方式，HTTP/2 在 SSL/TLS 握手协商过程中就建立起来了。

### HTTP/1.1 的问题
#### 1. 队头阻塞
在 HTTP 请求应答过程中，如果出现了某种情况，导致响应一直未能完成，那后面所有的请求就会一直阻塞着，这种情况叫队头阻塞。
#### 2. 低效的 TCP 利用
由于 [TCP 慢启动机制](https://baike.baidu.com/item/%E6%85%A2%E5%90%AF%E5%8A%A8/8242395)，导致每个 TCP 连接在一开始的时候传输速率都不高，在处理多个请求后，才会慢慢达到“合适”的速率。对于请求数据量很小的 HTTP 请求来说，这种情况就是种灾难。
#### 3. 臃肿的消息首部
HTTP/1.1 的首部无法压缩，再加上 cookie 的存在，经常会出现首部大小比请求数据大小还大的情况。
#### 4. 受限的优先级设置
HTTP/1.1 无法为重要的资源指定优先级，每个 HTTP 请求都是一视同仁。


在继续讨论 HTTP/2 的新功能之前，先把 HTTP/1.1 的问题列出来是有意义的。因为 HTTP/2 的某些新功能就是为了解决上述某些问题而产生的。

### 二进制分帧层
HTTP/2 是基于帧的协议。采用分帧是为了将重要信息封装起来，让协议的解析方可以轻松阅读、解析并还原信息。

而 HTTP/1.1 是以文本分隔的。解析 HTTP/1.1 不需要什么高科技，但往往速度慢且容易出错。你需要不断地读入字节，直到遇到分隔符 CRLF 为止，同时还要考虑不守规矩的客户端，它只会发送 LF。

解析 HTTP/1.1 的请求或响应还会遇到以下问题：
1. 一次只能处理一个请求或响应，完成之前不能停止解析。
2. 无法预判解析需要多少内存。

HTTP/2 有了帧，处理协议的程序就能预先知道会收到什么，并且 HTTP/2 有表示帧长度的字段。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516110854683.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

#### 帧结构
```
 +-----------------------------------------------+
 |                 Length (24)                   |
 +---------------+---------------+---------------+
 |   Type (8)    |   Flags (8)   |
 +-+-------------+---------------+-------------------------------+
 |R|                 Stream Identifier (31)                      |
 +=+=============================================================+
 |                   Frame Payload (0...)                      ...
 +---------------------------------------------------------------+
 ```
|名称|长度|描述|
|-|-|-|
|Length|3 字节|表示帧负载的长度，取值范围为 （2 的 14 次方）至 （2 的 24 次方 - 1）。（2 的 14 次方） 16384 字节是默认的最大帧大小，如果需要更大的帧，必须在 SETTINGS 帧中设置|
|Type|1 字节|当前帧类型（见下表）|
|Flags|1 字节|具体帧类型的标识|
|R|1 位|保留位，不要设置，否则可能会带来严重的后果|
|Stream Identifier|31 位|每个流的唯一 ID|
|Frame Payload|长度可变|真实的帧内容，长度是在 Length 字段中设置的|

由于  HTTP/2 是分帧的，请求和响应都可以多路复用，有助于解决类似类似队头阻塞的问题。
#### 帧类型
|名称|ID|描述|
|-|-|-|
|DATA|0x0|传输流的核心内容|
|HEADERS|0x1|包含 HTTP 首部，和可选的优先级参数|
|PRIORITY|0x2|指示或更改流的优先级和依赖|
|RST_STREAM|0x3|允许一端停止流（通常由于错误导致的）|
|SETTINGS|0x4|协商连接级参数|
|PUSH_PROMISE|0x5|提示客户端，服务器要推送些东西|
|PING|0x6|测试连接可用性和往返时延（RTT）|
|GOAWAY|0x7|告诉另一端，当前的端已结束|
|WINDOW_UPDATE|0x8|协商一端将要接收多少字节（用于流量控制）|
|CONTINUATION|0x9|用以扩展 HEADERS 模块|

### 多路复用
在 HTTP/1.1 中，如果客户端想发送多个并行的请求，那么必须使用多个 TCP 连接。

而 HTTP/2 的二进制分帧层突破了这一限制，所有的请求和响应都在同一个 TCP 连接上发送：客户端和服务器把 HTTP 消息分解成多个帧，然后乱序发送，最后在另一端再根据流 ID 重新组合起来。

这个机制为 HTTP 带来了巨大的性能提升，因为：
* 可以并行交错地发送请求，请求之间互不影响；
* 可以并行交错地发送响应，响应之间互不干扰；
* 只使用一个连接即可并行发送多个请求和响应；
* 消除不必要的延迟，从而减少页面加载的时间；
* 不必再为绕过 HTTP 1.x 限制而多做很多工作；

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516152311651.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)
### 流
HTTP/2 规范对流的定义是：HTTP/2 连接上独立的、双向的帧序列交换。如果客户端想要发出请求，它会开启一个新流，然后服务器在这个流上回复。 由于有分帧，所以多个请求和响应可以交错，而不会互相阻塞。流 ID 用来标识帧所属的流。

客户端到服务器的 HTTP/2 连接建立后，通过发送 HEADERS 帧来启动新的流。如果首部需要跨多个帧，可能还会发送 CONTINUATION 帧。该 HEADERS 帧可能来自请求或响应。 后续流启动的时候，会发送一个带有递增流 ID 的新 HEADERS 帧。

#### 消息
HTTP 消息泛指 HTTP 请求或响应，消息由一或多个帧组成，这些帧可以乱序发送，然后再根据每个帧首部的流 ID 重新组装。

一个消息至少由 HEADERS 帧（它初始化流）组成，并且可以另外包含 CONTINUATION 和 DATA 帧，以及其他的 HEADERS 帧。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516131657412.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

HTTP/1.1 的请求和响应部分都分成消息首部和消息体两部分；HTTP/2 的请求和响应分成 HEADERS 帧和 DATA 帧。

#### 优先级
把 HTTP 消息分解为很多独立的帧之后，就可以通过优化这些帧的交错和传输顺序，进一步提升性能。

通过 HEADERS 帧和 PRIORITY 帧，客户端可以明确地和服务器沟通它需要什么，以及它需要这些资源的顺序。具体来讲，服务器可以根据流的优先级，控制资源分配（CPU、内存、带宽），而在响应数据准备好之后，优先将最高优先级的帧发送给客户端。
#### 流量控制
在同一个 TCP 连接上传输多个数据流，就意味着要共享带宽。标定数据流的优先级有助于按序交付，但只有优先级还不足以确定多个数据流或多个连接间的资源分配。

为解决这个问题，HTTP/2 为数据流和连接的流量控制提供了一个简单的机制：
* 流量控制基于每一跳进行，而非端到端的控制；
* 流量控制基于 WINDOW_UPDATE 帧进行，即接收方广播自己准备接收某个数据流的多少字节，以及对整个连接要接收多少字节；
* 流量控制窗口大小通过  WINDOW_UPDATE 帧更新，这个字段指定了流 ID 和窗口大小递增值；
* 流量控制有方向性，即接收方可能根据自己的情况为每个流乃至整个连接设置任意窗口大小；
* 流量控制可以由接收方禁用，包括针对个别的流和针对整个连接。 

HTTP/2 连接建立之后，客户端与服务器交换 SETTINGS 帧，目的是设置双向的流量控制窗口大小。除此之外，任何一端都可以选择禁用个别流或整个连接的流量控制。

### 服务器推送
HTTP/2 新增的一个强大的新功能，就是服务器可以对一个客户端请求发送多个响应。换句话说，除了对最初请求的响应外，服务器还可以额外向客户端推送资源，而无需客户端明确地请求。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516141241927.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3E0MTEwMjAzODI=,size_16,color_FFFFFF,t_70)

为什么需要这样一个机制呢？通常的 Web 应用都由几十个资源组成，客户端需要分析服务器提供的文档才能逐个找到它们。那为什么不让服务器提前就把这些资源推送给客户端，从而减少额外的时间延迟呢？服务器已经知道客户端下一步要请求什么资源了，这时候服务器推送即可派上用场。

另外，客户端也可以拒绝服务器的推送。

### 首部压缩
HTTP/1.1 存在的一个问题就是臃肿的首部，HTTP/2 对这一问题进行了改进，可以对首部进行压缩。
在一个 Web 页面中，一般都会包含大量的请求，而其中有很多请求的首部往往有很多重复的部分。

例如有如下两个请求：
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
从上面两个请求可以看出来，有很多数据都是重复的。如果可以把相同的首部存储起来，仅发送它们之间不同的部分，就可以节省不少的流量，加快请求的时间。

HTTP/2 在客户端和服务器端使用“首部表”来跟踪和存储之前发送的键－值对，对于相同的数据，不再通过每次请求和响应发送。

下面再来看一个简化的例子，假设客户端按顺序发送如下请求首部：
```
Header1:foo
Header2:bar
Header3:bat
```
当客户端发送请求时，它会根据首部值创建一张表：

|索引|首部名称|值|
|-|-|-|
|62|Header1|foo|
|63|Header2|bar|
|64|Header3|bat|

如果服务器收到了请求，它会照样创建一张表。
当客户端发送下一个请求的时候，如果首部相同，它可以直接发送这样的首部块：
```
62 63 64
```
服务器会查找先前建立的表格，并把这些数字还原成索引对应的完整首部。

### 性能优化
使用 HTTP/2 代替 HTTP/1.1，本身就是一种巨大的性能提升。
这小节要聊的是在 HTTP/1.1 中的某些优化手段，在 HTTP/2 中是不必要的，可以取消的。
##### 取消合并资源
在 HTTP/1.1 中要把多个小资源合并成一个大资源，从而减少请求。而在 HTTP/2 就不需要了，因为 HTTP/2 所有的请求都可以在一个 TCP 连接发送。
##### 取消域名拆分
取消域名拆分的理由同上，再多的 HTTP 请求都可以在一个 TCP 连接上发送，所以不需要采取多个域名来突破浏览器 TCP 连接数限制这一规则了。

## 参考资料
* [HTTP权威指南](https://book.douban.com/subject/10746113/)
* [HTTP/2基础教程](https://book.douban.com/subject/27665112/)
* [SSL/TLS 握手过程详解](https://www.jianshu.com/p/7158568e4867)
* [互联网安全之数字签名、数字证书与PKI系统](https://www.jianshu.com/p/ffe8c203a471)
* [计算机网络（第7版）](https://book.douban.com/subject/26960678/)
* [Web性能权威指南](https://book.douban.com/subject/25856314/)

#### [更多文章，敬请关注](https://www.zhihu.com/people/tan-guang-zhi-19/posts)
