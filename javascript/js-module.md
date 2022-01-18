# JS 模块化
#Front-End/JS

<img width="2031" alt="JS模块化" src="https://user-images.githubusercontent.com/25027560/73161366-55119600-4126-11ea-943a-6e5173ab9c03.png">

## Common JS
* 模块可以多次加载，只会在第一次加载时运行一次，运行结果就会缓存下来，要再次运行模块，必须清除缓存
* 同步加载，模块加载会阻塞后面代码的执行
* 用于服务器环境（nodejs）

`exports`只是对`module.exports`的引用，相当于Node为每个模块提供了一个`exports`变量，指向`module.exports`，相当于每个模块头部都有这么一行代码
```js
var exports = module.exports
```

模块导出与引用
```jso
// common-js-a.js 暴露模块
// 默认加了一行 var exports = module.exports
exports.a = 'hello world';

// common-js-b.js 引入模块
const moduleA = require('./common-js-a');
console.log(moduleA.a)
```

## AMD
* 异步加载
* 浏览器环境，依赖前置
```js
// a.js 暴露模块, module1和module2 是其他前置依赖
define(['module1', 'module2'], function (m1, m2) {
	return { a: 'hello world' };
})

// b.js 引入模块
require(['./a.js'], function (moduleA) {
	console.log(moduleA.a)
})
```

## CMD
* 浏览器环境
* 异步加载，就近依赖
```js
// 异步加载 就近依赖

// a.js 导出
define(function(require, exports, module) {
    exports.a = 'hello CMD'
})

// b.js 导入
define(function(require, exports, module) {
	var moduleA = require('./a.js') // 依赖就近
	console.log(moduleA.a)
})
```

## UMD
兼容AMD、commonJS、全局引用
同时支持运行在浏览器和Node环境
```js
(function webpackUniversalModuleDefinition(root, factory) {
  // Test Comment
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory(require('lodash'));
  // Test Comment
  else if(typeof define === 'function' && define.amd)
    define(['lodash'], factory);
  // Test Comment
  else if(typeof exports === 'object')
    exports['someLibName'] = factory(require('lodash'));
  // Test Comment
  else
    root['someLibName'] = factory(root['_']);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
  // ...
});
```

## ES6 Module
```js
// a.js
export const a = 'hello es6 module'

// b.js
import { a } from './a.js'
```

* 浏览器环境，目前仍需要babel编译为ES5代码
* export只支持对象形式导出，不支持值的导出，export default指定默认输出，本质上是一个叫做default的变量


## 总结
* CommonJS的同步加载机制主要用于服务器端，也就是Node，但与之相伴的阻塞加载特点并不适用于浏览器资源的加载，所以诞生了AMD、CMD规范
* AMD与CMD都可以在浏览器中异步加载模块，但实际上这两种规范的开发成本都比较高
* UMD同时兼容AMD、commonJS、全局引用等规范，算是目前打包JS库的主流吧
* ES6在语言标准的层面上实现了模块化，使用起来非常舒服，目前算是浏览器端的标准方案，再加上现代打包工具的加持，称霸Node服务端也指日可待
