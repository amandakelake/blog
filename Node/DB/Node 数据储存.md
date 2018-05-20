# Node 数据储存
#Front-End/js/Node/NodeInAction

DBMS：数据库管理系统

## 储存机制选择
1、无服务器的数据储存

2、关系型数据库管理系统：MySQL、PostgresSQL

3、NoSQL数据库：Redis、MongoDB、Mongoose


## 一、无服务器的数据储存
1、内存储存

2、基于文件的储存

### 1、内存储存
使用变量储存数据
但是，一旦服务器和程序重启后，数据就丢失了
```js
const http = require('http');
const counter = 0;

http.createServer((req, res) => {
  counter++;
  res.write(`I have been assessed ${counter} times.`)
}).listen(3000);
```


### 2、基于文件的储存
可以做数据的持久化保存，经常用来储存程序的配置信息，服务器和程序重启后依然有效

并发问题：如果程序有多个用户同时读写该文件，可能会出现并发问题
所以数据库管理系统是更合理的选择


## 二、关系型数据库管理系统（RDBMS）
这里只记录了MySQL的基本操作

#### 1、安装 MySQL Node模块
```
npm install mysql
```

#### 2、创建服务器程序逻辑（服务器+基本的路由逻辑+连接上数据库）
```js
const http = require('http');
const work = require('./timetrack');
const mysql = require('mysql');

// 连接MySQL
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '123456',
  database: 'timetrack'
});

// HTTP 请求路由
const server = http.createServer((req, res) => {
  switch (req.method) {
    case 'POST':
      switch (req.url) {
        case '/':
          work.add(db, req, res);
          break;
        case '/archive':
          work.archive(db, req, res);
          break;
        case '/delete':
          work.delete(db, req, res);
          break;
      }
      break;
    case 'GET':
      switch (req.url) {
        case '/':
          work.show(db, res);
          break;
        case '/archive':
          work.showArchived(db, res);
          break;
      }
      break;
  }
});
// 注意，不直接启动服务器，由数据库表来启动
// server.listen(3000);

db.query(
  "CREATE TABLE IF NOT EXISTS work (" 
  + "id INT(10) NOT NULL AUTO_INCREMENT, " 
  + "hours DECIMAL(5,2) DEFAULT 0, " 
  + "date DATE, " 
  + "archived INT(1) DEFAULT 0, " 
  + "description LONGTEXT,"
  + "PRIMARY KEY(id))",
  err => {
    if (err) {
      throw err;
    }
    console.log('Server started...');
    server.listen(3000, '127.0.0.1');
  }
)
```

#### 3、创建数据库基本操作辅助函数

详见`./Node/Node Store Data/MySQL/timetrack.js`文件

## 三、NoSQL数据库
关系型DBMS为可靠性牺牲了性能

但NoSQL数据库却把性能放在了第一位

所以，对于**实时分析**或**消息传递**而言，NoSQL可能是更好的选择

它不需要预先定义数据schema

### 1、Redis
非常适合处理那些不需要长期访问的简单数据储存，比如短信和游戏中的数据

Redis把数据存在RAM中，并在磁盘中记录数据的变化

好处：数据操作非常快

缺点：存储空间有限

如果Redis服务器崩溃，RAM的内存丢失，可以用磁盘中的日志回复数据

### 2、MongoDB
通用的非关系型数据库，使用RDBMS的那类程序都可以使用MongoDB

MongoDB把文档（document）存在集合（collection）中，数据（更多是json格式）存在document中

### 3、Mongoose
Mongoose是一个Node模块，并不是数据库，它可以让你更顺畅的使用MongoDB


## 四、总结
内存储存：极度关心速度和性能，不关系程序重启的数据持久化

文件储存：不关心性能，数据不复杂，类似命令行程序

SQL可靠严谨，性能和灵活性上欠佳

MongoDB是极佳的通用DBMS，Redis擅长处理变化频繁、相对简单的数据

例如，要构建内容管理系统
文件储存Web程序的配置选项，MongoDB储存文章，Redis储存用户的评论和文章评级


