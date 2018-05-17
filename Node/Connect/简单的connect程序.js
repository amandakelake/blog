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


// 认证
connect()
  .use(logger)
  .use(authConfirm)
  .use(serviceStatic)
  .use(hello);