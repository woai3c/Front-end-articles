# 手写 Promise
完整源码
```js
class Promise {
    constructor(executor) {
        this.onFulfilleds = []
        this.onRejecteds = []
        this.state = 'pending'

        const self = this
        function resolve(value) {
            if (self.state == 'pending') {
                self.state = 'fulfilled'
                self.value = value
                self.onFulfilleds.forEach(callback => callback())
            }
        }
    
        function reject(reason) {
            if (self.state == 'pending') {
                self.state = 'rejected'
                self.reason = reason
                self.onRejecteds.forEach(callback => callback())
            }
        }

        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled == 'function'? onFulfilled : value => value
        onRejected = typeof onRejected == 'function'? onRejected : reason => { throw reason }

        const self = this
        const promise2 = new Promise((resolve, reject) => {
            if (self.state == 'fulfilled') { // 针对立即 resolve(): new Promise(r => r())
                setTimeout(() => {
                    try {
                        const x = onFulfilled(self.value)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            } else if (self.state == 'rejected') { // 针对立即 reject(): new Promise((r, j) => j())
                setTimeout(() => {
                    try {
                        const x = onRejected(self.reason)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            } else if (self.state == 'pending') { // 针对异步 resolve reject: new Promise((r, j) => setTimeout(() => r()))
                self.onFulfilleds.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onFulfilled(self.value)
                            resolvePromise(promise2, x, resolve, reject)
                            // resolvePromise 代码作用和下面的代码差不多
                            // if (x instanceof Promise) {
                            //     x.then(val => resolve(val))
                            // } else {
                            //     resolve(x)
                            // }
                        } catch (error) {
                            reject(error)
                        }
                    })
                })
    
                self.onRejecteds.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onRejected(self.reason)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    })
                })
            }
        })

        return promise2
    }
}

function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 == x) reject(new TypeError ('circular reference'))
    
    if (x !== null && typeof x == 'object' || typeof x == 'function') {
        let called = false
        try {
            let then = x.then
            if (typeof then === 'function') {
                then.call(x, (y) => {
                    if (called) return
                    called = true
                    resolvePromise(promise2, y, resolve, reject)
                }, (r) => {
                    if (called) return
                    called = true
                    reject(r)
                })
            } else {
                if (called) return
                called = true
                resolve(x)
            }
        } catch (e) {
            if (called) return
            called = true
            reject(e)
        }
    } else {
        resolve(x)
    }
}

Promise.defer = Promise.deferred = function () {
    const dfd = {}
    dfd.promise = new Promise((resolve, reject) => {
        dfd.resolve = resolve
        dfd.reject = reject
    })

    return dfd
}

module.exports = Promise
```

每个 `then()` 方法都会产生一个新的 Promise，而这个 Promise 的状态是 `fulfilled` 还是 `rejected` 取决于上一个 Promise 的运行结果。
```js
const p = new Promise((r, j) => {
    setTimeout(() => {
        r('p0 resolve')
    }, 2000)
})

p
.then(val => {
    return 'p0 callback'
})
.then(val => {
    return 'p1 callback'
})
.then(val => {
   return 'p2 callback'
})
```
从上述示例来说，p0 callback 决定了 p1 callback 的状态。
如果 p0 callback 返回的是 Promise，则 p1 callback 需求等待这个 Promise resolve() 之后才会执行。
如果是返回一个普通的数值， p1 callback 则会立即执行。

如果完整版的源码不容易看懂，可以看一下简化版的，少了很多冗余判断，只保留了执行的主线程（过不了测试）。
```js
class Promise {
    constructor(executor) {
        this.onFulfilleds = []
        this.onRejecteds = []
        this.state = 'pending'

        const self = this
        function resolve(value) {
            if (self.state == 'pending') {
                self.state = 'fulfilled'
                self.value = value
                self.onFulfilleds.forEach(callback => callback())
            }
        }

        function reject(reason) {
            if (self.state == 'pending') {
                self.state = 'rejected'
                self.reason = reason
                self.onRejecteds.forEach(callback => callback())
            }
        }

        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled == 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected == 'function' ? onRejected : reason => { throw reason }

        const self = this
        const promise2 = new Promise((resolve, reject) => {
            self.onFulfilleds.push(() => {
                setTimeout(() => {
                    try {
                        const x = onFulfilled(self.value)
                        if (x instanceof Promise) {
                            x.then(val => resolve(val))
                        } else {
                            resolve(x)
                        }
                    } catch(error) {
                        reject(error)
                    }
                })
            })

            self.onRejecteds.push(() => {
                setTimeout(() => {
                    try {
                        const x = onRejected(self.reason)
                        if (x instanceof Promise) {
                            x.then(val => resolve(val))
                        } else {
                            resolve(x)
                        }
                    } catch(error) {
                        reject(error)
                    }
                })
            })
        })

        return promise2
    }
}
```
## 手写 Promise 其他方法
```js
Promise.resolve = function (value) {
    return new Promise(r => {
        r(value)
    })
}

Promise.reject = function (value) {
    return new Promise((r, j) => {
        j(value)
    })
}

Promise.prototype.catch = function (errCallback) {
    return this.then(null, errCallback)
}

// val 不会传给 finally 的回调函数，并且 finally 还需要将 val 传递给后面的 then。
Promise.prototype.finally = function (callback) {
    return this.then((val) => {
        callback()
        return new Promise(r => r(val))
    }, (err) => {
        callback()
        return new Promise(r => r(err))
    })
}

Promise.all = function (promises) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(promises)) {
            return reject('参数必须为数组')
        }

        if (!promises.length) return

        const result = []
        const len = promises.length
        let count = 0
        promises.forEach(p => {
            Promise.resolve(p)
                .then(val => {
                    count++
                    result.push(val)
                    if (count == len) {
                        resolve(result)
                    }
                })
                .catch(e => reject(e))
        })
    })
}

Promise.race = function (promises) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(promises)) {
            return reject('参数必须为数组')
        }

        if (!promises.length) return

        promises.forEach((p, i) => {
            Promise.resolve(p)
                .then(val => resolve(val))
                .catch(e => reject(e))
        })
    })
}
```

## 参考资料
* [Promise的源码实现（完美符合Promise/A+规范）](https://github.com/YvetteLau/Blog/issues/2)
* [可能是目前最易理解的手写promise](https://juejin.im/post/5dc383bdf265da4d2d1f6b23)
