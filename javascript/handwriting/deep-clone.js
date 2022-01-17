/**
 * JSON.parse(JSON.stringify(object))的问题在于
 *  1、忽略undefined
 *  2、忽略 Symbol
 *  3、不能序列化函数
 *  4、不能解决循环引用的对象
 * DeepClone1 -> 解决类型的问题，包括数组
 * @param target
 */
export function DeepClone1(target) {
    if (typeof target === 'object') {
        // 考虑是否数组
        let cloneTarget = Array.isArray(target) ? [] : {};
        for (const key in target) {
            // 不考虑原型属性
            if (target.hasOwnProperty(key)) {
                // 递归拷贝
                cloneTarget[key] = DeepClone1(target[key]);
            }
        }
        return cloneTarget;
        // 非引用类型，直接返回即可
    } else {
        return target;
    }
}

/**
 * 解决循环引用的问题，用weakMap 替代 map, 内存释放
 * 用map额外开辟内存空间，存储当前对象和拷贝对象的关系
 */
export function DeepClone2(target, map = new Map()) {
    if (typeof target === 'object') {
        let cloneTarget = Array.isArray(target) ? [] : {};
        if (map.get(target)) {
            return map.get(target);
        }
        map.set(target, cloneTarget);
        for (const key in target) {
            if (target.hasOwnProperty(key)) {
                cloneTarget[key] = DeepClone2(target[key], map);
            }
        }
        return cloneTarget;
    } else {
        return target;
    }
}

// 引用类型除了对象和函数，还有null和function，可封装一个isObject
function isObject(target) {
    const type = typeof target;
    return target !== null && (type === 'object' || type === 'function');
}

/**
 * 按照是否可遍历，将数据类型分类处理
 * 可遍历：object/array/map/set
 * 不可遍历：string/number/boolean/symbol、undefined/null、function、regex/date/error/math/JSON
 * 返回 [object Array]
 */
function getType(target) {
    return Object.prototype.toString.call(target);
}

// 函数类型，直接返回，一般不考虑
