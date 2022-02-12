# 转Vue 3前再读一次Vue2源码

> Vue3如火如荼，再不读估计以后就再也不会读了


## 找到vue代码入口
首先，从 [GitHub - vuejs/vue](https://github.com/vuejs/vue) 下载源码

直接看`package.json`文件，`main`和`module`字段代表都是已经构建好的最终代码

那就从npm scripts看起
`dev` -> `rollup -w -c scripts/config.js —environment TARGET:web-full-dev` -> `scripts/config.js` -> `web-full-dev`命令对应的文件 `src/platforms/web/entry-runtime-with-compiler.js` -> 一路向下找到入口文件`src/core/instance/index.js`
```js
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
```

## 调试vue源码
在开始读源码之前，先把调试源码的工作准备好
首先，在`dev`命令中加一个配置项`--sourcemap`，完整命令如下
```bash
"dev": "rollup -w -c scripts/config.js --sourcemap --environment TARGET:web-full-dev",
```
然后`npm run dev`启动，rollup会在dist目录下生成一份带有映射关系的vue.js文件，并且会监听更改

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201111034588.png)


利用这份`dist/vue.js`进行调试就可以了
在`examples`目录下建一份html文件，然后引入上面的`dist/vue.js`文件

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201111034263.png)


WebStorm提供了一站式debug，非常方便
如下直接右键debug html文件，在源码需要的地方打断点即可开始
vscode也提供了类似的功能，自行摸索一下

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201111034629.png)

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201111035503.png)


## Vue对象初始化

#### Vue原型挂载

通过这五个方法，可以看出`instance/index.js`在`Vue.prototype`上挂载了一些方法

* initMixin(Vue)
* stateMixin(Vue)
* eventsMixin(Vue)
* lifecycleMixin(Vue)
* renderMixin(Vue)

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201111035798.png)


#### Vue属性挂载
回到`core/index.js`
```js
import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'

initGlobalAPI(Vue)

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

Vue.version = '__VERSION__'

export default Vue
```

主要通过`initGlobalAPI(Vue)`在Vue对象上添加了一波属性，主要是一些静态属性和方法

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201111035650.png)

#### Vue完整初始化

再往下走，回到 `src/platforms/web/runtime/index.js`，主要是对web平台添加一下配置、组件、指令（只看大方向，不看具体内部实现和逻辑）

再往外走，到`src/platforms/web/entry-runtime-with-compiler.js`
* 覆盖`$mount`方法
* 挂载`compile`方法，提供了编译`template`的能力（完整版和运行时版本的区别）

做个小结
* `instance/index.js` 对`Vue.prototype`进行属性和方法挂载
* `core/index.js`对`Vue`进行属性和方法挂载
* `runtime/index.js` 对不同platform，进行配置、组件、指令的差异化挂载
* `entry-runtime-with-compiler.js`  为`$mount`方法增加`compile`能力

再回`src/core/runtime/index,js`的`this._init(options)`，一切从这里开始 -> `Vue.prototype._init` -> 经过一系列的初始化以及合并配置工作（此处省略一大堆） -> 从`src/core/instance/lifecycle.js`的`Vue.prototype.$mount` -> `mountComponent`

## 响应式系统

