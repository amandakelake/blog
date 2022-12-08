# 【JS进阶】JS执行机制与核心概念（执行上下文、变量对象、作用域链、闭包、this）


> 进阶系列文章旨在深入理解JS及其运行原理，从更宏观、底层的角度去串起知识网，不会过多涉及细节以及API的使用，争取在写JS代码时能知其所以然，写出更健壮、高性能的代码和程序

本篇文章涉及的内容
* V8引擎概览、内存空间
* JS编译与执行：执行上下文、变量对象、作用域链、闭包、this
  
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212082234967.png)

## 一、JS引擎
谷歌V8引擎是一个强大的JavaScript引擎，Chrome 和 Node.js 内部都使用了V8引擎来运行JS

引擎主要包括两个组件
* 堆 -> 进行内存分配的区域
* 栈 -> 存放原始类型的数据、代码执行时栈帧的位置

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212062133672.png)

## 二、JS 运行时
引擎可以编译和运行JS，但引擎不提供API

我们日常开发所用的API （比如DOM、AJAX、定时器）统称为Web API ，其实来自于浏览器

由于JS是单线程的编程语言，无法高效并行处理DOM、样式计算和部署、JS计算、输入事件等不同类型的任务，所以引入了事件循环和回调队列

JS的运行时变成了下图的样子
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212062142600.png)

## 三、内存空间
有了运行时，再看看JS的内存空间，主要分为三种内存空间
* 代码空间（存储可执行代码，一般忽略）
* 栈空间
* 堆空间

栈空间用于存放原始类型的小数据，以及存储执行上下文，空间一般不大
> 如果栈空间太大，存太多的数据，会影响上下文切换的效率 -> 影响整个程序的执行效率

栈空间的最大的特点是空间连续，所以在栈中每个元素的地址都是固定的，因此栈空间的查找效率非常高，但是通常在内存中，很难分配到一块很大的连续空间，因此，V8 对栈空间的大小做了限制，如果函数调用层过深，那么 V8 就有可能抛出栈溢出的错误

堆空间是一种树形的存储结构，用来存储对象类型的离散的数据。JavaScript 中除了原生类型的数据，其他的都是对象类型，诸如函数、数组，在浏览器中还有 window 对象、document 对象等，这些都是存在堆空间的

## 四、JS执行机制
有了JS运行时+V8初始化基础的内存空间，接下来就开始执行JS代码

JS代码机制：先编译，再执行，所以分为两个阶段
* 代码编译阶段：将代码翻译成可执行代码
* 代码执行阶段：创建执行上下文、执行代码、垃圾回收

### 4.1 代码编译

在执行代码前，V8需要先将JS编译成字节码，再解释执行字节码，或者将需要优化的字节码编译成二进制，并直接执行二进制代码

也就是说，V8需要将JS编译成字节码或者二进制代码，再执行

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212062242269.png)

翻译成字节码或者二进制代码只是结果，中间有几个过程
* 词法、语法分析
* 确定作用域规则（下面会讲）
* 生成可执行代码

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212082234974.png)

### 4.2 代码执行

经过代码编译后，来到代码执行阶段

先了解执行上下文，它是JS核心中的基础，只有理解了执行上下文，才能更好的理解变量提升、作用域、闭包等

#### 4.2.1 执行上下文

执行上下文也称为调用栈，是JS引擎用于追踪函数执行以及函数间调用关系的机制，通过栈这种数据结构记录了在程序中的位置

JS是单线程语言，它只有一个调用栈，主要做的事情：进入函数，JS引擎把该函数的执行上下文压栈，从函数中返回则将执行上下文出栈

看个简单例子
```js
function multiply(x, y) {
  return x * y;
}

function printSquare(x) {
  var s = multiply(x, x);
  console.log(s);
}

printSquare(5);
```

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212062212972.png)

调用栈中的每个条目被称为栈帧，当栈深度达到最大调用栈的大小，会发生**堆栈溢出错误**，报文`Maximum call stack size exceeded`，最常见的场景是没有停止条件的递归函数，比如
```js
function foo() {
	foo();
}

foo();
```

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212062212099.png)

执行上下文分三种
* 	全局执行上下文：JS代码执行时首先进入该环境
* 函数执行上下文（重点讲解）：函数被调用时，进入当前函数执行上下文
* eval执行上下文（很少涉及）


当一个函数被激活时，一个新的执行上下文就会被创建（这个执行上下文在栈顶），一个执行上下文的生命周期分为两个阶段
* 创建阶段：创建变量对象、建立作用域链、确定this的指向
* 代码执行阶段： 变量赋值 、函数引用、 执行其他代码

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212082234092.png)

这里开始涉及JS重要的概念，如变量提升、作用域、this等，先从变量对象开始

#### 4.2.2 变量对象

> 变量对象 Variable Object，简称 VO
> 进入执行阶段，变量对象变成活动对象 Active Object , 简称 AO

变量对象的创建有几个过程

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212080925527.png)

