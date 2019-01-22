/*
  将一个数组以li标签的形式插入到id为listID的元素内
*/
export const arrayToHtmlList = (arr, listID) => (
  el => (
    (el = document.querySelector(`#${listID}`)),
    (el.innerHTML += arr.map(item => `<li>${item}</li>`).join(''))
  )
)()

/*
    页面底部是否在视窗内
*/
export const bottomVisible = () => {
  return document.documentElement.clientHeight + window.scrollY >= (document.documentElement.scrollHeight || document.documentElement.clientHeight)
}

// 复制到粘贴板 生成<textarea> -> 赋值 -> Selection.getRangeAt()存储值 -> document.execCommand('copy')复制到粘贴板 ->
export const copyToClipboard = (str) => {
  // 生成<textarea> -> 赋值
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
  alert('复制成功')
}

// 计数器
export const counter = (selector, start, end, step = 1, duration = 2000) => {
  let current = start,
    _step = (end - start) * step < 0 ? -step : step,
    timer = setInterval(() => {
      current += _step;
      document.querySelector(selector).innerHTML = current;
      if (current >= end) document.querySelector(selector).innerHTML = end;
      if (current >= end) clearInterval(timer);
    }, Math.abs(Math.floor(duration / (end - start))));
  return timer;
};

// createEventHub
export const createEventHub = () => ({
  // 生成一个空对象，该对象不继承Object.prototype的属性,比如toString这些它都不需要
  // hub的格式： { [event1]: [handler1, handler2, handler3, ...], [event2]: [], [event3]: [], ...}
  hub: Object.create(null),
  // 订阅事件，并注册回调函数handler
  on(event, handler) {
    // 如果事件不存在，创建一个event空数组
    if (!this.hub[event]) {
      this.hub[event] = [];
    }
    this.hub[event].push(handler);
  },
  // 发布事件
  emit(event, data) {
    (this.hub[event] || []).forEach(handler => handler(data));
  },
  // 取消订阅
  off(event, handler) {
    // 寻找hub[event]里是否存在这个handler
    const i = (this.hub[event] || []).findIndex(h => h === handler);
    if (i > -1) {
      // 如果存在，移除该事件所绑定的handler
      this.hub[event].splice(i, 1);
    }
  }
})


// scroll to somewhere
export const scrollToEle = element => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
  document.querySelector(element).scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

export const scrollToTop = () => {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo
    window.scrollTo(0, c - c / 8);
  }
};

// Use crypto API to generate a UUID, compliant with RFC4122 version 4.
// https://developer.mozilla.org/en-US/docs/Web/API/Window/crypto
export const UUIDGeneratorBrowser = () => {
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

// runAsync
// Runs a function in a separate thread by using a Web Worker, allowing long running functions to not block the UI.
export const runAsync = fn => {
  const worker = new Worker(
    URL.createObjectURL(new Blob([`postMessage((${fn})());`]), {
      type: 'application/javascript; charset=utf-8'
    })
  );
  return new Promise((res, rej) => {
    worker.onmessage = ({ data }) => {
      res(data), worker.terminate();
    };
    worker.onerror = err => {
      rej(err), worker.terminate();
    };
  });
};