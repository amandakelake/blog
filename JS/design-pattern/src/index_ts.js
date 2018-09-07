// 父类
class people {
  name
  age
  protected weight
  constructor(name, age) {
    this.name = name;
    this.age = age;
    this.weight = 120;
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
  number
  private girlfriend
  constructor(name, age, number) {
    super(name, age);
    this.number = number;
    this.girlfriend = "xiaoli"
  }
  study() {
    console.log(`${this.name} is studying`)
  }
  getWeight() {
    console.log(`my weight is ${weight}`)
  }
}

let LGC1 = new Student("LGC1", 24, 2);
// 报错，protected不能在外面读
console.log(LGC1.weight);
// protected 可以在子类内部读
console.log(LGC1.getWeight());
// private 私有 不给读
console.log(LGC1.girlfriend);