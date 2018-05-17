const http = require('http');
const parse = require('url').parse;
const join = require('path').join;
const fs = require('fs');

const root = __dirname;

const server = http.createServer((req, res) => {
  const url = parse(req.url);
  // 构造绝对路径
  const path = join(root, url.pathname);
  // 判断文件是否存在
  fs.stat(path, (err, stat) => {
    if (err) {
      // 如果文件不存在，fs.stat()会在err.code中放入ENOENT作为响应
      if ('ENOENT' === err.code) {
        res.statusCode = 404;
        res.end('Not Found');
      } else {
        // 其他错误，返回通用错误码500
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    } else {
      // 
      res.setHeader('Content-Length', stat.size);
      let stream = fs.createReadStream(path);
      stream.pipe(res);
      stream.on('error', err => {
        res.statusCode = 500;
        res.end('Internal Server Error');
      })
    }
  })
  // 创建文件流
  // const stream = fs.createReadStream(path);
  // stream.on('data', (chunk) => {
  //   res.write(chunk);
  // })
  // stream.on('end', () => {
  //   res.end();
  // })
})

server.listen(3000);
