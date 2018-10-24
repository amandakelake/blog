// 存在的问题
// 1，违反了单一职责原则
// 2、每次都会创建新的实例（可以做成惰性）

const CreateDiv = (function() {
  let instance;

  const CreateDiv = function(html) {
    if (instance) {
      return instance;
    }
    this.html = html;
    this.init();
    return instance = this;
  }

  CreateDiv.prototype.init = function() {
    let div = document.createElement('div');
    div.innerHTML = this.html;
    document.body.appendChild(div);
  }

  return CreateDiv;
})()

const a = new CreateDiv('a');
const b = new CreateDiv('b')