# Docker基础
#develop/Docker

## 一、核心
docker通过内核虚拟化技术（namespace及cgroups等）来提供容器的资源隔离与安全保障等，由于docker通过操作系统层的虚拟化实现隔离，所以docker容器在运行时，不需要类似虚拟机额外的操作系统开销，提供资源利用率

[image:697A502C-1496-42B3-8139-400F64F14325-7627-000033BF6B365025/6658B42F-4B1A-4679-B7C5-43BD774F04D7.png]

Docker 容器本质上是宿主机上的一个进程。Docker 通过 namespace 实现了资源隔离，通过 cgroups 实现了资源的限制，通过写时复制机制（copy-on-write）实现了高效的文件操作。

Docker有五个命名空间：进程、网络、挂载、宿主和共享内存，为了隔离有问题的应用，Docker运用Namespace将进程隔离，为进程或进程组创建已隔离的运行空间，为进程提供不同的命名空间视图。这样，每一个隔离出来的进程组，对外就表现为一个container(容器)。需要注意的是，Docker让用户误以为自己占据了全部资源，但这并不是”虚拟机”

## Docker组件：镜像、容器、仓库

### 镜像
一个只读层被称为镜像，一个镜像是永久不会变的，也是无状态的
Docker 使用一个统一文件系统，Docker 进程认为整个文件系统是以读写方式挂载的
[image:6002670C-182C-4327-8711-2AFACA3AB53F-7627-0000343561DF9BD4/5D285CCD-2173-449B-873A-73CB70157806.png]
每一个镜像都可能依赖于由一个或多个下层的组成的另一个镜像。我们有时说，下层那个 镜像是上层镜像的父镜像，一个镜像不能超过 127 层

### 容器
容器是从镜像创建的运行实例。
它可以被启动、开始、停止、删除。
每个容器都是相互隔离的、保证安全的平台。可以把容器看做是一个简易版的 Linux 环境，Docker 利用容器来运行应用。
镜像是只读的，容器在启动的时候创建一层可写层作为最上层。

### 仓库
仓库是集中存放镜像文件的场所，仓库注册服务器（Registry）上往往存放着多个仓库，每个仓库中又包含了多个镜像，每个镜像有不同的标签（tag）


## 试运行一个web应用（容器使用）
载入一个镜像（一个 Python Flask 应用）
[image:85CBEB25-95F3-4D2C-AE9E-419FC453B8E5-7627-000035A836E867C0/1623BCBF-5615-4622-BF8F-AFAE848140C6.png]

运行应用 -d让容器在后台运行 -P: 将容器内部的网络端口映射到我们使用的主机上
```
docker run -d -P training/webapp python app.py
```

然后用`docker ps`来查看
[image:E9B4F174-05C2-4DCD-AA8E-9663A81676AD-7627-000035E233662509/AD91F5DE-E467-4BD1-B188-E41633734B5F.png]
`docker container ls`也可查看正在运行的容器

Docker 开放了 5000 端口（默认 Python Flask 端口）映射到主机端口 32769 上。
这时我们可以通过浏览器`http://localhost:32768/`访问
[image:653C0599-7878-4E3B-B728-CC3902C94CBC-7627-000035F49FDD8599/E1F04287-A5A8-4C51-9140-AA335382988F.png]

也可以指定 -p 标识来绑定指定端口
```
docker run -d -p 5000:5000 training/webapp python app.py
```

`docker stop ID`停止web应用容器
`docker start ID`重新开启
`docker rm ID`删除容器

## 镜像使用
当运行容器时，使用的镜像如果在本地中不存在，docker 就会自动从 docker 镜像仓库中下载，默认是从 [Docker Hub]( https://hub.docker.com/) 公共镜像源下载。

`docker images ` 列出本地主机上的镜像
[image:1F8723D8-4EA9-4ABD-9A3F-2B55CECF8026-7627-00003662D02C6B1A/DE473578-5B44-4999-82FE-D28067D0E14B.png]
* REPOSITORY：表示镜像的仓库源
* TAG：镜像的标签(表示不同版本)
* IMAGE ID：镜像ID
* CREATED：镜像创建时间
* SIZE：镜像大小


`docker search [Name]`搜索镜像
`docker pull [Name]`下载镜像
`docker run [Name]`运行镜像

`docker build`构建镜像（需要创建文件）


## 容器链接
### 1、网络端口映射
* -P :是容器内部端口随机映射到主机的高端口
* -p : 是容器内部端口绑定到指定的主机端口
```
docker run -d -p 5000:5000 training/webapp python app.py
```
默认都是绑定 tcp 端口，如果要绑定 UDP 端口，可以在端口后面加上 /udp
```
docker run -d -p 127.0.0.1:5000:5000/udp training/webapp python app.py
```
`docker port`快速查看端口绑定情况

### docker连接系统-创建父子关系
当我们创建一个容器的时候，docker会自动对它进行命名
我们也可以使用--name标识来命名容器
```
docker run -d -P --name runoob training/webapp python app.py
```
