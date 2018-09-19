// 父类
class people {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  eat() {
    console.log(`${this.name} eat something`)
  }
  speak() {
    console.log(`My name is ${this.name}, age: ${this.age}`)
  }
}

let LGC = new people("LGC", 24)
console.log(LGC.eat())

let Amanda = new people("Amanda", 24)
console.log(Amanda.eat())

// 子类继承父类
class Student extends people {
  constructor(name, age, number) {
    super(name, age);
    this.number = number;
  }
  study() {
    console.log(`${this.name} is studying`)
  }
}

let LGC1 = new Student("LGC1", 24, 2);
LGC1.study();
LGC1.eat();
console.log(LGC1.number);

class jQuery {
  constructor(selector) {
    let slice = Array.prototype.slice;
    let dom = slice.call(document.querySelectorAll(selector));
    let len = dom ? dom.length : 0;
    for(let i = 0; i < len; i++) {
      this[i] = dom[i]
    }
    this.length = len;
    this.selector = selector || ''
  }
  append(node) {}
  addClass(name) {}
  html(data) {}
  // 省略N个api
}

window.$ = function(selector) {
  // 工厂模式
  return new jQuery(selector)
}

const $p = $('p')
console.log($p);