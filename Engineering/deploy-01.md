# Docker+Docker-compose+Nginx镜像部署前端应用及优化

> 本文假设读者有一定的docker基础

## 一、Node作为静态服务器
对于前端而言，可以直接用Node提供静态资源服务，可以通过以下三种方式返回数据
```js
// 1、组装字符串
const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>部署</title></head>
<body>hello world</body>
</html>`

const server = http.createServer((req, res) => res.end(html))
server.listen(3000, () => { console.log('Listening 3000' )})
```

```js
// 2、通过读取文件
const html = fs.readFileSync('./index.html')
const server = http.createServer((req, res) => res.end(html))
```

```js
// 3、将读取文件系统改完 ReadStream 的形式进行响应
// 可以提升静态服务器的性能
const server = http.createServer((req, res) => {
  fs.createReadStream('./index.html').pipe(res)
})
```

## 二、为什么用 Nginx + docker
其实以上就是前端开发过程中`yarn start`开启本地开发服务器的雏形，可以通过`localhost:端口号`进行访问，那么线上也可以如此部署访问吗？

当然可以，但是有几个问题
* IP+Port 的访问方式，没有直接访问域名友好
* `yarn start/npm run dev`还伴随着监听文件变动、实时编译(.ts、框架代码)以及重启服务，消耗内存以及CPU高负载，导致性能问题

前端生产环境一般采用更高性能的Nginx作为静态服务器，那为什么本文需要docker ?

用来隔离环境，假如公司就一台机器，但同时需要部署三个Node服务，分别需要不同版本的NodeJS才能运行，想想是不是头大。

Docker提供了单独的运行环境，同时与宿主机隔离，我们可以单独维护前端的nginx配置，当然，用来在本地进行学习测试，也是非常的方便

## 三、从 docker 到 docker-compose 部署简单应用
用[vite](https://cn.vitejs.dev/guide/#trying-vite-online)初始化一个vue项目
```sh
yarn create vite my-vue-app --template vue-ts
```

新建一个 `Dockerfile`文件，以下内容主要分几步
* 基于node镜像做前端构建工作
* 将构建产物移到nginx中
* 暴露端口，启动nginx
```dockerfile
# 多阶段构建
FROM node:16-alpine as builder

# 设置为工作目录，以下 RUN/CMD 命令都是在工作目录中进行执行
WORKDIR /code

# 提前将依赖移动至目录，利用docker缓存，只要ADD的内容不变，缓存就不会被破坏
ADD package.json yarn.lock ./
RUN yarn

# 全部代码添加到镜像中
COPY . ./
RUN yarn build

# 利用更小的nginx镜像
FROM nginx:alpine
COPY --from=builder /code/dist/ /usr/share/nginx/html/
# nginx 暴露 80端口
EXPOSE 80
# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
```

执行`docker build -t [name]:[tag] .`命令进行构建镜像
```sh
# 构建一个名叫 luogc/cicd-fe 的镜像
# -t 将[name]:[tag]作为镜像名称，不写tag默认是latest
docker build -t luogc/cicd-fe .

# 可通过下面命令查看构建出来的镜像
docker image ls | grep luogc/cicd-fe
```

构建命令可以重复执行，每次更改镜像名+tag，都会生成不同的镜像，可以通过``查看生成的镜像

然后基于镜像来运行容器 `docker run --rm -p [主机端口]:[容器端口] [镜像名]`
```sh
# -d 在后台运行
# --rm 当容器停止运行时，自动删除容器
# -p 端口映射，将容器的80端口映射到宿主机的8001端口，可在宿主机通过 localhost:8001访问
# 镜像名不写tag默认取 lastest
docker run --rm -d -p 8001:80 luogc/cicd-fe
```

但是每次都要敲这么多命令，除了冗余繁琐，还容易出错，比如端口、存储、环境变量等，不好维护

`docker-compose`能高效的解决问题，通过配置文件进行管理，可以理解为`webpack ->webpack.config.js`
> 除了配置文件，它更强大在于服务编排

新建一个`docker-compose.yaml`文件
```yaml
version: "3"
services:
  app:
    # build 从当前路径构建镜像，即读取当前目录下的 Dockerfile 文件
    build: .
    ports:
      - 8001:80
