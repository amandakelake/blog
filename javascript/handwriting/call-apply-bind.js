/**
 * 1、将要执行的函数设置为对象的属性
 * 2、执行函数（难点在于取出参数）
 * 3、删除该函数
 */
Function.prototype.myCall = function (context) {
    // 取得传入的对象（执行上下文），比如上文的foo对象
    // 不传第一个参数，默认是window,
    var context = context || window;
    // 给context添加一个属性，这时的this指向调用call的函数，比如上文的bar
    context.fn = this;
    // 通过展开运算符和解构赋值取出context后面的参数
    var args = [...arguments].slice(1);
    // 执行函数
    var result = context.fn(...args);
    // 删除函数
    delete context.fn;
    return result;
};

Function.prototype.myApply = function (context) {
    var context = context || window;
    context.fn = this;
    var result;

    // 判断第二个参数是否存在，是一个数组
    // 如果存在，则需要展开第二个参数
    if (arguments[1]) {
        result = context.fn(...arguments[1]);
    } else {
        result = context.fn();
    }

    delete context.fn;
    return result;
};

// bind的思路和作用基本一致，区别在于返回一个函数，并且可以通过bind实现柯里化
Function.prototype.bind = function (context) {
    if (typeof this !== 'function') {
        throw new TypeError('Error');
    }

    var _this = this;
    var args = [...arguments].slice(1);

    return function Fn() {
        // 判断是否用于构造函数
        if (this instanceof Fn) {
            return new _this(args, ...arguments);
        }
        return _this.apply(context, args.concat(arguments));
    };
};
