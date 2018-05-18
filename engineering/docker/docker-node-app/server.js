'use strict';

const express = require('express');

// 官方用的是0.0.0.0地址，指通配地址
// 127.0.0.1地址代表本地地址，也就是localhost,一般是测试所用
const PORT = 8080;
const HOST = '127.0.0.1';

const app = express();
app.get('/', (req, res) => {
  res.send('I am Docker-node-app');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);