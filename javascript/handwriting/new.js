/**
 * 本质上两个东西：连接原型链，执行构造函数方法继承属性
 * 声明一个中间对象
 * 将该中间对象的原型指向构造函数的原型
 * 将构造函数的this，指向该中间对象
 * 返回该中间对象，即返回实例对象
 */
export function newF() {
    const obj = {};
    // 取出第一个参数: 将会传入的构造函数，比如在调用new(P)的时候，Constructor就是P本身
    // arguments会被shift去除第一个参数，剩余的就是构造器P的参数
    const Constructor = [].shift.call(arguments);
    // 将obj的原型指向构造函数，此时obj可以访问构造函数原型中的属性
    obj.__proto__ = Constructor.prototype;
    // 改变构造函数的this的指向，使其指向obj， 此时obj也可以访问构造函数中的属性了
    const result = Constructor.apply(obj, arguments);
    // 确保 new 出来的是个对象 返回的值是什么就return什么
    return typeof result === 'object' ? result : obj;
}