```

只需要以下一句命令即可替代以上构建镜像+运行容器的所有命令以及配置
```sh
# up 创建并启动容器
# --build 每次启动容器前构建镜像，依据docker-compose.yaml里面的build参数
docker-compose up --build
```

可以在docker的桌面端看到对应的容器，也可以通过`localhost:8001`进行访问
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211302107909.png)

## 四、Nginx镜像
通过上面的配置，我们成功利用Nginx镜像部署了一个简单的前端应用，现在我们来看一下Nginx容器是怎么运行的，同时试试能不能自己改改配置啥的

先忽略上面的应用部署配置，单独部署一下Nginx的默认配置看看
```sh
# -it 以交互模式运行容器并为容器重新分配一个伪输入终端
# --rm 和 -p 参数上面介绍过了
docker run -it --rm -p 8002:80 nginx:alpine
```
直接访问`localhost:8002`应该能看到Nginx的默认页面
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211302107882.png)

然后在上面的命令基础上加多一个`sh`参数，进入容器环境中
```sh
docker run -it --rm -p 8002:80 nginx:alpine sh
# 打开了一个默认终端，这就是容器的内部环境
# 注意，这种情况，在宿主机访问 localhost:8002 是无法访问的，并不是出错了
```

先找一下nginx的配置都放在哪里
```sh
which nginx # 查看nginx路径
nginx -t # 查看nginx配置文件，一般都是 /etc/nginx/nginx.conf
```
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211302107962.png)

```nginx
/ # cat /etc/nginx/nginx.conf
user  nginx;
worker_processes  auto;
error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;
events {
    worker_connections  1024;
}
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log  /var/log/nginx/access.log  main;
    sendfile        on;
    #tcp_nopush     on;
    keepalive_timeout  65;
    #gzip  on;
    include /etc/nginx/conf.d/*.conf; # 读取配置的地方
}
```

关键在最后一句`include /etc/nginx/conf.d/*.conf;`，这个目录下只有`default.conf`一个配置文件，就是它了，把多余的注释都删掉，得到以下配置
```nginx
# cat /etc/nginx/conf.d/default.conf
server {
    listen       80;
    server_name  localhost;
    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```
从配置可以得到两个重要信息
* 默认监听80端口
* 默认以`/usr/share/nginx/html`为静态资源目录

所以如果想部署前端应用，只需要把构建出来的`index.html+dist/build`放到`/usr/share/nginx/html`目录下就可以了，另外可以直接更改`/etc/nginx/conf.d/default.conf`配置来生效

再回看一下我们上面那份`Dockerfile`配置，里面有一句没写注释，现在是不是好理解很多了
```dockerfile
FROM nginx:alpine
# 将builder构建出来的前端产物，整个dist目录（里面包括index.html），一股脑扔到nginx的默认静态资源目录里
COPY --from=builder /code/dist/ /usr/share/nginx/html/
```

再看看响应的server，是nginx
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211302107713.png)

## 五、通过docker玩转Nginx配置
通过上面我们知道了怎么配置静态资源以及nginx配置，但每次都进入容器去操作，貌似有点麻烦，能否在本地进行配置，然后通过某种方式让docker读取配置生效呢？

有，`Volumn（数据卷）`可以解决这个问题，不了解的同学可以看看[数据卷 - Docker — 从入门到实践](https://yeasy.gitbook.io/docker_practice/data_management/volume)

我们来改一下 `docker-compser.yaml`配置文件，并在当前目录下新增`nginx/nginx.conf`文件
```yaml
version: "3"
services:
  app:
    build: .
    ports:
      - 8001:80
    volumes:
		# 分别挂载当前宿主机目录下的nginx/nginx.conf文件、dist目录
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./dist:/usr/share/nginx/html
```

`docker-compose up`重新启动容器即可

此时，如果修改了nginx配置，或者项目改动本地`yarn build`之后，无需重新构建镜像
`localhost:8001`端口的内容会实时更新

基于此，我们可以快速尝试nginx的一些常用配置，既不需要购买云服务器，也不需要虚拟机，更不需要更改当前主机环境的配置，只管尽情尝试即可

nginx的一些常用配置
* 配置缓存策略
* 配置CORS
* gzip/brotli
* 路由匹配 Location、rewrite、redirect等待

## 六、Docker优化：构建缓存、多阶段构建
再看一下最开始上面写的一份构建配置
其实注释里把精髓都写出来了，这里再展开聊一聊
```dockerfile
# 多阶段构建
FROM node:16-alpine as builder

# 设置为工作目录，以下 RUN/CMD 命令都是在工作目录中进行执行
WORKDIR /code

# 提前将依赖移动至目录，利用docker缓存，只要ADD的内容不变，缓存就不会被破坏
ADD package.json yarn.lock ./
RUN yarn

# 全部代码添加到镜像中
COPY . ./
RUN yarn build

# 利用更小的nginx镜像
FROM nginx:alpine
COPY --from=builder /code/dist/ /usr/share/nginx/html/
# nginx 暴露 80端口
EXPOSE 80
# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
```

初学者很简单就可以写出下面这份简版的配置
```dockerfile
FROM node:14-alpine
WORKDIR /code
ADD . /code # 直接全部复制整个项目过去
RUN yarn && npm run build # 一起执行依赖安装和构建
```

但上面的配置拆了两段，这其实是利用了 `ADD`指令：如果添加内容的`checksum`没有发生改版，则可以利用构建缓存[Best practices for writing Dockerfiles | Docker Documentation](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#leverage-build-cache)
本质上是镜像分层+镜像cache机制的结果
```dockerfile
# 提前将依赖移动至目录，利用docker缓存，只要ADD的内容不变，缓存 node_modules就不会被破坏
ADD package.json yarn.lock ./
# 如果 yarn.lock 内容没有变化，则不会重新依赖安装
RUN yarn

# 全部代码添加到镜像中，业务代码是经常变的
COPY . ./
RUN yarn build
```

构建过程也可以看到`---> Using cache`标记
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211302139722.png)

还有一段，这里用到了多阶段构建的优化
```dockerfile
FROM nginx:alpine
COPY --from=builder /code/dist/ /usr/share/nginx/html/
```

首先我们构建的目标是生成dist目录里面的静态资源，但应用最后运行并不需要node环境，而且node的镜像比nginx镜像要大很多，所以利用node完成构建输出产物后，完全可以退出舞台，将产物交给nginx即可

所以整个配置可以分为两段
* 阶段一：Node镜像构建应用，生产静态资源
* 阶段二：Nginx镜像对上一阶段的产物进行服务化

