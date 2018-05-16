const http = require('http');
const server = http.createServer((req, res) => {
  res.end('Hello World');
})
server.listen(3000);