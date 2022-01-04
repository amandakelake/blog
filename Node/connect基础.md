# Node connect
#Front-End/js/Node/NodeInAction

[深入浅出Node.js（七）：Connect模块解析（之一）](http://www.infoq.com/cn/articles/nodejs-connect-module)

## 一、简单的connect程序

Connect是第三方模块，不存在Node的默认安装之列，需要自行安装
```
npm install connect
```

最简单的connect程序
```js
const connect = require('connect');
const app = connect();
app.listen(3000);
```

加上两个中间件
```js
const connect = require('connect');

function logger(req, res, next) {
  console.log('%s $s', req.method, req.url);
  next()
}

// hello中没有next回调，因为这个组件结束了HTTP响应，所以不需要把控制器交回给分派器
function hello(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hello world');
}

connect().use(logger).use(hello).listen(3000);
```

## 中间件的顺序
当一个组件不调用`next()`时，命令链中的后续中间件用于不会被调用

试想下做用户认证的时候
```js
connect()
  .use(logger)
  .use(authConfirm)
  .use(serviceStatic)
  .use(hello);
```

当用户通不过`authConfirm`认证的时候，用于不会调用`next()`，那么自然就进不去下一步

## 挂载
connect中有一个挂载的概念，可以给中间件或者整个程序定义一个路径前缀，除了为根路径重写请求，更厉害的是只对路径前缀（挂载点）内的请求调用中间件或者程序，为认证、管理、路由分割、错误处理打下了基础

## 错误处理
connect按照常规中间件的规则实现了一种用来处理错误的中间件变体，除了请求和响应对象，还接受一个错误对象作为参数

### 1、默认错误处理器
connect给出的默认错误响应是500，包含文本‘Internal Server Eoore’和错误自身相信信息的响应主体
### 2、自行处理程序错误
错误处理中间件函数必须接受四个参数
err、req、res、next

```js
function errorHandler() {
  var env = process.env.NODE_ENV || 'development';
  return function(err, req, res, next) {
    res.statusCode = 500;
    switch (env) {
      case 'development':
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
        break;
      default:
        res.end('Server error');
    }
  }
}
```

