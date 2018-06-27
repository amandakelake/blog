# Express + create-react-app 快速构建前后端开发环境

## 一、快速构建react app
上官网全局安装create-react-app
[GitHub - facebook/create-react-app: Create React apps with no build configuration.](https://github.com/facebook/create-react-app)

```
npx create-react-app react-express-fullstack
cd react-express-fullstack
yarn start
```
这时候访问`http://localhost:3000/`可以正常访问

![](https://github.com/amandakelake/blog/blob/master/assets/react/1.png)

## 二、配合 Express 构建 server 端应用
创建一个叫server的文件夹，并初始化 `package.json`文件
```
mkdir server && cd server
yarn init
```

安装几个必备依赖
```
yarn add express body-parser nodemon babel-cli babel-preset-es2015
```
body-parser用于解析post请求
nodemon检测node.js 改动并自动重启，适用于开发阶段
babel相关的都是为了用ES6进行开发

在`package.json`文件增加如下命令
```json
  "scripts": {
    "start": "nodemon --exec babel-node -- ./server.js",
    "build": "babel ./server.js --out-file server-compiled.js",
    "serve": "node server-compiled.js"
  }
```

在上面的react app中会启动一个静态资源服务器
那么server这边的服务器要怎么启动呢？
同时开两个服务器也是可以的，但我想一条命令跑两个本地服务器的时候怎么做呢？

回去修改react app的`package.json`文件，它原来有这样的一段代码
```json
"scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  }
```
我们主要修改一下`start`和`build`，也就是把server端的命令合并进来即可

先安装一个依赖包`concurrently`，作用是同时执行多条命令
```json
"start": "concurrently 'react-scripts start' 'cd server && yarn start'"
```
```json
"build": "concurrently 'react-scripts build' 'cd server && yarn build'"
```

这时，我们只要执行`yarn start`会同步启动 `webpack` 以及 `server`文件夹下的 `nodeman`

在`server`目录下新建`server.js`文件，并写入如下代码
```js
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
```
注意这里的5000，是本地服务器的端口

然后，在react app项目的`package.json`文件中写入如下代码，设置项目的请求代理 => server的5000端口
```
"proxy": "http://127.0.0.1:5000"
```

改下`src/app.js`文件，请求`users`接口
```js
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  state = {
    users: []
  }

  componentDidMount() {
    fetch('/users')
      .then(res => res.json())
      .then(users => this.setState({ users }));
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        {this.state.users.map(user => {
          return <div key={user.id}>{user.name}</div>
        })}
      </div>
    );
  }
}

export default App;
```

如果请求到users数据，说明请求成功了

![](https://github.com/amandakelake/blog/blob/master/assets/react/2.png)