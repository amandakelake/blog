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