之前写的 [Vue 响应式原理核心 · Issue #63 · amandakelake/blog · GitHub](https://github.com/amandakelake/blog/issues/63)

本质上就是对[Object.defineProperty() - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)的理解和运用，再加上 `Watcher、Dep`组合的发布订阅模式，组成vue的核心原理

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201111035167.png)
> 图片转载于 [图解 Vue 响应式原理 - 掘金](https://juejin.cn/post/6857669921166491662)

核心流程
* `new Vue`开始初始化，通过`Object.defineProperty`监听`data`里面的数据变化，创建`Observer`并遍历`data`创建`Dep`来收集使用当前`data`的`Watcher`，每个`key`都会`new`一个`Dep`
* 编译模板时会每个组件都会创建一个`Watcher`，同时会将`Dep.target`标识为当前`Watcher`
* 编译模板/mountComponent时，如果使用到了数据，会触发`data.get` -> `Dep.addSub`将相关的`Watcher`收集到`Dep.subs`中
* 数据更新触发`data.set` -> `Dep.notify` -> 通知相关的 `Watcher`调用`vm._render`更新DOM
* 触发`watcher`的`update`过程，利用队列做了优化，在`nextTick`后执行所有`watcher`的`run`方法，最后再执行它们的回调函数

`Dep.target = Watcher`的概念有点绕，可以多看几遍这里
[Vue源码详细解析(一)—数据的响应化 · Issue #1 · Ma63d/vue-analysis · GitHub](https://github.com/Ma63d/vue-analysis/issues/1)
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201111035079.png)

下面是一份简单的响应式系统的实现
```js
class Observer {
    constructor(data) {
        this.walk(data);
    }

    walk(data) {
        // 此处简化，只处理对象
        if (data instanceof Object) {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    this.defineReactive(data, key, data[key]);
                }
            }
        }
    }

    /**
     * getter中收集依赖，setter中触发依赖
     */
    defineReactive(data, key, val) {
        const _this = this;
        // 每个key实例一个dep
        const dep = new Dep();
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: function () {
                // 将当前的watcher实例收集到依赖中
                Dep.target && dep.addSub(Dep.target);
                return val;
            },
            set: function (newVal) {
                if (val === newVal) {
                    return;
                }
                val = newVal;
                // 递归遍历新值
                _this.walk(newVal);
                // 触发依赖
                dep.notify();
            },
        });
    }
}

class Dep {
    static target;

    constructor() {
        this.subs = [];
    }

    addSub(sub) {
        if (sub && sub.update) {
            this.subs.push(sub);
        }
    }

    notify() {
        this.subs.forEach(sub => sub.update());
    }
}

class Watcher {
    constructor(data, key, callback) {
        // getter收集依赖，getter不能传参，所以通过闭包传进去
        Dep.target = this;
        this.data = data;
        this.key = key;
        this.callback = callback;
        this.value = data[key];
        // 完成某个属性的依赖收集后,清空Dep.target
        // notify方法会重新调用getter（重新获取值，重新收集依赖）
        // 清空Dep.target，防止notify中不停绑定Watcher与Dep -> 代码死循环
        Dep.target = null;
    }

    /**
     * 更新视图 vm._render / 执行user逻辑
     */
    update() {
        this.value = this.data[this.key];
        this.callback(this.value);
    }
}

const data = {
    a: 1,
    b: 1,
};

new Observer(data);

new Watcher(data, 'a', (value) => {
    console.log('watcher update 新值 -> ' + value);
});

data.a = 2;
data.a = {
    c: 'c',
};

new Watcher(data.a, 'c', (value) => {
    console.log('watcher update 新值 -> ' + value);
});

data.a.c = 'hello new world';
```

上面代码直接跑的结果如图

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202202121002860.png)


[依赖收集 | Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/v2/reactive/getters.html) 黄老的课永远可以信赖

* computed的本质是`computed watcher`
* watch的本质是`user watcher`

## Patch和Diff原理

> DOM操作是昂贵的，尽量减少DOM操作
> 找出必须更新的节点，非必要不更新

数据发生变化时，会触发渲染`Watcher`的回调函数，执行组件更新
```js
// src/core/instance/lifecycle.js

updateComponent = () => {
  vm._update(vm._render(), hydrating)
}

new Watcher(vm, updateComponent, noop, {
  before () {
    if (vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'beforeUpdate')
    }
  }
}, true /* isRenderWatcher */)
```

组件更新调用了 `vm._update`
```js
// src/core/instance/lifecycle.js
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  const vm: Component = this
  const prevEl = vm.$el
  const prevVnode = vm._vnode
  vm._vnode = vnode
  if (!prevVnode) {
    // initial render
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
    // updates
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
	// ...
}
```

