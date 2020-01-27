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