* 建立arguments对象：当前上下文中的参数，建立该对象下的属性与属性值
* 检查当前上下文的函数声明（**这就是为什么函数是一等公民**）
  * 寻找`function`函数，添加属性名到变量对象中，属性值指向该函数的内存地址
  * 遇到同名的`function`函数声明，属性会被新的引用覆盖
  * 函数表达式不会被提升，相当于变量声明
        
* 检查当前上下文中的变量声明
  * 每找到一个变量声明，就添加到变量对象中，属性值为`undefined`
  * 遇到同名属性会跳过，可防止同名函数被修改为`undefined`，同一个执行上下文中，变量对象是唯一的（有可能在代码执行阶段被修改赋值）
  * `const/let`声明的变量，也会被收集到变量对象中，但不会赋值`undefined`，所以不能再赋值前调用，也就是常说的`暂时性死区`，如果访问了，报错`Uncaugth ReferenceError: Cannot access [变量名] before initialization`

变量对象创建完后，需等到进入执行阶段才可以访问其中的属性

进入执行阶段，变量对象转变为活动对象，属性能访问，开始执行该阶段的操作

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212082235667.png)

变量对象和活动对象其实是同一个对象，只是处于执行上下文的不同生命周期，处于函数调用栈的**栈顶**的执行上下文中的变量对象，才会变为活动对象

执行阶段，JS引擎开始按顺序一行一行的执行，遇到变量会按顺序赋值，遇见一个赋值语句就覆盖一个属性，包括函数名、不同类型的值
> 由于变量提升这种特性，新手、或者从C/JAVA等静态强类型语言转过来的程序员，很容易写出与直觉不符合的代码，这里既有JS语言的动态性，又有它的设计缺陷，毕竟只是一门两个星期就写出来的脚本语言。Typescript可在编译阶段进行类型检查，尽可能提前规避此类问题

看个例子
```js
function test() {
    console.log(foo);
    console.log(bar);

    function foo() {}
	  foo = 'Hello';
    var bar = function() {}
    console.log(foo)
    console.log(bar)
 }
test();

// 一、创建阶段，创建变量对象
VO = {
  arguments: {...},
  foo: <foo reference>, //优先函数声明，碰到变量foo不会被覆盖，var声明的变量当遇到同名的属性时，会跳过而不会覆盖
  bar: underfined // 函数表达式 -> 当做变量声明处理
}

// 二、执行阶段，VO => AO，按顺序赋值，逐一覆盖
AO = {
  arguments: {...},
  foo: 'Hello', // 执行阶段按顺序进行赋值或者引用
  bar: <bar reference>,
}

// 预编辑伪代码
  function test() {
      // 1、创建变量对象阶段
      var foo;
      foo => function foo() {} //一等公民函数，优先声明，并指向函数的引用地址
      var bar : underfined

      // 2、代码执行阶段: 变量赋值，函数引用, 全部按照顺序来
      console.log(foo); // 函数引用
      console.log(bar); // underfined
      // 按顺序执行到这里，重新给变量foo赋值
      foo = 'Hello';
      console.log(foo); // 'Hello'
      bar = function () {
      return 'world';
    }
  }
```

再看一个例子
```js
function testOrder(arg) {
    console.log(arg); // arg是形参，不会被重新定义
    console.log(a); // 函数声明比变量声明优先级高，这里a先是函数
    var arg = 'new arg'; // var arg;变量声明被忽略， arg = 'new arg'被执行
    var a = 10; // var a;被忽视; a = 10被执行，a变成number
    function a() {} // 被提升到作用域顶部
    console.log(a); // 输出10
    console.log(arg); // 输出hello
}; 
testOrder('old arg');

// 输出
// old arg
// function a() {}
// 10 
// new arg 
```

#### 4.2.3 块级作用域

变量提升有两个问题
* 变量容易被覆盖
* 本应销毁的变量没有被销毁
```js
function foo(){ 
  for (var i = 0; i < 7; i++) {
  } 
  console.log(i); 
}
foo() // i打印7
```
如果用C或其他大部分语言，for循环结束后，`i`应该被销毁了，但JS并没有，打印出`7`

这是变量提升的杰作，在创建执行上下文的阶段，变量`i`就被提升了，所以for循环结束后，`i`不会被销毁

为了尽可能避开**变量提升**这个JS的设计缺陷，ES6用`let/const`引入了**块级作用域**（之前JS只有**全局作用域**和**函数作用域**两种）

> 块级作用域就是使用一对大括号包裹的一段代码，比如函数、判断语句、循环语句，甚至单独的一个{}都可以被看作是一个块级作用域，大部分语言都支持块级作用域

```js
function letTest() {
  let x = 1;
  if (true) {
    let x = 2;  // 块级作用域，let声明的x跟外面的x不同的变量
    console.log(x);  // 2
  }
  console.log(x);  // 1
}
```

要理解变量提升和块级作用域两种特性同时存在，还是回到执行上下文
```js
function foo(){
    var a = 1
    let b = 2
    {
      let b = 3
      var c = 4 // 用var，即使在{}块里，也会被提升
      let d = 5
      console.log(a)
      console.log(b)
    }
    console.log(b) 
    console.log(c)
    console.log(d)
}   
foo()
```

