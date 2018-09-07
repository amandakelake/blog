class Person {
  constructor(name) {
    this.name = name
  }
  getName() {
    return this.name
  }
}

let p = new Person("LGC")
console.log(p.getName())