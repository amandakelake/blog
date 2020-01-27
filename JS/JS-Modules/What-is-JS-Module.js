// namespace模式 -> 简单的对象封装
let myModule = {
    data: "lgc",
    fn1() {
        console.log(`fn1: ${this.data}`);
    },
    fn2() {
        console.log(`fn2: ${this.data}`);
    }
};
myModule.data = 'changed data'
myModule.fn1()

// IIFE (自执行闭包)  node环境没有window 无法执行
(function (win) {
    let data = 'lgc';
    function fn1() {
        // 用window调用 注意data的调用
        console.log(`fn1: ${data}`);
    }
    function fn2() {
        console.log('I am fn2, and I can eval internal function');
        fn3()
    }
    function fn3() {
        console.log('fn3')
    }
    win.myModule = { fn1, fn2 }
})(window)

// IIFE + 其他库
// 需要在执行这段代码之前 先引入其他库 -> 强依赖顺序
(function (win, $) {
    let data = 'red'
    function fn1() {
        $('body').css('background', data)
    }
    window.myModule = { fn1 }
})(window, jQuery)