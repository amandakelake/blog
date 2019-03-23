// 写成单独的数据观察方法，方便递归
function observe(data) {
  // 如果不是对象，直接return
  if (!data || typeof data !== 'object') {
    return;
  }
  Object.keys(data).forEach(key => {
    defineReactive(data, key);
  })
}

// 数据劫持
function defineReactive(data, key) {
  let val = data[key];

  // 递归子属性，深度劫持对象
  observe(val);

  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get() {
      // 注意这里
      // 在vue源码里面，这里其实是收集依赖的时机，但是在这个时候数据的getter函数不知道当前的Watcher是哪一个
      // 这里，我们直接放到Watcher构造函数里面做了
      // 这里下面会使用一个类似全局变量的Dep.target = this来记录当前的Watcher，方便添加依赖到正在执行的Watcher
      return val;
    },
    set(newVal) {
      if (val === newVal) {
        return;
      }
      val = newVal;
      // 设置为新值后，把新的值也定义为属性
      observe(newVal)
    }
  })
}

// 依赖收集
class Dep {
  constructor() {
    this.subs = []
  }
  addSub(sub) {
    // 每个sub其实就是一个Watcher实例，自带update方法
    this.subs.push(sub)
  }
  notify() {
    this.subs.forEach(sub => {
      sub.update();
    })
  }
}

class Watcher {
  constructor(data, key, cb) {
    // 注意这里，这就是上面说的getter里面收集依赖，
    Dep.target = this;
    this.data = data;
    this.key = key;
    this.cb = cb;
    this.value = data[key];
    // 清空了Dep.target，是为了防止notify触发时，不停的绑定Watcher与Dep，造成代码死循环
    // 因为notify方法会重新调用getter（重新获取值，重新收集依赖）
    Dep.target = null;
  }
  // new出来的每个watcher实例都自带这个update方法
  update() {
    this.value = this.data[this.key];
    this.cb(this.value);
  }
}
