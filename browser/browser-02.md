# 【浏览器原理-02】浏览器中的JS执行机制

## 1、变量提升

[变量对象（真正理解何为提升） · Issue #7 · amandakelake/blog · GitHub](https://github.com/amandakelake/blog/issues/7)
JS代码执行
* 	编译阶段
     * 变量和函数被存放到**变量环境**中，变量默认值为`undefined`，函数名只是一个引用，函数实体是保存到堆中
* 代码执行阶段
    * 从变量环境中查找变量和函数，并执行赋值操作

## 2、调用栈

* 每调用一个函数，JavaScript 引擎会为其创建执行上下文，并把该执行上下文压入调用栈，然后 JavaScript 引擎开始执行函数代码
* 如果在一个函数 A 中调用了另外一个函数 B，那么 JavaScript 引擎会为 B 函数创建执行上下文，并将 B 函数的执行上下文压入栈顶
* 当前函数执行完毕后，JavaScript 引擎会将该函数的执行上下文弹出栈
* 当分配的调用栈空间被占满时，会引发“堆栈溢出”问题

调用栈有两个指标，每个平台不一样
* 最大栈容量
* 最大调用深度

对于闭包来说，执行上下文已经没了，不过内部函数引用的变量还保存在堆上，所以不影响操作

```js
function runStack (n) {
  if (n === 0) return 100;
  return runStack(n - 2);
}
runStack(50000)
```
对于栈溢出的问题，有以下优化方法

* 循环，不使用递归函数就不存在堆栈溢出
```js
function runStack(n) {
    while (true) {
        if (n === 0) {
            return 100;
        }

        if (n === 1) { // 防止陷入死循环
            return 200;
        }

        n = n - 2;
    }
}
console.log(runStack(50000));
```
* 通过异步执行，不进栈
```js
function runStack (n) {
  if (n === 0) return 100;
  return setTimeout(function(){runStack( n- 2)},0);
}
runStack(50000)
```
* 考虑尾递归 [尾调用优化 - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2015/04/tail-call.html)
    * 尾调用由于是函数的最后一步操作，所以不需要保留外层函数的调用记录，因为调用位置、内部变量等信息都不会再用到了，只要直接用内层函数的调用记录，取代外层函数的调用记录就可以了
    * 下方代码 -> ”尾调用优化”（Tail call optimization），即只保留内层函数的调用记录。如果所有函数都是尾调用，那么完全可以做到每次执行时，调用记录只有一项，这将大大节省内存。这就是”尾调用优化”的意义。
```js
function g() {
}

function f() {
    let m = 1;
    let n = 2;
    return g(m + n);
}
f();

// 等同于
function f() {
    return g(3);
}
f();

// 等同于
g(3);
```

## 3、var缺陷，为何引入const/let -> 变量提升带来的变量覆盖、污染

作用域就是变量与函数的可访问范围，即作用域控制着变量和函数的可见性和生命周期

ES6之前，ES只有两种作用域
* 全局作用域：这里的对象在代码的任何地方都能访问，生命周期伴随着页面的生命周期
* 函数作用域：函数内部定义的变量或者函数，只能在函数内部被访问，函数执行之后，内部定义的变量会被销毁（闭包暂不讨论）

ES6引入了块级作用域
* 函数内部通过 var 声明的变量，在编译阶段全都被存放到变量环境里面
* 通过 let 声明的变量，在编译阶段会被存放到词法环境（Lexical Environment）中

块级作用域就是通过词法环境的栈结构来实现的
而变量提升是通过变量环境来实现，
通过这两者的结合，JavaScript 引擎也就同时支持了变量提升和块级作用域了

一个变量的查找过程：沿着词法环境的栈顶向下查询，如果在词法环境中的某个块中查找到了，就直接返回给 JavaScript 引擎，如果没有查找到，那么继续在变量环境中查找

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201051617310.png)

* Var的创建和初始化被提升，赋值不会被提升。
* Let的创建被提升，初始化(uninitialized)和赋值不会被提升。
* Function的创建、初始化和赋值均会被提升。

Let的暂时性死区是因为V8虚拟机做了限制，虽然a在内存中，但是当你在let a 之前访问a时，根据ECMAScript定义，虚拟机会阻止的访问
```js
function test() {
    console.log(a)
    let a = 7;
}
test();
```

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201051617667.png)

> 既然聊到了作用域，那最后我们再简单聊下编程语言吧。经常有人争论什么编程语言是世界上最好的语言，但如果站在语言本身来说，我觉得这种争论没有意义，因为语言是工具，而工具是用来创造价值的，至于能否创造价值或创造多大价值不完全由语言本身的特性决定。这么说吧，即便一门设计不那么好的语言，它也可能拥有非常好的生态，比如有完善的框架、非常多的落地应用，又或者能够给开发者带来更多的回报，这些都是评判因素。
> 如果站在语言层面来谈，每种语言其实都是在相互借鉴对方的优势，协同进化，比如 JavaScript 引进了块级作用域、迭代器和协程，其底层虚拟机的实现和 Java、Python 又是非常相似，也就是说如果你理解了 JavaScript 协程和 JavaScript 中的虚拟机，其实你也就理解了 Java、Python 中的协程和虚拟机的实现机制。
> 所以说，**语言本身好坏不重要，重要的是能为开发者创造价值**。

## 4、作用域链和闭包
变量提升是通过变量环境来实现，而块级作用域就是通过词法环境的栈结构来实现的，通过这两者的结合，JavaScript 引擎也就同时支持了变量提升和块级作用域了

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201051617327.png)

## 5、this
[this · Issue #5 · amandakelake/blog · GitHub](https://github.com/amandakelake/blog/issues/5)

作用域链和this是两套不同的系统，它们之间没太多联系
