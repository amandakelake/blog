console.log('--------------------------借助构造函数')
function Parent1() {
  this.name = 'parent1'
}
function Child1() {
  // 将父类的执行上下文指向子类，父类执行时的实例属性都会指向子类
  Parent1.call(this);// apply
  this.type = 'child1'
}
// 缺点：子类没有继承父类的原型方法

Parent1.prototype.method = (arg) => console.log(arg);
console.log(new Child1().method); // undefined


console.log('--------------------------借助原型链')
function Parent2() {
  this.name = 'parent2';
  this.arr = [1, 2, 3];
  this.method = (arg) => console.log(arg)
}
function Child2() {
  this.type = 'child2'
}
Child2.prototype = new Parent2();
// 缺点：所有的实例会共享通过原型链继承的属性，实例之间会互相影响
let c21 = new Child2();
let c22 = new Child2();

c21.arr.push(4);
console.log(c21.arr, c22.arr);
// 注意，下面是直接给实例添加method属性
// 只是修改了method指针，没有修改原型链上的method方法
// 只有修改引用对象才是真正的修改
c21.method = 'c21';
console.log(Parent2);
console.log(c21, c22);


console.log('--------------------------组合方式')
function Parent3() {
  this.name = 'parent3';
  this.arr = [1, 2, 3]
}
function Child3() {
  Parent3.call(this);
  this.type = 'child3'
}
Child3.prototype = new Parent3();
// 每个Child3实例拥有了自己的实例方法
let c31 = new Child3();
let c32 = new Child3();
console.log(c31.method, c32.method);
// c31.method = () => console.log('我是c31');
c31.arr.push(4)
console.log(c31.arr, c32.arr);


console.log('----------------------------优化一');
function Parent4() {
  this.name = 'parent4';
  this.arr = [1, 2, 3]
}
function Child4() {
  Parent4.call(this);
  this.type = 'child4'
}
Child4.prototype = Parent4.prototype;

let c41 = new Child4();
let c42 = new Child4();
console.log(c41 instanceof Child4, c41 instanceof Parent4);// true true
console.log(c41.constructor); // Parent4


console.log('-----------------------------优化二')
function Parent5() {
  this.name = 'parent5';
  this.arr = [1, 2, 3]
}
function Child5() {
  Parent5.call(this);
  this.type = 'child5'
}

Child5.prototype = Object.create(Parent5.prototype);
Child5.prototype.constructor = Child5;

let c51 = new Child5();
let c52 = new Parent5();
console.log(c51 instanceof Child5, c51 instanceof Parent5);
console.log(c52 instanceof Child5, c52 instanceof Parent5);
console.log(c51.constructor, c52.constructor);
// true true
// false true
// Child5 Parent5

