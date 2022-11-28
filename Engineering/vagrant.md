# 玩转Vagrant -> 榨干Mac Pro的32G内存

## 简介
[Vagrant](https://developer.hashicorp.com/vagrant) 是用来管理虚拟机的命令行工具，通过文件来隔离管理不同虚拟机的完整生命周期以及各项参数，是个抽象层次更高的虚拟环境配置工具

说直白点，它能方便快速的创建系统级别的沙盒环境，而且快速、免费
* 完整的linux系统，相对于ssh到远程服务器，本地快速、安全
* 也不用每年给阿里云上贡

## 基础使用
```bash
# 先自行安装 virtual box

# 安装 vagrant
brew install vagrant

# 创建虚拟机
# 只是在当前目录创建一份Vagrantfile作为配置文件
vagrant init centos/7

# 根据配置文件创建虚拟机系统环境
vagrant up

# 通过ssh登录虚拟机
vagrant ssh
```

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211281511261.png)

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211281512375.png)

打开virtual box软件能看到有一台虚拟机在运行，就这么简单，你就拥有了一台属于自己的本地虚拟机

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211281512853.png)

## 虚拟机镜像
vagrant创建虚拟机时需要指定一个镜像，也就是**box**
比如上面的命令`vagrant init centos/7`，当前环境不存在`centos/7`这个box，所以vagrant会先从网上下载，具体box可以从这个[镜像网站](https://app.vagrantup.com/boxes/search) 搜索

通过`vagrant box -h`可以查看具体的操作命令
```sh
> vagrant box -h
Usage: vagrant box <subcommand> [<args>]

Available subcommands:
     add
     list
     outdated
     prune
     remove
     repackage
     update

For help on any individual subcommand run `vagrant box <subcommand> -h`
        --[no-]color                 Enable or disable color output
        --machine-readable           Enable machine readable output
    -v, --version                    Display Vagrant version
        --debug                      Enable debug output
        --timestamp                  Enable timestamps on log output
        --debug-timestamp            Enable debug output with timestamps
        --no-tty                     Enable non-interactive output
```


## 虚拟机的登录与用户权限
创建完虚拟机后，可以通过`vagrant ssh` 以`vagrant`用户登录虚拟机，用户和密码都是`vagrant`

`root`用户不能直接登录，也没有默认密码，可以通过`sudo su -i`切换到`root`用户，或者在命令前加`sudo`

如果不想使用`root`用户，也可以通过添加用户组来解决权限相关的问题

#### docker的权限问题
docker的架构是C/S架构，使用docker时其实是命令**使用socket与docker的守护进程进行通信**
在linux中，unix socket属于root用户，因此需要root权限才能访问

但在docker中，提供了一个用户组的概念，可以将执行命令的用户添加到docker用户组中，就可以正常执行docker相关命令
```sh
sudo groupadd docker # 增加 docker 组
sudo gpasswd -a vagrant docker # 将当前用户 vagrant 添加到 docker 组里
newgrp docker # 更新docker用户组
sudo service docker restart # 重启docker，退出当前用户重新登录即可
exit
```
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211281512519.png)


## 预设配置  Vagrantfile

如果单单只是创建了一台虚拟机，肯定还达不到开发机的需要，还有很多的基础软件和一些需求软件

以安装 Docker为例，大概率要手动执行以下命令
```sh
# 一、安装yum、以及linux下一些常用软件
yum update
yum install epel-release -y
yum clean all
yum list
yum install wget curl git vim iptables-services net-tools lsof

# 二、安装docker  [Install Docker Engine on CentOS](https://docs.docker.com/engine/install/centos/) 
# 2.1 Uninstall old versions
sudo yum remove docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine
# 2.2 Set up the repository
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
# 2.3 Install Docker Engine
sudo yum install docker-ce docker-ce-cli containerd.io
# 2.4 Start Docker
sudo systemctl start docker
```

如果每次初始化虚拟机，都要这么来一次，那效率可太低了，vagrant最强大最好玩的特性之一**Vagrantfile**应运而生

初始化虚拟机系统后，会在当前目录生成一个Vagrantfile文件，可自定义编辑，这点跟docker对应的`Dockerfile`一样，里面的配置都比较直白，比较容易理解，也可以参考一下现成的配置文件 [Discover Vagrant Boxes - Vagrant Cloud](https://app.vagrantup.com/boxes/search)

比如上面手动安装docker的命令，就可以将shell命令直接内置进去，然后`vagrant reload`
```bash
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  config.vm.box = "centos/7"

  # Enable provisioning with a shell script. Additional provisioners such as
  # Ansible, Chef, Docker, Puppet and Salt are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell", inline: <<-SHELL
    yum update
    yum install epel-release -y
    yum clean all
    yum list
    # 也可以不装
    yum install -y wget curl git vim iptables-services net-tools lsof

    # Uninstall old versions
    sudo yum remove docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine

    # Set up the repository
    sudo yum install -y yum-utils
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

    # Install Docker Engine 
    sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Start Docker
    sudo systemctl start docker
  SHELL
end
```

但如果碰到一些需要询问权限的命令会直接退出，导致安装失败
可以在安装时加上 `-y`命令
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211281513629.png)

编写配置后，可通过`vagrant validate`来校验是否写的有问题

## Vagrantfile常用配置

首先退出虚拟机，更改完Vagrantfile配置后，运行`vagrant reload`来应用最新配置

