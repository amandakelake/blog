// class Person {
//   speak() {
//     console.log("hello")
//   }
// }

// class Decorater {
//   constructor(target) {
//     this.target = target;
//   }
//   // 在原有基础上添加新的行为
//   speak() {
//     this.target.speak();
//     console.log("world")
//   }
// }

// let p1 = new Person();
// p1.speak();
// console.log("————————————————");

// let p2 = new Decorater(p1);
// p2.speak();

// @Dec("basketball")
// class Demo{
//   // ...
// }

// function Dec(args) {
//   return function(target) {
//     target.speak = function() {
//       console.log((`I love ${args}`))
//     }
//   }
// }

// Demo.speak(); // I love basketball


// // mixin
// function mixins(...list) {
//   return function(target) {
//     Object.assign(target.prototype, ...list)
//   }
// }

// const Foo = {
//   foo() {
//     console.log("I am foo")
//   }
// }
// @mixins(Foo)
// class MyClass {}

// let obj = new MyClass()
// obj.foo();


// function readonly(target, name, descriptor) {
//   descriptor.writable = false,
//   return descriptor
// }

function log(target, name, descriptor) {
  let oldVal = descriptor.value;
  descriptor.value = function() {
    console.log(`calling ${name} with `, arguments);
    // 执行完添加的逻辑后，再恢复原有逻辑
    // 可用于警告即将过期的属性
    return oldVal.apply(this, arguments)
  }
  return descriptor;
}

class Foo {
  @log
  speak(arg) {
    console.log('arg', arg)
  }
}

let foo = new Foo();
foo.speak('?');