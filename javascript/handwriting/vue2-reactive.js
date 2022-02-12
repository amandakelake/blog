class Observer {
    constructor(data) {
        this.walk(data);
    }

    walk(data) {
        // 此处简化，只处理对象
        if (data instanceof Object) {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    this.defineReactive(data, key, data[key]);
                }
            }
        }
    }

    /**
     * getter中收集依赖，setter中触发依赖
     */
    defineReactive(data, key, val) {
        const _this = this;
        // 每个key实例一个dep
        const dep = new Dep();
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: function () {
                // 将当前的watcher实例收集到依赖中
                Dep.target && dep.addSub(Dep.target);
                return val;
            },
            set: function (newVal) {
                if (val === newVal) {
                    return;
                }
                val = newVal;
                // 递归遍历新值
                _this.walk(newVal);
                // 触发依赖
                dep.notify();
            },
        });
    }
}

class Dep {
    static target;

    constructor() {
        this.subs = [];
    }

    addSub(sub) {
        if (sub && sub.update) {
            this.subs.push(sub);
        }
    }

    notify() {
        this.subs.forEach(sub => sub.update());
    }
}

class Watcher {
    constructor(data, key, callback) {
        // getter收集依赖，getter不能传参，所以通过闭包传进去
        Dep.target = this;
        this.data = data;
        this.key = key;
        this.callback = callback;
        this.value = data[key];
        // 完成某个属性的依赖收集后,清空Dep.target
        // notify方法会重新调用getter（重新获取值，重新收集依赖）
        // 清空Dep.target，防止notify中不停绑定Watcher与Dep -> 代码死循环
        Dep.target = null;
    }

    /**
     * 更新视图 vm._render / 执行user逻辑
     */
    update() {
        this.value = this.data[this.key];
        this.callback(this.value);
    }
}

const data = {
    a: 1,
    b: 1,
};

new Observer(data);

new Watcher(data, 'a', (value) => {
    console.log('watcher update 新值 -> ' + value);
});

data.a = 2;
data.a = {
    c: 'c',
};

new Watcher(data.a, 'c', (value) => {
    console.log('watcher update 新值 -> ' + value);
});

data.a.c = 'hello new world';
