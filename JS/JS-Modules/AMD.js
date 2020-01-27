// 异步加载 前置依赖

// a.js 暴露模块, module1和module2 是其他前置依赖
define(['module1', 'module2'], function (m1, m2) {
    return { a: 'hello world' };
})

// b.js 引入模块
require(['./a.js'], function (moduleA) {
    console.log(moduleA.a)
})
