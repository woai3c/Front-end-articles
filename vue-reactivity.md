# Vue3.0 源码分析（一）：响应式模块 reactivity

# 前言
学习 Vue3.0 源码必须对以下知识有所了解：
1. proxy reflect iterator
2. map weakmap set weakset symbol

这些知识可以看一下阮一峰老师的[《ES6 入门教程》](https://es6.ruanyifeng.com/)。

如果不会 ts，我觉得影响不大，了解一下泛型就可以了。因为我就没用过 TS，但是不影响看代码。

阅读源码，建议先过一遍该模块下的 API，了解一下有哪些功能。然后再看一遍相关的单元测试，单元测试一般会把所有的功能细节都测一边。对源码的功能有所了解后，再去阅读源码的细节，效果更好。

### proxy 术语
```js
const p = new Proxy(target, handler)
```
* handler，包含捕捉器（trap）的占位符对象，可译为处理器对象。
* target，被 Proxy 代理的对象。


### 友情提醒

在阅读源码的过程中，要时刻问自己三个问题：
1. 这是什么？
2. 为什么要这样？为什么不那样？
3. 有没有更好的实现方式？

正所谓知其然，知其所以然。

阅读源码除了要了解一个库具有什么特性，还要了解它为什么要这样设计，并且要问自己能不能用更好的方式去实现它。
如果只是单纯的停留在“是什么”这个阶段，对你可能没有什么帮助。就像看流水账似的，看完就忘，你得去思考，才能理解得更加深刻。

# 正文

reactivity 模块是 Vue3.0 的响应式系统，它有以下几个文件：
```
baseHandlers.ts
collectionHandlers.ts
computed.ts
effect.ts
index.ts
operations.ts
reactive.ts
ref.ts
```
接下来按重要程度顺序来讲解一下各个文件的 API 用法和实现。
## reactive.ts 文件
在 Vue.2x 中，使用 `Object.defineProperty()` 对对象进行监听。而在 Vue3.0 中，改用 `Proxy` 进行监听。`Proxy` 比起 `Object.defineProperty()` 有如下优势：
1. 可以监听属性的增删操作。
2. 可以监听数组某个索引值的变化以及数组长度的变化。

### reactive()
`reactive()` 的作用主要是将目标转化为响应式的 proxy 实例。例如：
```js
const obj = {
    count: 0
}

const proxy = reactive(obj)
```
如果是嵌套的对象，会继续递归将子对象转为响应式对象。

`reactive()` 是向用户暴露的 API，它真正执行的是 `createReactiveObject()` 函数：
```js
// 根据 target 生成 proxy 实例
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
  }
  
  // target is already a Proxy, return it.
  // exception: calling readonly() on a reactive object
  if (
    target[ReactiveFlags.raw] &&
    !(isReadonly && target[ReactiveFlags.isReactive])
  ) {
    return target
  }
  // target already has corresponding Proxy
  if (
    hasOwn(target, isReadonly ? ReactiveFlags.readonly : ReactiveFlags.reactive)
  ) {
    return isReadonly
      ? target[ReactiveFlags.readonly]
      : target[ReactiveFlags.reactive]
  }
  // only a whitelist of value types can be observed.
  if (!canObserve(target)) {
    return target
  }
 
  const observed = new Proxy(
    target,
    // 根据是否 Set, Map, WeakMap, WeakSet 来决定 proxy 的 handler 参数
    collectionTypes.has(target.constructor) ? collectionHandlers : baseHandlers
  )
  // 在原始对象上定义一个属性（只读则为 "__v_readonly"，否则为 "__v_reactive"），这个属性的值就是根据原始对象生成的 proxy 实例。
  def(
    target,
    isReadonly ? ReactiveFlags.readonly : ReactiveFlags.reactive,
    observed
  )
  
  return observed
}
```
这个函数的处理逻辑如下：
1. 如果 target 不是一个对象，返回 target。
2. 如果 target 已经是 proxy 实例，返回 target。
3. 如果 target 不是一个可观察的对象，返回 target。
4. 生成 proxy 实例，并在原始对象 target 上添加一个属性（只读则为 `__v_readonly`，否则为 `__v_reactive`），指向这个 proxy 实例，最后返回这个实例。添加这个属性就是为了在第 2 步做判断用的，防止对同一对象重复监听。

其中第 3、4 点需要单独拎出来讲一讲。
#### 什么是可观察的对象
```js
const canObserve = (value: Target): boolean => {
  return (
    !value[ReactiveFlags.skip] &&
    isObservableType(toRawType(value)) &&
    !Object.isFrozen(value)
  )
}
```
`canObserve()` 函数就是用来判断 value 是否是可观察的对象，满足以下条件才是可观察的对象：
1. ReactiveFlags.skip 的值不能为 `__v_skip`，`__v_skip` 是用来定义这个对象是否可跳过，即不监听。
2. target 的类型必须为下列值之一 `Object,Array,Map,Set,WeakMap,WeakSet` 才可被监听。
3. 不能是冻结的对象。

#### 传递给 proxy 的处理器对象是什么
根据上面的代码可以看出来，在生成 proxy 实例时，处理器对象是根据一个三元表达式产生的：
```js
// collectionTypes 的值为 Set, Map, WeakMap, WeakSet
collectionTypes.has(target.constructor) ? collectionHandlers : baseHandlers
```
这个三元表达式非常简单，如果是普通的对象 `Object` 或 `Array`，处理器对象就使用 baseHandlers；如果是 `Set, Map, WeakMap, WeakSet` 中的一个，就使用 collectionHandlers。

collectionHandlers 和 baseHandlers 是从 `collectionHandlers.ts` 和 `baseHandlers.ts` 处引入的，这里先放一放，接下来再讲。

#### 有多少种 proxy 实例
`createReactiveObject()` 根据不同的参数，可以创建多种不同的 proxy 实例：
1. 完全响应式的 proxy 实例，如果有嵌套对象，会递归调用 `reactive()`。
2. 只读的 proxy 实例。
3. 浅层响应的 proxy 实例，即一个对象只有第一层的属性是响应式的。
4. 只读的浅层响应的 proxy 实例。

**浅层响应的 proxy 实例是什么？**

之所以有浅层响应的 proxy 实例，是因为 proxy 只代理对象的第一层属性，更深层的属性是不会代理的。如果确实需要生成完全响应式的 proxy 实例，就得递归调用 `reactive()`。不过这个过程是内部自动执行的，用户感知不到。

#### 其他一些函数介绍
```js
// 判断 value 是否是响应式的
export function isReactive(value: unknown): boolean {
  if (isReadonly(value)) {
    return isReactive((value as Target)[ReactiveFlags.raw])
  }
  return !!(value && (value as Target)[ReactiveFlags.isReactive])
}
// 判断 value 是否是只读的
export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.isReadonly])
}
// 判断 value 是否是 proxy 实例
export function isProxy(value: unknown): boolean {
  return isReactive(value) || isReadonly(value)
}

// 将响应式数据转为原始数据，如果不是响应数据，则返回源数据
export function toRaw<T>(observed: T): T {
  return (
    (observed && toRaw((observed as Target)[ReactiveFlags.raw])) || observed
  )
}

// 给 value 设置 skip 属性，跳过代理，让数据不可被代理
export function markRaw<T extends object>(value: T): T {
  def(value, ReactiveFlags.skip, true)
  return value
}
```
## baseHandlers.ts 文件
在 `baseHandlers.ts` 文件中针对 4 种 proxy 实例定义了不对的处理器。
由于它们之间差别不大，所以在这只讲解完全响应式的处理器对象：
```js
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
}
```
处理器对五种操作进行了拦截，分别是：
1. get 属性读取
2. set 属性设置
3. deleteProperty 删除属性
4. has 是否拥有某个属性
5. ownKeys

其中 ownKeys 可拦截以下操作：
1. `Object.getOwnPropertyNames()`
2. `Object.getOwnPropertySymbols()`
3. `Object.keys()`
4. `Reflect.ownKeys()`

![](https://user-gold-cdn.xitu.io/2020/7/10/1733747cd7fffe82?w=487&h=230&f=png&s=8656)

其中 get、has、ownKeys 操作会收集依赖，set、deleteProperty 操作会触发依赖。
### get
get 属性的处理器是用 `createGetter()` 函数创建的：
```js
// /*#__PURE__*/ 标识此为纯函数 不会有副作用 方便做 tree-shaking
const get = /*#__PURE__*/ createGetter()

function createGetter(isReadonly = false, shallow = false) {
  return function get(target: object, key: string | symbol, receiver: object) {
    // target 是否是响应式对象
    if (key === ReactiveFlags.isReactive) {
      return !isReadonly
      // target 是否是只读对象
    } else if (key === ReactiveFlags.isReadonly) {
      return isReadonly
    } else if (
      // 如果访问的 key 是 __v_raw，并且 receiver == target.__v_readonly || receiver == target.__v_reactive
      // 则直接返回 target
      key === ReactiveFlags.raw &&
      receiver ===
        (isReadonly
          ? (target as any).__v_readonly
          : (target as any).__v_reactive)
    ) {
      return target
    }

    const targetIsArray = isArray(target)
    // 如果 target 是数组并且 key 属于三个方法之一 ['includes', 'indexOf', 'lastIndexOf']，即触发了这三个操作之一
    if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
    }
    // 不管Proxy怎么修改默认行为，你总可以在Reflect上获取默认行为。
    // 如果不用 Reflect 来获取，在监听数组时可以会有某些地方会出错
    // 具体请看文章《Vue3 中的数据侦测》——https://juejin.im/post/5d99be7c6fb9a04e1e7baa34#heading-10
    const res = Reflect.get(target, key, receiver)

    // 如果 key 是 symbol 并且属于 symbol 的内置方法之一，或者访问的是原型对象，直接返回结果，不收集依赖。
    if ((isSymbol(key) && builtInSymbols.has(key)) || key === '__proto__') {
      return res
    }

    // 只读对象不收集依赖
    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }
    
    // 浅层响应立即返回，不递归调用 reactive()
    if (shallow) {
      return res
    }

    // 如果是 ref 对象，则返回真正的值，即 ref.value，数组除外。
    if (isRef(res)) {
      // ref unwrapping, only for Objects, not for Arrays.
      return targetIsArray ? res : res.value
    }

    if (isObject(res)) {
      // 由于 proxy 只能代理一层，所以 target[key] 的值如果是对象，就继续对其进行代理
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}
```
这个函数的处理逻辑看代码注释应该就能明白，其中有几个点需要单独说一下：
1. `Reflect.get()`
2. 数组的处理
3. `builtInSymbols.has(key)` 为 true 或原型对象不收集依赖

#### Reflect.get()
`Reflect.get()` 方法与从对象 `(target[key])` 中读取属性类似，但它是通过一个函数执行来操作的。

为什么直接用 `target[key]` 就能得到值，却还要用 `Reflect.get(target, key, receiver)` 来多倒一手呢？

**先来看个简单的示例：**
```js
const p = new Proxy([1, 2, 3], {
    get(target, key, receiver) {
        return target[key]
    },
    set(target, key, value, receiver) {
        target[key] = value
    }
})

p.push(100)
```
运行这段代码会报错：
```js
Uncaught TypeError: 'set' on proxy: trap returned falsish for property '3'
```
但做一些小改动就能够正常运行：
```js
const p = new Proxy([1, 2, 3], {
    get(target, key, receiver) {
        return target[key]
    },
    set(target, key, value, receiver) {
        target[key] = value
        return true // 新增一行 return true
    }
})

p.push(100)
```
这段代码可以正常运行。为什么呢？

区别在于新的这段代码在 `set()` 方法上多了一个 `return true`。我在 MDN 上查找到的解释是这样的：

`set()` 方法应当返回一个布尔值。
* 返回 `true` 代表属性设置成功。
* 在严格模式下，如果 `set()` 方法返回 `false`，那么会抛出一个 `TypeError` 异常。

这时我又试了一下直接执行 `p[3] = 100`，发现能正常运行，只有执行 `push` 方法才报错。到这一步，我心中已经有答案了。为了验证我的猜想，我在代码上加了 `console.log()`，把代码执行过程的一些属性打印出来。

```js
const p = new Proxy([1, 2, 3], {
    get(target, key, receiver) {
        console.log('get: ', key)
        return target[key]
    },
    set(target, key, value, receiver) {
        console.log('set: ', key, value)
        target[key] = value
        return true
    }
})

p.push(100)

// get:  push
// get:  length
// set:  3 100
// set:  length 4
```
从上面的代码可以发现执行 `push` 操作时，还会访问 `length` 属性。推测执行过程如下：根据 `length` 的值，得出最后的索引，再设置新的置，最后再改变 `length`。

结合 MDN 的解释，我的推测是数组的原生方法应该是运行在严格模式下的（如果有网友知道真相，请在评论区留言）。因为在 JS 中很多代码在非严格模式和严格模式下都能正常运行，只是严格模式会给你报个错。就跟这次情况一样，最后设置 `length` 属性的时候报错，但结果还是正常的。如果不想报错，就得每次都返回 `true`。

然后再看一下 `Reflect.set()` 的返回值说明：
> 返回一个 Boolean 值表明是否成功设置属性。

所以上面代码可以改成这样：
```js
const p = new Proxy([1, 2, 3], {
    get(target, key, receiver) {
        console.log('get: ', key)
        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        console.log('set: ', key, value)
        return Reflect.set(target, key, value, receiver)
    }
})

p.push(100)
```
另外，不管 Proxy 怎么修改默认行为，你总可以在 Reflect 上获取默认行为。

通过上面的示例，不难理解为什么要通过 `Reflect.set()` 来代替 Proxy 完成默认操作了。同理，`Reflect.get()` 也一样。

#### 数组的处理
```ts
// 如果 target 是数组并且 key 属于三个方法之一 ['includes', 'indexOf', 'lastIndexOf']，即触发了这三个操作之一
if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
  return Reflect.get(arrayInstrumentations, key, receiver)
}
```
在执行数组的 `includes`, `indexOf`, `lastIndexOf` 方法时，会把目标对象转为 `arrayInstrumentations` 再执行。
```js
const arrayInstrumentations: Record<string, Function> = {}
;['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
  arrayInstrumentations[key] = function(...args: any[]): any {
    // 如果 target 对象中指定了 getter，receiver 则为 getter 调用时的 this 值。
    // 所以这里的 this 指向 receiver，即 proxy 实例，toRaw 为了取得原始数据
    const arr = toRaw(this) as any
    // 对数组的每个值进行 track 操作，收集依赖
    for (let i = 0, l = (this as any).length; i < l; i++) {
      track(arr, TrackOpTypes.GET, i + '')
    }
    // we run the method using the original args first (which may be reactive)
    // 参数有可能是响应式的，函数执行后返回值为 -1 或 false，那就用参数的原始值再试一遍
    const res = arr[key](...args)
    if (res === -1 || res === false) {
      // if that didn't work, run it again using raw values.
      return arr[key](...args.map(toRaw))
    } else {
      return res
    }
  }
})
```
从上述代码可以看出，Vue3.0 对 `includes`, `indexOf`, `lastIndexOf` 进行了封装，除了返回原有方法的结果外，还会对数组的每个值进行依赖收集。

#### `builtInSymbols.has(key)` 为 true 或原型对象不收集依赖
```js
const p = new Proxy({}, {
    get(target, key, receiver) {
        console.log('get: ', key)
        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        console.log('set: ', key, value)
        return Reflect.set(target, key, value, receiver)
    }
})

p.toString() // get:  toString
             // get:  Symbol(Symbol.toStringTag)
p.__proto__  // get:  __proto__
```
从 `p.toString()` 的执行结果来看，它会触发两次 get，一次是我们想要的，一次是我们不想要的（我还没搞明白为什么会有 `Symbol(Symbol.toStringTag)`，如果有网友知道，请在评论区留言）。所以就有了这个判断： `builtInSymbols.has(key)` 为 `true` 就直接返回，防止重复收集依赖。

再看 `p.__proto__` 的执行结果，也触发了一次 get 操作。一般来说，没有场景需要单独访问原型，访问原型都是为了访问原型上的方法，例如 `p.__proto__.toString()` 这样使用，所以 key 为 `__proto__` 的时候也要跳过，不收集依赖。


### set
```js
const set = /*#__PURE__*/ createSetter()

// 参考文档《Vue3 中的数据侦测》——https://juejin.im/post/5d99be7c6fb9a04e1e7baa34#heading-10
function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    const oldValue = (target as any)[key]
    if (!shallow) {
      value = toRaw(value)
      // 如果原来的值是 ref，但新的值不是，将新的值赋给 ref.value 即可。
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value
        return true
      }
    } else {
      // in shallow mode, objects are set as-is regardless of reactive or not
    }

    const hadKey = hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver)
    // don't trigger if target is something up in the prototype chain of original
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        // 如果 target 没有 key，就代表是新增操作，需要触发依赖
        trigger(target, TriggerOpTypes.ADD, key, value)
      } else if (hasChanged(value, oldValue)) {
        // 如果新旧值不相等，才触发依赖
        // 什么时候会有新旧值相等的情况？例如监听一个数组，执行 push 操作，会触发多次 setter
        // 第一次 setter 是新加的值 第二次是由于新加的值导致 length 改变
        // 但由于 length 也是自身属性，所以 value === oldValue
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
      }
    }
    return result
  }
}
```
`set()` 的函数处理逻辑反而没那么难，看注释即可。`track()` 和 `trigger()` 将放在下面和 effect.ts 文件一起讲解。

### deleteProperty、has、ownKeys
```js
function deleteProperty(target: object, key: string | symbol): boolean {
  const hadKey = hasOwn(target, key)
  const oldValue = (target as any)[key]
  const result = Reflect.deleteProperty(target, key)
  // 如果删除结果为 true 并且 target 拥有这个 key 就触发依赖
  if (result && hadKey) {
    trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue)
  }
  return result
}

function has(target: object, key: string | symbol): boolean {
  const result = Reflect.has(target, key)
  track(target, TrackOpTypes.HAS, key)
  return result
}

function ownKeys(target: object): (string | number | symbol)[] {
  track(target, TrackOpTypes.ITERATE, ITERATE_KEY)
  return Reflect.ownKeys(target)
}
```
这三个函数比较简单，看代码即可。

## effect.ts 文件
等把 effect.ts 文件讲解完，响应式模块基本上差不多结束了。
### effect()
`effect()` 主要和响应式的对象结合使用。
```js
export function effect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = EMPTY_OBJ
): ReactiveEffect<T> {
  // 如果已经是 effect 函数，取得原来的 fn
  if (isEffect(fn)) {
    fn = fn.raw
  }
  
  const effect = createReactiveEffect(fn, options)
  // 如果 lazy 为 false，马上执行一次
  // 计算属性的 lazy 为 true
  if (!options.lazy) {
    effect()
  }
  
  return effect
}
```
真正创建 effect 的是 `createReactiveEffect()` 函数。
```js
let uid = 0

function createReactiveEffect<T = any>(
  fn: (...args: any[]) => T,
  options: ReactiveEffectOptions
): ReactiveEffect<T> {
  // reactiveEffect() 返回一个新的 effect，这个新的 effect 执行后
  // 会将自己设为 activeEffect，然后再执行 fn 函数，如果在 fn 函数里对响应式属性进行读取
  // 会触发响应式属性 get 操作，从而收集依赖，而收集的这个依赖函数就是 activeEffect
  const effect = function reactiveEffect(...args: unknown[]): unknown {
    if (!effect.active) {
      return options.scheduler ? undefined : fn(...args)
    }
    // 为了避免递归循环，所以要检测一下
    if (!effectStack.includes(effect)) {
      // 清空依赖
      cleanup(effect)
      try {
        enableTracking()
        effectStack.push(effect)
        activeEffect = effect
        return fn(...args)
      } finally {
        // track 将依赖函数 activeEffect 添加到对应的 dep 中，然后在 finally 中将 activeEffect
        // 重置为上一个 effect 的值
        effectStack.pop()
        resetTracking()
        activeEffect = effectStack[effectStack.length - 1]
        
      }
    }
  } as ReactiveEffect
  effect.id = uid++
  effect._isEffect = true
  effect.active = true // 用于判断当前 effect 是否激活，有一个 stop() 来将它设为 false
  effect.raw = fn
  effect.deps = []
  effect.options = options
  
  return effect
}
```
其中 `cleanup(effect)` 的作用是让 effect 关联下的所有 dep 实例清空 effect，即清除这个依赖函数。
```js
function cleanup(effect: ReactiveEffect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}
```
从代码中可以看出来，真正的依赖函数是 activeEffect。执行 `track()` 收集的依赖就是 activeEffect。
趁热打铁，现在我们再来看一下 `track()` 和 `trigger()` 函数。

### track()
```js
// 依赖收集
export function track(target: object, type: TrackOpTypes, key: unknown) {
  // activeEffect 为空，代表没有依赖，直接返回
  if (!shouldTrack || activeEffect === undefined) {
    return
  }
  // targetMap 依赖管理中心，用于收集依赖和触发依赖
  let depsMap = targetMap.get(target)
  // targetMap 为每个 target 建立一个 map
  // 每个 target 的 key 对应着一个 dep
  // 然后用 dep 来收集依赖函数，当监听的 key 值发生变化时，触发 dep 中的依赖函数
  // 类似于这样
  // targetMap(weakmap) = {
  //     target1(map): {
  //       key1(dep): (fn1,fn2,fn3...)
  //       key2(dep): (fn1,fn2,fn3...)
  //     },
  //     target2(map): {
  //       key1(dep): (fn1,fn2,fn3...)
  //       key2(dep): (fn1,fn2,fn3...)
  //     },
  // }
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
    // 开发环境下会触发 onTrack 事件
    if (__DEV__ && activeEffect.options.onTrack) {
      activeEffect.options.onTrack({
        effect: activeEffect,
        target,
        type,
        key
      })
    }
  }
}
```
targetMap 是一个 `WeakMap` 实例。
> WeakMap 对象是一组键/值对的集合，其中的键是弱引用的。其键必须是对象，而值可以是任意的。

弱引用是什么意思呢？
```js
let obj = { a: 1 }
const map = new WeakMap()
map.set(obj, '测试')
obj = null
```
当 obj 置为空后，对于 `{ a: 1 }` 的引用已经为零了，下一次垃圾回收时就会把 weakmap 中的对象回收。

但如果把 weakmap 换成 map 数据结构，即使把 obj 置空，`{ a: 1 }` 依然不会被回收，因为 map 数据结构是强引用，它现在还被 map 引用着。

### trigger()
```js
// 触发依赖
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  
  const depsMap = targetMap.get(target)
  // 如果没有收集过依赖，直接返回
  if (!depsMap) {
    // never been tracked
    return
  }
  
  // 对收集的依赖进行分类，分为普通的依赖或计算属性依赖
  // effects 收集的是普通的依赖 computedRunners 收集的是计算属性的依赖
  // 两个队列都是 set 结构，为了避免重复收集依赖
  const effects = new Set<ReactiveEffect>()
  const computedRunners = new Set<ReactiveEffect>()
  
  const add = (effectsToAdd: Set<ReactiveEffect> | undefined) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        // effect !== activeEffect 避免重复收集依赖
        if (effect !== activeEffect || !shouldTrack) {
          // 计算属性
          if (effect.options.computed) {
            computedRunners.add(effect)
          } else {
            effects.add(effect)
          }
        } else {
          // the effect mutated its own dependency during its execution.
          // this can be caused by operations like foo.value++
          // do not trigger or we end in an infinite loop
        }
      })
    }
  }

  // 在值被清空前，往相应的队列添加 target 所有的依赖
  if (type === TriggerOpTypes.CLEAR) {
    // collection being cleared
    // trigger all effects for target
    depsMap.forEach(add)
  } else if (key === 'length' && isArray(target)) { // 当数组的 length 属性变化时触发
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key >= (newValue as number)) {
        add(dep)
      }
    })
  } else {
    // schedule runs for SET | ADD | DELETE
    // 如果不符合以上两个 if 条件，并且 key !== undefined，往相应的队列添加依赖
    if (key !== void 0) {
      add(depsMap.get(key))
    }
    // also run for iteration key on ADD | DELETE | Map.SET
    const isAddOrDelete =
      type === TriggerOpTypes.ADD ||
      (type === TriggerOpTypes.DELETE && !isArray(target))

    if (
      isAddOrDelete ||
      (type === TriggerOpTypes.SET && target instanceof Map)
    ) {
      add(depsMap.get(isArray(target) ? 'length' : ITERATE_KEY))
    }
    
    if (isAddOrDelete && target instanceof Map) {
      add(depsMap.get(MAP_KEY_ITERATE_KEY))
    }
  }

  const run = (effect: ReactiveEffect) => {
    if (__DEV__ && effect.options.onTrigger) {
      effect.options.onTrigger({
        effect,
        target,
        key,
        type,
        newValue,
        oldValue,
        oldTarget
      })
    }
    if (effect.options.scheduler) {
      // 如果 scheduler 存在则调用 scheduler，计算属性拥有 scheduler
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  }

  // Important: computed effects must be run first so that computed getters
  // can be invalidated before any normal effects that depend on them are run.
  computedRunners.forEach(run)
  // 触发依赖函数
  effects.forEach(run)
}
```
对依赖函数进行分类后，需要先运行计算属性的依赖，因为其他普通的依赖函数可能包含了计算属性。先执行计算属性的依赖能保证普通依赖执行时能得到最新的计算属性的值。

### track() 和 trigger() 中的 type 有什么用？
这个 type 取值范围就定义在 `operations.ts` 文件中：
```js
// track 的类型
export const enum TrackOpTypes {
  GET = 'get', // get 操作
  HAS = 'has', // has 操作
  ITERATE = 'iterate' // ownKeys 操作
}

// trigger 的类型
export const enum TriggerOpTypes {
  SET = 'set', // 设置操作，将旧值设置为新值
  ADD = 'add', // 新增操作，添加一个新的值 例如给对象新增一个值 数组的 push 操作
  DELETE = 'delete', // 删除操作 例如对象的 delete 操作，数组的 pop 操作
  CLEAR = 'clear' // 用于 Map 和 Set 的 clear 操作。
}
```
type 主要用于标识 `track()` 和 `trigger()` 的类型。

### trigger() 中的连续判断代码
```js
if (key !== void 0) {
  add(depsMap.get(key))
}
// also run for iteration key on ADD | DELETE | Map.SET
const isAddOrDelete =
  type === TriggerOpTypes.ADD ||
  (type === TriggerOpTypes.DELETE && !isArray(target))

if (
  isAddOrDelete ||
  (type === TriggerOpTypes.SET && target instanceof Map)
) {
  add(depsMap.get(isArray(target) ? 'length' : ITERATE_KEY))
}

if (isAddOrDelete && target instanceof Map) {
  add(depsMap.get(MAP_KEY_ITERATE_KEY))
}
```
在 `trigger()` 中有这么一段连续判断的代码，它们作用是什么呢？其实它们是用于判断数组/集合这种数据结构比较特别的操作。
看个示例：
```js
let dummy
const counter = reactive([])
effect(() => (dummy = counter.join()))
counter.push(1)
```
`effect(() => (dummy = counter.join()))` 生成一个依赖，并且自执行一次。
在执行函数里的代码 `counter.join()` 时，会访问数组的多个属性，分别是 `join` 和 `length`，同时触发 `track()` 收集依赖。**也就是说，数组的 `join` `length` 属性都收集了一个依赖。**

当执行 `counter.push(1)` 这段代码时，实际上是将数组的索引 0 对应的值设为 1。这一点，可以通过打 debugger 从上下文环境看出来，其中 key 为 0，即数组的索引，值为 1。

![](https://user-gold-cdn.xitu.io/2020/7/11/1733cc4ec68aed1d?w=311&h=221&f=png&s=9577)

设置值后，由于是新增操作，执行 `trigger(target, TriggerOpTypes.ADD, key, value)`。但由上文可知，只有数组的 key 为 `join` `length` 时，才有依赖，key 为 0 是没有依赖的。

![](https://user-gold-cdn.xitu.io/2020/7/11/1733ccf88ec2cfc7?w=1211&h=343&f=png&s=55923)

![](https://user-gold-cdn.xitu.io/2020/7/11/1733ccfccddb20a0?w=413&h=294&f=png&s=16824)

从上面两个图可以看出来，只有 `join` `length` 属性才有对应的依赖。

这个时候，`trigger()` 的一连串 if 语句就起作用了，其中有一个 if 语句是这样的：
```js
if (
  isAddOrDelete ||
  (type === TriggerOpTypes.SET && target instanceof Map)
) {
  add(depsMap.get(isArray(target) ? 'length' : ITERATE_KEY))
}
```
如果 target 是一个数组，就添加 `length` 属性对应的依赖到队列中。也就是说 key 为 0 的情况下使用 `length` 对应的依赖。

另外，还有一个巧妙的地方。待执行依赖的队列是一个 set 数据结构。如果 key 为 0 有对应的依赖，同时 `length` 也有对应的依赖，就会添加两次依赖，但由于队列是 set，具有自动去重的效果，避免了重复执行。

### 示例
仅看代码和文字，是很难理解响应式数据和 `track()` `trigger()` 是怎么配合的。所以我们要配合示例来理解：
```js
let dummy
const counter = reactive({ num: 0 })
effect(() => (dummy = counter.num))

console.log(dummy == 0)
counter.num = 7
console.log(dummy == 7)
```
上述代码执行过程如下：
1. 对 `{ num: 0 }` 进行监听，返回一个 proxy 实例，即 counter。
2. `effect(fn)` 创建一个依赖，并且在创建时会执行一次 `fn`。
3. `fn()` 读取 num 的值，并赋值给 dummy。
4. 读取属性这个操作会触发 proxy 的属性读取拦截操作，在拦截操作里会去收集依赖，这个依赖是步骤 2 产生的。
5. `counter.num = 7` 这个操作会触发 proxy 的属性设置拦截操作，在这个拦截操作里，除了把新的值返回，还会触发刚才收集的依赖。在这个依赖里把 counter.num 赋值给 dummy(num 的值已经变为 7)。

用图来表示，大概这样的：

![](https://user-gold-cdn.xitu.io/2020/7/11/1733bdeb69a45afe?w=876&h=536&f=png&s=37223)

## collectionHandlers.ts 文件
collectionHandlers.ts 文件包含了 `Map` `WeakMap` `Set` `WeakSet` 的处理器对象，分别对应完全响应式的 proxy 实例、浅层响应的 proxy 实例、只读 proxy 实例。这里只讲解对应完全响应式的 proxy 实例的处理器对象：
```js
export const mutableCollectionHandlers: ProxyHandler<CollectionTypes> = {
  get: createInstrumentationGetter(false, false)
}
```
为什么只监听 get 操作，set has 等操作呢？不着急，先看一个示例：
```js
const p = new Proxy(new Map(), {
    get(target, key, receiver) {
        console.log('get: ', key)
        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        console.log('set: ', key, value)
        return Reflect.set(target, key, value, receiver)
    }
})

p.set('ab', 100) // Uncaught TypeError: Method Map.prototype.set called on incompatible receiver [object Object]
```
运行上面的代码会报错。其实这和 Map Set 的内部实现有关，必须通过 this 才能访问它们的数据。但是通过 Reflect 反射的时候，target 内部的 this 其实是指向 proxy 实例的，所以就不难理解为什么会报错了。

那怎么解决这个问题？通过源码可以发现，在 Vue3.0 中是通过代理的方式来实现对 Map Set 等数据结构监听的：
```js
function createInstrumentationGetter(isReadonly: boolean, shallow: boolean) {
  const instrumentations = shallow
    ? shallowInstrumentations
    : isReadonly
      ? readonlyInstrumentations
      : mutableInstrumentations

  return (
    target: CollectionTypes,
    key: string | symbol,
    receiver: CollectionTypes
  ) => {
    // 这三个 if 判断和 baseHandlers 的处理方式一样
    if (key === ReactiveFlags.isReactive) {
      return !isReadonly
    } else if (key === ReactiveFlags.isReadonly) {
      return isReadonly
    } else if (key === ReactiveFlags.raw) {
      return target
    }

    return Reflect.get(
      hasOwn(instrumentations, key) && key in target
        ? instrumentations
        : target,
      key,
      receiver
    )
  }
}
```
把最后一行代码简化一下：
```js
target = hasOwn(instrumentations, key) && key in target? instrumentations : target
return Reflect.get(target, key, receiver);
```
其中 instrumentations 的内容是：
```js
const mutableInstrumentations: Record<string, Function> = {
  get(this: MapTypes, key: unknown) {
    return get(this, key, toReactive)
  },
  get size() {
    return size((this as unknown) as IterableCollections)
  },
  has,
  add,
  set,
  delete: deleteEntry,
  clear,
  forEach: createForEach(false, false)
}
```
从代码可以看到，原来真正的处理器对象是 mutableInstrumentations。现在再看一个示例：
```js
const proxy = reactive(new Map())
proxy.set('key', 100)
```
生成 proxy 实例后，执行 `proxy.set('key', 100)`。`proxy.set` 这个操作会触发 proxy 的属性读取拦截操作。

![](https://user-gold-cdn.xitu.io/2020/7/10/17338cd934ce05fb?w=622&h=54&f=png&s=7572)

打断点可以看到，此时的 key 为 `set`。拦截了 `set` 操作后，调用 `Reflect.get(target, key, receiver)`，这个时候的 target 已经不是原来的 target 了，而是 mutableInstrumentations 对象。也就是说，最终执行的是 `mutableInstrumentations.set()`。

接下来再看看 mutableInstrumentations 的各个处理器逻辑。

### get
```js
// 如果 value 是对象，则返回一个响应式对象（`reactive(value)`)，否则直接返回 value。
const toReactive = <T extends unknown>(value: T): T =>
  isObject(value) ? reactive(value) : value
  
get(this: MapTypes, key: unknown) {
    // this 指向 proxy
    return get(this, key, toReactive)
}
  
function get(
  target: MapTypes,
  key: unknown,
  wrap: typeof toReactive | typeof toReadonly | typeof toShallow
) {
  target = toRaw(target)
  const rawKey = toRaw(key)
  // 如果 key 是响应式的，额外收集一次依赖
  if (key !== rawKey) {
    track(target, TrackOpTypes.GET, key)
  }
  track(target, TrackOpTypes.GET, rawKey)
  // 使用 target 原型上的方法
  const { has, get } = getProto(target)
  // 原始 key 和响应式的 key 都试一遍
  if (has.call(target, key)) {
    // 读取的值要使用包装函数处理一下
    return wrap(get.call(target, key))
  } else if (has.call(target, rawKey)) {
    return wrap(get.call(target, rawKey))
  }
}
```
get 的处理逻辑很简单，拦截 get 之后，调用 `get(this, key, toReactive)`。

### set
```js
function set(this: MapTypes, key: unknown, value: unknown) {
  value = toRaw(value)
  // 取得原始数据
  const target = toRaw(this)
  // 使用 target 原型上的方法
  const { has, get, set } = getProto(target)

  let hadKey = has.call(target, key)
  if (!hadKey) {
    key = toRaw(key)
    hadKey = has.call(target, key)
  } else if (__DEV__) {
    checkIdentityKeys(target, has, key)
  }

  const oldValue = get.call(target, key)
  const result = set.call(target, key, value)
  // 防止重复触发依赖，如果 key 已存在就不触发依赖
  if (!hadKey) {
    trigger(target, TriggerOpTypes.ADD, key, value)
  } else if (hasChanged(value, oldValue)) {
    // 如果新旧值相等，也不会触发依赖
    trigger(target, TriggerOpTypes.SET, key, value, oldValue)
  }
  return result
}
```
set 的处理逻辑也较为简单，配合注释一目了然。

还有剩下的 `has` `add` `delete` 等方法就不讲解了，代码行数比较少，逻辑也很简单，建议自行阅读。

## ref.ts 文件
```js
const convert = <T extends unknown>(val: T): T =>
  isObject(val) ? reactive(val) : val
  
export function ref(value?: unknown) {
  return createRef(value)
}
  
function createRef(rawValue: unknown, shallow = false) {
  // 如果已经是 ref 对象了，直接返回原值
  if (isRef(rawValue)) {
    return rawValue
  }
  
  // 如果不是浅层响应并且 rawValue 是个对象，调用 reactive(rawValue)
  let value = shallow ? rawValue : convert(rawValue)
  
  const r = {
    __v_isRef: true, // 用于标识这是一个 ref 对象，防止重复监听 ref 对象
    get value() {
      // 读取值时收集依赖
      track(r, TrackOpTypes.GET, 'value')
      return value
    },
    set value(newVal) {
      if (hasChanged(toRaw(newVal), rawValue)) {
        rawValue = newVal
        value = shallow ? newVal : convert(newVal)
        // 设置值时触发依赖
        trigger(
          r,
          TriggerOpTypes.SET,
          'value',
          __DEV__ ? { newValue: newVal } : void 0
        )
      }
    }
  }
  
  return r
}
```
在 Vue2.x 中，基本数值类型是不能监听的。但在 Vue3.0 中通过 `ref()` 可以实现这一效果。
```js
const r = ref(0)
effect(() => console.log(r.value)) // 打印 0
r.value++ // 打印 1
```
`ref()` 会把 0 转成一个 ref 对象。如果给 `ref(value)` 传的值是个对象，在函数内部会调用 `reactive(value)` 将其转为 proxy 实例。

## computed.ts 文件
```js
export function computed<T>(
  options: WritableComputedOptions<T>
): WritableComputedRef<T>
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
) {
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T>
  // 如果 getterOrOptions 是个函数，则是不可被配置的，setter 设为空函数
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = __DEV__
      ? () => {
          console.warn('Write operation failed: computed value is readonly')
        }
      : NOOP
  } else {
    // 如果是个对象，则可读可写
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  // dirty 用于判断计算属性依赖的响应式属性有没有被改变
  let dirty = true
  let value: T
  let computed: ComputedRef<T>

  const runner = effect(getter, {
    lazy: true, // lazy 为 true，生成的 effect 不会马上执行
    // mark effect as computed so that it gets priority during trigger
    computed: true,
    scheduler: () => { // 调度器
      // trigger 时，计算属性执行的是 effect.options.scheduler(effect) 而不是 effect()
      if (!dirty) {
        dirty = true
        trigger(computed, TriggerOpTypes.SET, 'value')
      }
    }
  })
  
  computed = {
    __v_isRef: true,
    // expose effect so computed can be stopped
    effect: runner,
    get value() {
      if (dirty) {
        value = runner()
        dirty = false
      }
      
      track(computed, TrackOpTypes.GET, 'value')
      return value
    },
    set value(newValue: T) {
      setter(newValue)
    }
  } as any
  return computed
}
```
下面通过一个示例，来讲解一下 computed 是怎么运作的：
```js
const value = reactive({})
const cValue = computed(() => value.foo)
console.log(cValue.value === undefined)
value.foo = 1
console.log(cValue.value === 1)
```
1. 生成一个 proxy 实例 value。
2. `computed()` 生成计算属性对象，当对 cValue 进行取值时（`cValue.value`），根据 dirty 判断是否需要运行 effect 函数进行取值，如果 dirty 为 false，直接把值返回。
3. 在 effect 函数里将 effect 设为 activeEffect，并运行 getter(`() => value.foo`) 取值。在取值过程中，读取 foo 的值（`value.foo`）。
4. 这会触发 get 属性读取拦截操作，进而触发 track 收集依赖，而收集的依赖函数就是第 3 步产生的 activeEffect。
5. 当响应式属性进行重新赋值时（`value.foo = 1`），就会 trigger 这个 activeEffect 函数。
6. 然后调用 `scheduler()` 将 dirty 设为 true，这样 computed 下次求值时会重新执行 effect 函数进行取值。

![](https://user-gold-cdn.xitu.io/2020/7/10/17339289f85a388d?w=1174&h=747&f=png&s=53977)

## index.ts 文件
index.ts 文件向外导出 reactivity 模块的 API。

## 参考资料
* [Vue3 中的数据侦测](https://juejin.im/post/5d99be7c6fb9a04e1e7baa34#heading-10)
* [vue3响应式源码解析-Reactive篇](https://juejin.im/post/5da9d7ebf265da5bbb1e52b7#heading-12)
* [vue3响应式系统源码解析-Effect篇](https://juejin.im/post/5db1d965f265da4d4a305926)