编辑并创建执行上下文如下图

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212082235655.png)
* var声明的变量，全部被提取到变量对象里
* let/const声明的变量，放到词法环境里
* 函数作用域块内部用let声明的变量，并没有存放到词法环境

然后执行代码阶段，先执行到内部代码块

这里特殊的地方在于，作用域块内部的变量b并不影响外部的变量b

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212082235501.png)

词法环境里维护了一个小型的栈结构，在不同块级作用域通过`let/const`声明的变量会有进栈出栈的行为

然后具体执行赋值语句

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212082235621.png)

具体查找顺序：词法环境的栈顶开始 -> 词法环境的某个块级 -> 变量对象

通过上面简单的例子，可以了解词法环境的结构和工作机制
* 块级作用域是通过词法环境的栈结构来实现的
* 变量提升是通过变量环境来实现
  通过这两者的结合，JavaScript 引擎也就同时支持了变量提升和块级作用域了

#### 4.2.4 作用域与作用域链

执行上下文中，除了有变量对象，还有作用域链和this

作用域是一套规则，作用域链是作用域的具体实现

每个函数的执行上下文都会通过进栈出栈的形式来执行，在每个执行上下文的变量环境中，包含了一个外部引用outer，用来指向外部的执行上下文

如果JS引擎在当前执行上下文中找不到某个变量，就会继续在outer指向的执行上下文中查找，一直到全局的执行上下文，这个查找链条称为作用域链

看个例子
```js
function bar() {
    console.log(myName)
}
function foo() {
    var myName = "极客邦"
    bar()
}
var myName = "极客时间"
foo()
```

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212082235088.png)

在上面块级作用域中就使用了作用域链

在JS执行过程中，作用域链是由词法作用域决定的，而词法作用域是由代码中函数声明的位置决定的，在代码编译阶段就决定的静态作用域，跟函数怎么调用没有关系

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212082236404.webp)

再看个例子，深入理解一下查找作用域链的过程

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212082236523.webp)

总结，通过作用域查找变量的链接称为作用域链，作用域链是通过词法作用域确定的，它反应了代码的结构

#### 4.2.5 闭包

在理解了执行上下文、词法作用域、变量环境、作用域链等概念的前提下，理解闭包就比较容易了
```js
function foo() {
  var a = 2;
  function bar() {
    console.log(a);
  }
  return bar;
}
var baz = foo();
baz();
```
通过断点，可以看到作用域链的具体调用

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212082236501.png)

作用域链：Local -> Closure(foo) -> Global

先查找 baz 自身的作用域，然后查找foo函数的闭包（闭包里存了`a`变量），最后是全局作用域

这里有一个foo函数的闭包，它是怎么产生的？

先给闭包一个定义：在执行上下文A中创建了函数B，当B执行时访问了A中的变量（即使A已经执行结束，执行上下文已出栈），这些变量会保存在内存中，这些变量的集合成为闭包

用上面的例子来解释：foo函数创建了bar函数，根据词法作用域的规则，bar总是可以访问它的外部函数foo中的变量，即使foo函数已经执行结束，通过bar函数依然能访问到foo函数的内部变量a，a不会随着foo函数执行上下文的销毁而销毁，而是生成Closure(foo)，被保存在了内存中

闭包常驻内存，那何时释放内存呢？因此闭包常与内存泄露打交道，这块内容会放到在垃圾回收中
> 在浏览器中可通过查看memory来观察内存是否有上升的趋势
> 在Node环境可通过 headdump 抓取内存信息进行分析

#### 4.2.6 This

一个完整的执行上下文，除了变量环境、词法环境、作用域链，还有一个this

JS的作用域机制并不支持在对象内部方法中使用自身内部属性，所以需要额外搞出一套**This**机制，它跟作用域链是两套系统，没有太多联系

this分为以下四种类型

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212082236248.png)

举一个this比较容易混淆的例子
```js
var name = "window name"
var obj = {
  name : "obj name", 
  showThis: function(){
    console.log(this.name)
    function bar(){ 
		console.log(this.name) 
	  }
    bar()
  }
}
obj.showThis()
// 第一个this执行obj对象 -> 这个容易理解
// 第二个，bar里面的this -> 指向window对象，容易误以为继承外面的this
```

这是this的设计缺陷之一：嵌套函数中的this不会继承外层函数的this
解决方法有两种
* 	在外层函数声明变量self来保存this  -> 把this体系转换为作用域的体系
* ES6的箭头函数：箭头函数不会创建自身的执行上下文，它的this取决于外部函数（也可以说它无this）

this的设计缺陷二：普通函数中的this指向全局对象window
常见的解决办法：用call、apply显示调用某个对象

最后再强调一次：this跟作用域链是两套体系，它的诞生源自于**JS的作用域机制不支持在对象内部方法中使用自身内部属性**

## 五、总结

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202212082238530.png)
