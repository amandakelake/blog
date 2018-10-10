class SingleObject {
  login() {
    console.log("login")
  }
}

// 通过给类挂载一个静态方法，而且是自执行方法
// 通过闭包，返回唯一的实例instance
// 实例只有一个
SingleObject.getInstance = (function() {
  let instance;
  // 返回一个函数
  return function() {
    if (!instance) {
      instance = new SingleObject();
    }
    return instance
  }
})()

let obj1 = SingleObject.getInstance();
let obj2 = SingleObject.getInstance();

obj1.login();
obj2.login();

// 这里会返回true，说明是唯一的同一个实例
console.log('obj1 === obj2', obj1 === obj2);


// 但是，这里只能口头约定不能直接new SingleObject()
// 就算new了，也不会报错,下面会返回false
let obj3 = new SingleObject()
console.log('obj1 === obj3', obj1 === obj2);