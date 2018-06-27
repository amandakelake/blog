class Router {
  constructor() {
    this.routes = {};
    this.currentUrl = '';
  }

  // routes 用来存放不同路由对应的回调函数
  route(path, callback) {
    this.routes[path] = callback || function() {};
  }

  updateView() {
    this.currentUrl = location.hash.slice(1) || '/';
    // 如果存在该路径，则执行该路径对应的回调函数
    this.routes[this.currentUrl] && this.routes[this.currentUrl]();
    // 对应下面的html文件的routes如下
    // {
    //   '/': () => {
    //     document.getElementById('content').innerHTML = 'Home';
    //   },
    //   '/about': () => {
    //     document.getElementById('content').innerHTML = 'About';
    //   },
    //   '/topics': () => {
    //     document.getElementById('content').innerHTML = 'Topics';
    //   }
    // }
  }

  // init 用来初始化路由，在 load 事件发生后刷新页面，
  // 并且绑定 hashchange 事件，当 hash 值改变时触发对应回调函数
  init() {
    window.addEventListener('load', this.updateView.bind(this), false);
    window.addEventListener('hashchange', this.updateView.bind(this), false);
  }
}