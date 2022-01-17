export class EventEmitter {
    constructor() {
        this.cache = {};
    }

    on(name, fn) {
        if (this.cache[name]) {
            this.cache[name].push(fn);
        } else {
            this.cache[name] = [fn];
        }
    }

    emit(name, ...args) {
        if (this.cache[name]) {
            // 拷贝，否则如果回调函数内继续注册相同的事件，会造成死循环
            const tasks = this.cache[name].slice();
            for (let fn of tasks) {
                fn(...args);
            }
        }
    }

    off(name, fn) {
        const tasks = this.cache[name];
        if (tasks) {
            const index = tasks.findIndex(f => f === fn || f.callback === fn);
            if (index > 0) {
                tasks.splice(index, 1);
            }
        }
    }
}
