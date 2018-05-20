# 快速上手node+express+MongoDB


## 一、Node+Express
[Express - Node.js web application framework](https://expressjs.com/)
能快速搭建hello world即可

* app.get、app.post分别开发get和post接口
* app.use使用模块
* res.send、res.json、res.sendfile响应不同的内容

## 二、nodemon（自动重启，类似热更新）
```
npm install -g nodemon
```

### 三、MongoDB

具体操作可以看前面写的这篇

[mongoDB基础](https://github.com/amandakelake/blog/blob/master/Node/DB/MongoDB%E5%9F%BA%E7%A1%80.md)


## 四、mongoose：操作MangoDB

安装mongoose，操作json
```
npm install mongoose --save
```

然后在前面的Express生成器生成的项目中的`app.js`文件加入如下代码
```js
var mongoose = require('mongoose');

// 这里会自动连接test数据库，如果没有则会自动创建
mongoose.connect('mongodb://localhost/test');
var Cat = mongoose.model('Cat', {
  name: String,
  friends: [String],
  age: Number,
});
var kitty = new Cat({ name: 'Zildjian', friends: ['tom', 'jerry']});
kitty.age = 3;
kitty.save(function (err) {
  if (err) // ...
  console.log('meow');
});
```

在上面关于[mongoDB基础](https://github.com/amandakelake/blog/blob/master/Node/DB/MongoDB%E5%9F%BA%E7%A1%80.md)的教程中启动MongoDB
然后在express项目中启动app `set DEBUG=myapp:* & npm start`
mongodb启动的那个命令终端会显示连接
```
2018-05-20T16:34:00.024+0800 I NETWORK  [listener] connection accepted from 127.0.0.1:64736 #3 (2 connections now open)
```

再回到mongo的操作终端，`show collections`会看到`cats`
再执行`db.cats.find().pretty()`就能看到对应的数据了