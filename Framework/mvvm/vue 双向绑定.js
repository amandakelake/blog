function observe(data) {
  // 如果data不是对象则return
  if (!data || typeof data !== 'object') {
    return;
  }

  // 取出所有的属性遍历
  Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
}
// 递归子属性对象，给每个属性加上setter和getter
function defineReactive(data, key, cal) {
  // 监听子属性
  observe(val);

  // Object.defineProperty(obj, prop, descriptor)
  Object.defineProperty(data, key, {
    enumerable: true, // 可枚举
    configurable: false, // 不能再被define
    get: () => {
      // 通过Dep定义一个全局target属性，即watcher实例
      // 添加完移除
      Dep.target && dep.addDep(Dep.target);
      return val;
    },
    set: newVal => {
      if (val === newVal) {
        return;
      }
      val = newVal;
      // 通知所有订阅者

    }
  });
}



// 消息订阅器，维护一个数组，用来收集订阅者
// 数据变动触发notify，再调用订阅者的update方法
function Dep() {
  this.subs = [];
}
// defineProperty函数执行过程中新建了一个Dep，闭包在了属性的getter和setter中，
// 因此每个属性都有一个唯一的Dep与其对应，我们暂且可以把属性和他对应的Dep理解为一体的
Dep.prototype = {
  addSub: sub => {
    this.sub.push(sub);
  },
  notify: () => {
    // 调用订阅者的update方法，通知变化
    this.subs.forEach(sub => sub.update())
  }
}




function Watcher(vm, exp, cb) {
  this.cb = cb;
  this.vm = vm;
  this.exp = exp;
  // 为了触发属性的getter,在dep添加自己
  this.value = this.get();
}
Watcher.prototype = {
  // 属性变化收到通知
  update: () => this.run(),
  run: () => {
    // 取得最新值
    const value = this.get();
    const oldVal = this.value;
    // 如果值发生变化，执行Compile中绑定的回调，更新视图
    if (value !== oldVal) {
      this.value = value;
      this.cb.call(this.vm, value, oldVal);
    }
  },
  get: () => {
    // 将当前订阅者指向自己
    Dep.target = this;
    // 触发getter，添加自己到属性订阅器中
    var value = this.vm[exp]
    return value;
    // 添加完毕，重置
    Dep.target = null;
  }
}


function Compile(el) {}
Compile.prototype = {}


