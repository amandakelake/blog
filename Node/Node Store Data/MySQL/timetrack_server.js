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