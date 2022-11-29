# 【CI/CD】虚拟机搭建Jenkins+Docker+Github环境，实现自动部署

## 机器准备
首先我们得准备一台Linux机器，可以是云服务器，也可以是本地虚拟机，甚至你Mac本机都可以（不建议）

建议用本地虚拟机，Mac用户可以参考 [玩转Vagrant -> 榨干Mac Pro的32G内存](https://github.com/amandakelake/blog/blob/master/Engineering/vagrant.md)

## 一、 安装Jenkins、初始配置

> 如果以root用户登录，下面的操作全部不需要sudo，我是以vagrant用户登录，所以默认加sudo

[Linux — Jenkins doc](https://www.jenkins.io/doc/book/installing/linux/) 看官网的即可
```sh
sudo yum install java-11-openjdk # 安装java
sudo yum install jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins
```

```sh
# 查看jenkins状态，如下为成功状态
sudo systemctl status jenkins
● jenkins.service - Jenkins Continuous Integration Server
   Loaded: loaded (/usr/lib/systemd/system/jenkins.service; enabled; vendor preset: disabled)
   Active: active (running) since Tue 2022-11-22 12:18:30 UTC; 8s ago
 Main PID: 2776 (java)
   CGroup: /system.slice/jenkins.service
           └─2776 /usr/bin/java -Djava.awt.headless=true -jar /usr/share/java/jenkins.war --webroot=%C/jenkins/war --httpPort=8080
```

```sh
# 如果有安装防火墙
# jenkins 默认开启8080端口，需要手动让防火墙放行8080端口，才能对外开放访问界面
sudo firewall-cmd --permanent --zone=public --add-port=8080/tcp
sudo firewall-cmd --reload
```

打开主机的浏览器访问如下地址，进入jenkins设置界面
```sh
http://your_ip_or_domain:8080
# 比如这台构建机的静态IP被设置为192.168.31.190，访问8080端口进入如下设置界面
```

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292151486.png)
按照提示往下走

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292151326.png)

坐等安装完毕
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292151153.png)

然后是注册管理员，一路往下操作即可

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292152567.png)

执行第一个任务，测试下docker，同时拉个node镜像
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292152444.png)
如果碰到docker无权限的问题，参考之前说过的
> docker的架构是C/S架构，使用docker时其实是命令**使用socket与docker的守护进程进行通信**
> 在linux中，unix socket属于root用户，因此需要root权限才能访问
> 但在docker中，提供了一个用户组的概念，可以将执行命令的用户添加到docker用户组中，就可以正常执行docker相关命令
```sh
sudo gpasswd -a jenkins docker # 在 Jenkins 中执行的终端用户做 jenkins ，所以我们只需要将 jenkins 加入到 docker 用户组即可
newgrp docker # 更新docker用户组
sudo service docker restart # 重启docker，退出当前用户重新登录即可
sudo service jenkins restart # 重启jenkins
```

如无意外，构建成功
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292153552.png)

到此为止，构建机的初始化、docker、jenkins的基础配置都已经完成了，下面配置一下node和git仓库

## 二、 Jenkins安装Node插件
可以选择在系统层面安装node，也可以直接在jenkins里进行安装，这里选择jenkins插件的方式
* 系统管理 -> 插件管理 -> 可选插件 -> 搜索node -> 立即安装
* 系统管理 -> 全局工具配置 -> NodeJs -> 选择对应版本
* 进入具体项目配置 -> 构建环境 -> 勾上`Provide Node & npm bin/ folder to PATH` -> 应用/保存

如果需要不同版本的node，建议通过`nvm`、 `n`等管理工具在系统上安装需要的node版本，或者通过docker拉取node镜像
```sh
# 下载nvm
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | zsh

# 将nvm添加到环境变量
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

# instal node
nvm install 16.18.1

# install yarn
npm install --global yarn 
```

> 注意：如果node、yarn等是在当前vagrant用户安装的，切到 jenkins用户会报`command not found`，所以更好的办法还是通过docker拉取镜像

## 三、配置SSH协议，Jenkins访问Git repo
在Github/Gitlab/Gitee上准备一个真实仓库
> 我准备了一个 [vite+vue3 — Github](https://github.com/amandakelake/cicd-fe)

SSH配置
* 在Github配置公钥
* 在Jenkins使用私钥与git进行身份校验
```sh
# 由于Jenkins用的是jenkins用户, 所以需要先切换用户再生成
sudo su -s /bin/zsh jenkins
# 在构建机上生成公钥私钥
ssh-keygen -t rsa -C "lguangcong@163.com" # 换成自己邮箱
```

在Github配置公钥
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292153118.png)


在Jenkins中，私钥密码等认证信息都是以**凭证**的方式管理的，可以做到全局通用，在配置具体任务时，添加自己的凭证即可
* 项目配置 -> 源码管理 -> Git -> Credentials , 一步步操作即可
  
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292153747.png)

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292153455.png)

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292153320.png)

