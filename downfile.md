# 前端下载二进制流文件
平时在前端下载文件有两种方式，一种是后台提供一个 URL，然后用 `window.open(URL)` 下载，另一种就是后台直接返回文件的二进制内容，然后前端转化一下再下载。

由于第一种方式比较简单，在此不做探讨。本文主要讲解一下第二种方式怎么实现。

## [Blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob)、ajax(axios)
mdn 上是这样介绍 `Blob` 的：
> Blob 对象表示一个不可变、原始数据的类文件对象。Blob 表示的不一定是JavaScript原生格式的数据

具体使用方法
```js
axios({
  method: 'post',
  url: '/export',
})
.then(res => {
  // 假设 data 是返回来的二进制数据
  const data = res.data
  const url = window.URL.createObjectURL(new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}))
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', 'excel.xlsx')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
})
```
打开下载的文件，看看结果是否正确。

![img1](https://github.com/woai3c/Front-end-articles/blob/master/imgs/downfile1.jpg)

一堆乱码...

一定有哪里不对。

最后发现是参数 `responseType` 的问题，`responseType` 它表示服务器响应的数据类型，由于后台返回来的是二进制数据，所以我们要把它设为 `arraybuffer`，
接下来再看看结果是否正确。
```js
axios({
  method: 'post',
  url: '/export',
  responseType: 'arraybuffer',
})
.then(res => {
  // 假设 data 是返回来的二进制数据
  const data = res.data
  const url = window.URL.createObjectURL(new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}))
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', 'excel.xlsx')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
})
```

![img1](https://github.com/woai3c/Front-end-articles/blob/master/imgs/downfile2.png)

这次没有问题，文件能正常打开，内容也是正常的，不再是乱码。

## 根据后台接口内容决定是否下载文件
作者的项目有大量的页面都有下载文件的需求，而且这个需求还有点变态。

具体需求如下
1. 如果下载文件的数据量条数符合要求，正常下载（每个页面限制下载数据量是不一样的，所以不能在前端写死）。
2. 如果文件过大，后台返回 `{ code: 199999, msg: '文件过大，请重新设置查询项', data: null }`，然后前端再进行报错提示。

先来分析一下，首先根据上文，我们都知道下载文件的接口响应数据类型为 `arraybuffer`。返回的数据无论是二进制文件，还是 JSON 字符串，前端接收到的其实都是 `arraybuffer`。所以我们要对 `arraybuffer` 的内容作个判断，在接收到数据时将它转换为字符串，判断是否有 `code: 199999`。如果有，则报错提示，如果没有，则是正常文件，下载即可。具体实现如下：
```js
axios.interceptors.response.use(response => {
    const res = response.data
    // 判断响应数据类型是否 ArrayBuffer，true 则是下载文件接口，false 则是正常接口
    if (res instanceof ArrayBuffer) {
        const utf8decoder = new TextDecoder()
        const u8arr = new Uint8Array(res)
        // 将二进制数据转为字符串
        const temp = utf8decoder.decode(u8arr)
        if (temp.includes('{code:199999')) {
            Message({
            	// 字符串转为 JSON 对象
                message: JSON.parse(temp).msg,
                type: 'error',
                duration: 5000,
            })

            return Promise.reject()
        }
    }
    // 正常类型接口，省略代码...
    return res
}, (error) => {
    // 省略代码...
    return Promise.reject(error)
})
```
