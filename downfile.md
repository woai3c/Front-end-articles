# 前端下载二进制流文件
平时在前端下载文件有两种方式，一种是后台提供一个 URL，然后用 `window.open(URL)` 下载，另一种就是后台直接返回文件的二进制内容，然后前端转化一下再下载。

由于第一种方式比较简单，在此不再叙述。接下来主要讲解一下第二种方式怎么实现。

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