这一步特别注意：复制私钥包含开头的 `BEGIN OPENSSH PRIVATE KEY` 和结尾的 `END OPENSSH PRIVATE KEY`

如果填完凭证后，还是获取失败，可以在服务器上执行以下命令，提前拉取一下git仓库
```sh
# 将github.com添加到 known_hosts 里
git ls-remote -h git@github.com:amandakelake/cicd-fe.git HEAD
```

## 四、Jenkins构建镜像、推送到Docker Hub

先来尝试一下构建docker镜像

#### 4.1 构建镜像
目录中添加`Dockerfile`文件，并添加如下内容
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

在`package.json`添加`docker:build`命令，利用最新Tag作为docker构建镜像的Tag
```json
{
  "scripts": {
    "docker:build": "docker build -t luogc/cicd-fe:$(git describe --tags `git rev-list --tags --max-count=1`) .", 
      "docker:run": "docker run -d -p 8001:80 luogc/cicd-fe:$(git describe --tags `git rev-list --tags --max-count=1`)"
  }
}
```

> `git describe --tags $(git rev-list --tags --max-count=1)` 命令可用于获取最新 git tag ，得到如`v0.0.1`的结果
>
> `docker:run`命令可用于本地查看效果，这里docker内部80端口对外映射到8001端口，访问`http://localhost:8001`可看到效果

下面尝试一下在Jenkins上执行`docker:build`命令，将上面的命令复制到项目配置的执行shell，保存后触发一下构建，如无意外会得到`Finished: SUCCESS`结果
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292153157.png)

#### 4.2 镜像推送
接下来试一下镜像推送，这里我们直接使用 [Docker Hub](https://hub.docker.com/) 来推送管理镜像库
> 企业出于安全考虑，会构建专属的私有镜像库，常用平台有`Nexus，Jfrog，Harbor`，感兴趣的可自行搭建试试，反正也就是用vagrant整多一台虚拟机出来

先在 [Docker Hub](https://hub.docker.com/) 注册账号然后生成access token
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292154921.png)

```sh
# luogc的token
dckr_pat_CStim7jIMH0qgwKMbCM7KQorjro
```

拿到token后到虚拟机上尝试一下登录 `docker login -u [username]`
```sh
# 如无意外 -> Login Succeeded
docker login -u luogc
Password:
WARNING! Your password will be stored unencrypted in /home/vagrant/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
```

先在宿主机本地试一下最简单的推送 `docker`
```sh
docker login # 本地也先登录一下
# 默认推送到Docker Hub
docker push luogc/cicd-fe:v0.0.3
```

> 推送Docker Hub速度很慢，很有可能失败，失败会尝试多次重传，这一步失败也没关系

> 这时候，自建镜像仓库就比较有必要性了，不单单是安全，速度和成功率也很重要

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292154643.png)


现在来试一下Jenkins的推送，首先要解决的是凭证问题
虽然可以在shell里直接 `docker login -u "用户名" -p "密码"` 用明文账号和密码来登录，但肯定不安全，所以还是要利用Jenkins的凭据功能，先用上面创建的token新建一个凭据

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292154098.png)

然后找到项目配置里的构建环境 -> `Use secret text(s) or file(s)` -> `Username and password (separated)`，用刚才添加的凭据，再给用户名和密码分别起两个名字`DOCKER_HUB_LOGIN_USERNAME`和`	DOCKER_HUB_LOGIN_PASSWORD`，相当于两个隐私的全局变量

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292154339.png)

把这两个变量直接套到`docker login -u "用户名" -p "密码"`
```sh
docker login -u $DOCKER_HUB_LOGIN_USERNAME -p $DOCKER_HUB_LOGIN_PASSWORD
```

Jenkins测试一下构建，在控制台看到下面的输出那就是成功了
```sh
+ docker login -u **** -p ****
WARNING! Using --password via the CLI is insecure. Use --password-stdin.
WARNING! Your password will be stored unencrypted in /var/lib/jenkins/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
Finished: SUCCESS
```

下面把这三条命令结合起来，让Jenkins完整的跑一圈看看（最终推送失败没关系，主要是想看看能不能跑通整个流程）
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292154960.png)
```sh
docker login -u $DOCKER_HUB_LOGIN_USERNAME -p $DOCKER_HUB_LOGIN_PASSWORD
docker build -t luogc/cicd-fe:$(git describe --tags `git rev-list --tags --max-count=1`) .
docker push luogc/cicd-fe:$(git describe --tags `git rev-list --tags --max-count=1`)
```

如果推送成功，能在Docker Hub看到对应的镜像
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292154331.png)

## 结语
本文完成了Jenkins安装配置、构建推送docker镜像推送的流程，其实就是DevOps概念里的CI（持续集成）这一部分的内容

还没有涉及到后面的CD（持续部署）部分，现在很多大公司都用Kubernetes来进行持续部署（当然，K8S的强大之处并不仅限于部署）

想了解更多Kubernetes的内容，可以从 [Kubernetes】集群搭建](https://github.com/amandakelake/blog/blob/master/Engineering/docker/k8s.md) 开始
