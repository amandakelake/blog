const http = require('http');
const counter = 0;

http.createServer((req, res) => {
  counter++;
  res.write(`I have been assessed ${counter} times.`)
}).listen(3000);