#### OS、内存配置

以下配置可设置虚拟机的CPU核数以及内存大小
```ruby
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "4096"
    vb.cpus = "4"
  end
```

#### 网络配置

[Networking | Vagrant | HashiCorp Developer](https://developer.hashicorp.com/vagrant/docs/networking)

虚拟机网络有常用三种类型
* NAT映射：把物理机作为为路由器进行上网 （本地开发常用）
* host-only：只能与物理机相连
* 桥接网络：通过使用物理机网卡 具有单独ip （当做远程服务器来使用）

vagrant默认为NAT映射，虚拟机内部表现为私有网络，主机发现不了虚拟机，需要配置端口映射
```ruby
# 虚拟机的80端口被映射为主机的8080端口
config.vm.network "forwarded_port", guest: 80, host: 8080
```
这时可在主机上通过 `localhost:8080`来访问虚拟机的80端口

第二种host-only，配置如下
```ruby
config.vm.network "private_network", ip: "192.168.11.111"
```
虚拟网络是一个全封闭的网络，它唯一能够访问的就是主机，
虚拟机和主机可互相访问，但虚拟机无法访问外网
Host-Only的宗旨就是建立一个与外界隔绝的内部网络，来提高内网的安全性，一般是大型服务商才会使用

而第三种方式，桥接网络，vagrant配置如下
```ruby
config.vm.network "public_network" # DHCP获取ip
config.vm.network "public_network", ip: "192.168.0.17" # 静态ip
config.vm.network "public_network", bridge: "en1: Wi-Fi (AirPort)" # 指定桥接网卡
```
虚拟机就像局域网中一台独立的主机，但需要占用同一网段的一个IP地址

#### 主机名
```ruby
config.vm.host = "server-01"
```
主机名不仅用于网络，当有多台虚拟机时，也用来标记区分不同的虚拟机。

#### 共享文件夹
```ruby
config.vm.synced_folder "src/", "/srv/website"
```
第一个参数是主机真实目录，第二个是虚拟机目录，可共享主机的目录

## 上传本地box到vagrant cloud (开源)

在本地可通过`vagrant package`创建自己的box，会在当前目录下生成一份`[name].box`文件
```sh
# 基于当前虚拟机配置，创建新的box
vagrant package --output [name]
```

更多配置可通过`vagrant package -h`查看
```sh
  vagrant package -h
Usage: vagrant package [options] [name|id]

Options:

        --base NAME                  Name of a VM in VirtualBox to package as a base box (VirtualBox Only)
        --output NAME                Name of the file to output
        --include FILE,FILE..        Comma separated additional files to package with the box
        --info FILE                  Path to a custom info.json file containing additional box information
        --vagrantfile FILE           Vagrantfile to package with the box
        --[no-]color                 Enable or disable color output
        --machine-readable           Enable machine readable output
    -v, --version                    Display Vagrant version
        --debug                      Enable debug output
        --timestamp                  Enable timestamps on log output
        --debug-timestamp            Enable debug output with timestamps
        --no-tty                     Enable non-interactive output
    -h, --help                       Print this help
```

创建完box后，在 [Vagrant Cloud](https://app.vagrantup.com/account/new) 先注册自己的账号，并登录，然后选择`Create a new Vagrant box`，跟着操作傻瓜式操作，并上传本地的 `[name].box`文件

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211281513016.png)

然后就可以通过下面命令进行开源box的使用了
```sh
vagrant init amandakelake/centos7-docker-test
vagrant up
```
是不是跟docker使用image很像 ？

## 进阶 — 插件
说到插件，开发同学都不陌生了

vagrant提供了插件功能，允许用户自行打造自己的装备库

可以来这里查找需要的插件 [A list of plugins for Vagrant](https://vagrant-lists.github.io/#plugins)

## 分布式集群环境
在开发分布式应用时，本地环境往往需要多个虚拟机用于测试，而这，才是vagrant大展神威的时候，可以通过配置文件直接定义多个主机配置

下面是个简单的例子
> 虽然是ruby语法写的，但不复杂
```yaml
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.define "k8s-01" do |master|
    master.vm.box =  "centos7"
    master.vm.provider "virtualbox" do |vb|
      vb.memory = "2048"
      vb.cpus = 2
    end
    master.vm.network "public_network", ip: "192.168.8.110"
    master.ssh.insert_key = false
    master.vm.hostname = "master"
  end

  config.vm.define "k8s-02" do |node1|
    node1.vm.box =  "centos7"
    node1.vm.network "public_network", ip: "192.168.8.111"
    node1.ssh.insert_key = false
    node1.vm.hostname = "node1"
  end

  config.vm.define "k8s-03" do |node2|
    node2.vm.box =  "centos7"
    node2.vm.network "public_network", ip: "192.168.8.112"
    node2.ssh.insert_key = false
    node2.vm.hostname = "node2"
  end
end
```

一句`vagrant up`就起了3台虚拟机

## 最后
有了vagrant，就在本地拥有了安全、方便的系统级别的沙盒环境

有了docker，就有了各种应用级别的沙盒环境

比如，开发和测试同学的老大难问题：如何快速部署一个打造分布式集群？

**vagrant+docker === 乱搞**

插个小话题  [Vagrant 和 Docker的使用场景和区别? - 知乎](https://www.zhihu.com/question/32324376)
