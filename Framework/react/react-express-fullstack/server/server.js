var express = require('express');
var app = express();

app.get('/users', function (req, res) {
  res.json([{
    "id": 1,
    "name": 'one'
  },{
    "id": 2,
    "name": 'two'
  }]);
});

app.listen(5000, function () {
  console.log('Example app listening on port 3000!');
});