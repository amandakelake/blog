// 职责单一，不干涉fn的逻辑
const getSingle = function(fn) {
  // 闭包大兄弟,用来保存fn函数执行后的计算结果
  let result;
  return function() {
    return result || (result = fn.apply(this, arguments));
  }
}

// 模拟一个fn 生成一个iframe/div/script
const createIframe = function() {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  return iframe;
}

// 结合使用  创建唯一实例对象
const singleIframe = getSingle(createIframe);