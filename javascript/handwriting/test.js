function disorder(array) {
    const length = array.length;
    let current = length - 1;
    let random;
    while (current > -1) {
        random = Math.floor(length * Math.random());
        [array[current], array[random]] = [array[random], array[current]];
        current--;
    }
    return array;
}

function currying(fn) {
    // 除去fn以外的就是要处理的外部参数
    const args = [...arguments].slice(1);
    return function () {
        const innerArgs = [...arguments];
        // 合并要库里化的参数+当前的参数
        const finalArgs = args.concat(innerArgs);
        return fn.apply(null, finalArgs);
    };
}

Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
