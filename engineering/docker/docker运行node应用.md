# Docker 运行Node.js应用
#Front-End/js/Node

[Dockerizing a Node.js web app | Node.js](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 一、创建node-app
```
mkdir docker-node-app
cd docker-node-app
touch package.json
```

`package.json`文件内容
```
{
  "name": "docker_web_app",
  "version": "1.0.0",
  "description": "Node.js on Docker",
  "author": "First Last <first.last@example.com>",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.16.1"
  }
}
```

安装依赖
```
npm install
```

新建`server.js`文件
```
touch server.js
```

`server.js`文件内容
```js
'use strict';

const express = require('express');

// 官方用的是0.0.0.0地址，指通配地址，我改了下
// 127.0.0.1地址代表本地地址，也就是localhost,一般是测试所用
const PORT = 8080;
const HOST = '127.0.0.1';

const app = express();
app.get('/', (req, res) => {
  res.send('I am Docker-node-app');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
```

试跑一下
```
▶ node server.js
Running on http://127.0.0.1:3000
```

浏览器打开`http://127.0.0.1:3000`应该能看到`I am Docker-node-app`

## 二、Creating a `Dockerfile`
```
touch Dockerfile
```

编辑`Dockerfile`配置文件
```
# 使用最新的LTS node版本，将会从Docker Hub上面拉取这个版本
FROM node:carbon

# 定义项目要上传的容器位置，也就是我们这个项目要放到那个容器中
WORKDIR /ndoe/app

# 需要使用npm  所以复制一发
# npm 从版本4以上会生成package-lock.json文件
COPY package*.json ./

# 运行安装指令
RUN npm install

# 复制当前app目录文件到上面定义的目录WORKDIR中
# Bundle app source
COPY . .

# 对外开放端口，让外部可以访问容器内的app
EXPOSE 8080

# 启动App, 两条命令其实一样的
# CMD ["node", "server.js"]
CMD ["npm", "start"]
```

## 三、`.dockerignore` file
类似`.gitignore`文件，排除某些文件
这些文件就不会被添加到镜像中去
```
node_modules
npm-debug.log
```

## 四、构建镜像
在有`Dockerfile`的目录，也就是当前目录下，使用如下命令构建镜像
注意最后有个小点点，不要漏了
```
docker build -t <your username>/<appname> .
```

比如我的是这样的（注意这个<your username>/<appname> 下面是会用到的，不然最后访问端口的时候会失败）
```
docker build -t lgc/docker-node-app-image .
```

等待docker拉取和执行，看到`successful`字眼，就是成功了


## 五、运行镜像
-d : 后台运行
-P 3000:3000 ：将容器中的3000端口映射到外部的3000端口
`—name <appname>`  给该容器命名
`lgc/docker-node-app-image`  前面构建镜像时定义的名字

我的是这样的
```
docker run -d --name docker-node-app -p 3000:3000 lgc/docker-node-app-image
```

然后浏览器输入`http://127.0.0.1:3000/`即可访问了