> 深入 patch 代码细节前，先记住vue的diff算法特点：`同层比较，不会跨层级`、`不同节点直接删除`
>
> vue和react的diff算法大同小异，网上大部分文章都来源于这篇2013年的 
> [React’s diff algorithm](https://calendar.perfplanet.com/2013/diff/)
> 、[中文版本](https://segmentfault.com/a/1190000000606216)
> 包括这张传遍大街小巷的图
> ![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201111035358.png)



执行`vm.__patch__`的逻辑在`src/core/vdom/patch.js`中，`patch`主要处理新旧节点是否相同
* 新旧节点不同：创建新节点 -> 更新父占位符节点 -> 删除旧节点
* 新旧节点相同：获取children，diff child做不同更新逻辑 ->  比较核心的 `updateChildren`方法

先看`patch`的核心逻辑，以下代码对源码做了精简和注释，方便理解
```js
function patch(oldVnode, vnode) {
    if (!oldVnode) {
        // empty mount (likely as component), create new root element
        createElm(vnode);
    } else {
        if (sameVnode(oldVnode, vnode)) {
            // 二、新旧节点相同， diff children
			  // patch existing root node
            patchVnode(oldVnode, vnode);
        } else {
            // 一、新旧节点不同的情况

            const oldElm = oldVnode.elm;
            const parentElm = nodeOps.parentNode(oldElm);

            // 1、创建新节点
            createElm(vnode);

            // 2、更新父的占位符节点
            if (parentElm) {
                // 更新逻辑
            }

            // 3、删除旧节点
            removeVnodes(oldVnode);
        }
    }

	  // 返回vnode，此时vnode.el已经对应了真实的dom
    return vnode;
}
```

以上可以看出，打补丁做的事情就算给`vnode.el`对应到真实的dom上面

看下辅助方法`sameVNode`，它的目的就是判断两个节点是否值得比较
比较逻辑很简单，就是先看 `key`，`key`不同则是不同组件，再开始判断 `tag、isComment、data、input`等类型
```js
function sameVnode (a, b) {
  return (
    a.key === b.key &&
    a.asyncFactory === b.asyncFactory && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}
```

只有当两个节点值得比较时，才会进入`patchVnode(oldVnode, vnode)`的流程

```js
function patchVnode (oldVnode, vnode) {

    const elm = vnode.elm = oldVnode.elm
    
    // 如果新旧节点相同，return
    if (oldVnode === vnode) {
        return
    }

    // 如果新旧节点都是文本节点，return
    if (vnode.isStatic && oldVnode.isStatic && vnode.key === oldVnode.key) {
        vnode.componentInstance = oldVnode.componentInstance
        return
    }

    // 1、prepatch -> updateChildComponent, 更新vnode对应实例的属性，如$vnode、slot、listeners、props等
    prepatch(oldVnode, vnode)

    // 2、执行update钩子以及用户自定义的update方法
    callUpdateHook(vnode)


    // 3、patch
    const oldCh = oldVnode.children
    const ch = vnode.children

    // 不是文本节点
    if (!vnode.text) {
        if (oldCh && ch) {
            if (oldCh !== ch) {
                updateChildren(elm, oldCh, ch)
            }
        } else if (ch) {
            if (oldVnode.text) {
                nodeOps.setTextContent(elm, '')
            }
            addVnodes(elm, ch)
        } else if (oldCh) {
            removeVnodes(oldCh)
        } else if (oldVnode.text) {
            nodeOps.setTextContent(elm, '')
        }
    //  是文本节点，且新旧文本不同
    } else if (oldVnode.text !== vnode.text) {
        nodeOps.setTextContent(elm, vnode.text)
    }

    postpatch(oldVnode, vnode)
}
```

以上伪代码都不难读，配合下面流程图会更清晰

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201111036007.jpg)

还剩下一个`updateChildren(vnode, oldVnode)`流程，既是diff里的重点也是难点，该方法的核心规律是通过while进行遍历收缩循环
* 从头尾开始移动，当交叉则停止
    * oldStartIdx -> newStartIdx
    * oldEndIdx -> newEndIdx
    * oldStartIdx -> newEndIdx
    * oldEndIdx -> newStartIdx
* 如果以上情况都不符合，则通过key进行判断

文字读起来比较繁杂，最快的方式是看一下前人的视频或者动画，再来理解会事半功倍，推荐
[diff算法之理解updateChildren函数](https://www.bilibili.com/video/BV1L5411571p/)

## 其他

#### NextTick
```js
for (macroTask of macroTaskQueue) {
    // 1. Handle current MACRO-TASK
    handleMacroTask();
      
    // 2. Handle all MICRO-TASK
    for (microTask of microTaskQueue) {
        handleMicroTask(microTask);
    }
}
```
在浏览器环境中
* 常见的 macro task 有 `setTimeout`、`MessageChannel`、`postMessage`、`setImmediate`；
* 常见的 micro task 有 `MutationObsever` 和 `Promise.then`。

nextTick的降级策略，先微任务，再降级到宏任务
* promise
* MutationObserver
* setImmediate
* setTimeout(0)
*
[Vue源码详解之nextTick：MutationObserver只是浮云，microtask才是核心！ · Issue #6 · Ma63d/vue-analysis · GitHub](https://github.com/Ma63d/vue-analysis/issues/6)

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201111036144.png)

#### Vue响应式对数组的处理



###### 为什么vue2中监听不到数组的变化？



并不是因为 `Object.defineProperty`的问题，它本身对数组的表现跟对象是一致的，数组的索引就可以看做`key`来使用，它本身有监控数组下标变化的能力

其实是vue2中放弃了这个特性，在`Observer`中不会对数组进行`walk`处理去遍历所有属性，而是进行了特殊处理
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202202121014580.png)

按照祖师爷的说法是：性能问题，性能代价和获得的用户体验收益不成正比
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202202121009343.png)
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202202121010077.png)
具体可参考[为什么vue没有提供对数组属性的监听](https://github.com/vuejs/vue/issues/8562)

###### 实际处理

改写数组的push、pop等8个方法，让他们在执行之后通知数组更新了，缺点： [参见官网](http://v1-cn.vuejs.org/guide/list.html#%E9%97%AE%E9%A2%98) ）
* 不能直接修改数组的长度 `this.list.length = 0`
* 通过下标去修改数组 `this.list[1] = 'a'`

改写步骤
* 继承原生`Array`的原型方法
* 对继承后的对象使用`Object.defineProperty`进行拦截
* 把被拦截后的响应式原型，赋值到数组数据的原型上
