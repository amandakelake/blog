// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/instanceof  instanceof 运算符用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。
// 是否能在对象的原型链上（顺着__proto__一直往上找）找到构造函数的原型属性（[constructor].prototype）
export function instanceofFn(Left, Constructor) {
    const ConstructorP = Constructor.prototype;
    Left = Left.__proto__;

    while (true) {
        if (Left === null) {
            return false;
        }
        if (Left === ConstructorP) {
            return true;
        }
        // 持续向上查找原型链
        Left = Left.__proto__;
    }
}
