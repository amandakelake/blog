'use strict';

const express = require('express');

// 注意这里，官方是8080端口和0.0.0.0地址，但很多人的8080端口可能已经被占用了
// 所以直接改为最通用的3000端口和127.0.0.1地址即可
const PORT = 3000;
const HOST = '127.0.0.1';

const app = express();
app.get('/', (req, res) => {
  res.send('I am Docker-node-app');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);