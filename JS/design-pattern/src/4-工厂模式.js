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

// 把new封装起来的工厂函数
window.$ = function(selector) {
  // 工厂模式
  return new jQuery(selector)
}