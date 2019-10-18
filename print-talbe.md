# element-ui 表格打印
打印需要用到的组件为 [print-js](https://github.com/crabbly/print.js)
## 普通表格打印
一般的表格打印直接仿照组件提供的例子就可以了。
```js
printJS({
    printable: id, // DOM id
    type: 'html',
    scanStyles: false,
})
````

## element-ui 表格打印
element-ui 的表格，表面上看起来是一个表格，实际上是由两个表格组成的。

表头为一个表格，表体又是个表格，这就导致了一个问题：打印的时候表体和表头错位。
![img1](https://github.com/woai3c/Front-end-articles/blob/master/imgs/printTable2.jpg)

另外，在表格出现滚动条的时候，也会造成错位。

![img2](https://github.com/woai3c/Front-end-articles/blob/master/imgs/printTable1.jpg)
### 解决方案
我的思路是将两个表格合成一个表格，`print-js` 组件打印的时候，实际上是把 id 对应的 DOM 里的内容提取出来打印。
所以，在传入 id 之前，可以先把表头所在的表格内容提取出来，插入到第二个表格里，从而将两个表格合并，这时候打印就不会有错位的问题了。
```js
function printHTML(id) {
    const html = document.querySelector('#' + id).innerHTML
    // 新建一个 DOM
    const div = document.createElement('div')
    const printDOMID = 'printDOMElement'
    div.id = printDOMID
    div.innerHTML = html

    // 提取第一个表格的内容 即表头
    const ths = div.querySelectorAll('.el-table__header-wrapper th')
    const ThsTextArry = []
    for (let i = 0, len = ths.length; i < len; i++) {
        if (ths[i].innerText !== '') ThsTextArry.push(ths[i].innerText)
    }

    // 删除多余的表头
    div.querySelector('.hidden-columns').remove()
    // 第一个表格的内容提取出来后已经没用了 删掉
    div.querySelector('.el-table__header-wrapper').remove()

    // 将第一个表格的内容插入到第二个表格
    let newHTML = '<tr>'
    for (let i = 0, len = ThsTextArry.length; i < len; i++) {
        newHTML += '<td style="text-align: center; font-weight: bold">' + ThsTextArry[i] + '</td>'
    }

    newHTML += '</tr>'
    div.querySelector('.el-table__body-wrapper table').insertAdjacentHTML('afterbegin', newHTML)
    // 将新的 DIV 添加到页面 打印后再删掉
    document.querySelector('body').appendChild(div)
    
    printJS({
        printable: printDOMID,
        type: 'html',
        scanStyles: false,
        style: 'table { border-collapse: collapse }' // 表格样式
    })

    div.remove()
}
```
