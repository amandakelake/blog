export function debounce(fn, delay) {
    let timer;
    return function () {
        const _this = this; // 取出执行作用域的this
        const args = arguments;
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            fn.apply(_this, args);
        }, delay);
    };
}


export function throttle(fn, delay) {
    let timer;
    return function () {
        const _this = this; // 取出执行作用域的this
        const args = arguments;
        if (timer) {
            return;
        }
        timer = setTimeout(function () {
            fn.apply(_this, args);
            timer = null; // 执行完完后清空，允许进入下一轮的计时执行
        }, delay);
    };
}
