# 用 node 搭建个人博客（三）：token
## 生成 token
需要用到 `jsonwebtoken` 这个库，密钥是随便写的，建议项目上线使用 openssl 来生成密钥，有兴趣可以搜索一下。
由于是自己的个人博客，没有注册功能。所以可以在数据库直接写上自己的账号和密码，在登陆的时候生成 token 之后，和用户信息保存在一起。
```js
const jwt = require('jsonwebtoken')
// 密钥
const key = 'secretKey'

// 这里的 data 是用户名，使用用户名来生成唯一的 token 
function generateToken(data) {
    const token = jwt.sign({
        data,
        exp: Math.floor(Date.now() / 1000) + (3600 * 24 * 7), // 有效期一周
    }, key)

    return token
}
```

## 验证 token
在本项目里，只有发布和删除文章需要验证 token，验证有三个步骤
* 是否是有效的 token
* 是否过期
* 是否和数据库中保存的 token 一致

```js
async function isVaildToken(dbo, token) {
    let result
    try {
        result = jwt.verify(token, key)
    } catch(e) {
        console.log(e)
        return false
    }

    const { exp } = result
    const current = Math.floor(Date.now() / 1000)
    if (current > exp) {
        return false
    }

    const res = await dbo.collection('user').find({ token }).toArray()
    if (res.length) {
        return true
    }
 
    return false
}
```
如果验证正确，则继续进行下一步的操作，如果验证错误，则清除客户端保存的 token，并跳转到登陆页。
