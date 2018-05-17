# Node web服务器
#Front-End/js/Node


## 最简单的HTTP服务器
```js
const http = require('http');
const server = http.createServer((req, res) => {
  res.end('Hello World');
})
server.listen(3000);
```

## 静态文件服务器
```js
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
})

server.listen(3000);

```

## HTTPS服务器
HTTPS把HTTP和TLS/SSL传输层结合到一起，数据经过加密，难以窃听

在Node里面使用HTTPS，需要**一个私钥**+**一份证书**

### 一、私钥
私钥：本质上是个密钥，可以用来解密客户端发给服务器的数据，存放在服务器的一个文件里，不可信用户无法访问

如何生成私钥？
输入下面的命令行，openssl在安装node的时候已经装好了
```
openssl genrsa 1024 > key.pem
```

```
▶ openssl genrsa 1024 > key.pem
Generating RSA private key, 1024 bit long modulus
..............++++++
...................++++++
e is 65537 (0x10001)
```


### 二、证书
证书可以分享，包含了公钥和证书持有者的信息
公钥用来加密从客户端发往服务器的数据

如何创建证书？
创建证书需要私钥，已经有了

输入如下命令行
```
openssl req -x509 -new -key key.pem > key-cert.pem
```
会有一些问题，关于证书信息的，直接输入即可，如下所示
```
▶ openssl req -x509 -new -key key.pem > key-cert.pem
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) []:ZH
State or Province Name (full name) []:GD
Locality Name (eg, city) []:GZ
Organization Name (eg, company) []:personal
Organizational Unit Name (eg, section) []:personal
Common Name (eg, fully qualified host name) []:personal
Email Address []: ******@qq.com
```

到目前为止，当前目录下已经有了`key.pem`和`key-cert.pem`两份文件，私钥最好放到`~/.ssh`目录

不过这里是为了本地开发和测试，就留在本地吧，跑程序会显示警告信息
如果要把网址部署到公网上，就应该找个证书颁发机构（CA）进行注册，获取真实、受信的证书。

### 三、配置HTTPS服务器
```js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./key-cert.pem')
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello https');
}).listen(3000);
```
