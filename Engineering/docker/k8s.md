# k8s集群部署

## 一、K8S概览
#### 1.1 k8s 是什么
K8s是一个自动化的容器编排平台，它负责应用的部署、应用的弹性以及应用的管理，这些都是基于容器的

Kubernetes是希腊语，中文翻译是**舵手**/飞行员

Container这个单词有另外一个意思是**集装箱**，可以理解为k8s希望成为一搜运送集装箱的货轮，帮助管理集装箱(容器)

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211281557352.jpg)

#### 1.2 部署方式，以及为什么需要 k8s
* 传统部署(物理机)：应用直接在物理机上部署，机器资源不好控制与分配，应用无隔离
* 虚拟机部署：单个物理机上运行多个虚拟机，每个虚拟机都是完整独立的系统，性能损耗大
* 容器部署：所有容器共享主机系统，轻量、性能损耗小，资源隔离，CPU和内存按需分配


* 应用单机部署，docker + docker-compose 足以
* 应用跑在3、4台机器上，依旧可以单独维护每台机器的运行环境+负载均衡器，还可接受
* 机器数量再往上涨至几十上百，加机器、应用更新、版本回滚等操作会异常繁琐、容易出错、不易维护、无效重复

这个阶段，k8s能提供集中式的集群和应用管理，不停机灰度更新，确保高可用、高性能、高拓展

#### 1.3 核心功能
* 服务发现与负载均衡，高可用不宕机，自动灾难恢复
* 调度（scheduling）：容器自动装箱，把一个容器放到一个集群的某个机器上
* 应用自动发布、一键回滚
* 集群、应用的水平伸缩（应用伸缩、机器增减）

#### 1.4 k8s架构

[一文秒懂 K8s 架构 | Kubernetes 架构简介 | 红帽](https://www.redhat.com/zh/topics/containers/kubernetes-architecture)

[📚 Kubernetes（K8S）简介 - K8S 教程](https://k8s.easydoc.net/docs/dRiQjyTY/28366845/6GiNOzyZ/9EX8Cp45)

几个概念
* K8s API：是 Kubernetes 控制平面的前端，也是用户与其 Kubernetes 集群进行交互的途径，用于管理、创建和配置 Kubernetes 集群的接口
* 节点（Node）：这些设备负责执行由控制平面分配的请求任务
* 容器集（Pod）：部署到单个节点上且包含一个或多个容器的容器组（逻辑概念，非物理概念）。容器集是k8s的最小调度以及资源单元  [从零入门 K8s| 人人都能看懂 Pod 与容器设计模式](https://mp.weixin.qq.com/s/OW7zvGhPgGAnBuo4A_SXFw) 墙推
* Kubectl：用于管理 k8s 集群的命令行配置工具
* Kubelet：运行在节点上的服务，可读取容器清单（container manifest），确保指定的容器启动并运行

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211281557938.png)

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211281557688.png)

* Master（主机）
    * apiserver：公开 kubernetes API
    * controller-manager：集群控制器
    * scheduler：调度分配资源，调度 pod 到哪个节点运行
    * etcd：整个集群的后台数据库，也可以不部署在 master 节点，单独搭建
* Node（节点）：真正运行业务，以pod的形式运行
    * Docker：具体跑应用的载体
    * kube-proxy：主要负责网络的打通，使用 ipvs技术
    * kubelet：agent，负责管理容器的生命周期

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211281558000.png)



## 二、K8S集群安装部署

#### 2.1 主机环境初始化

本文采用vagrant在本地生成虚拟机，不了解vagrant的可参考 [vagrant 基础](https://github.com/amandakelake/blog/blob/master/Engineering/vagrant.md)

```sh
# 1、安装k8s集群要求centos版本 >= 7.5
> cat /etc/redhat-release
CentOS Linux release 7.8.2003 (Core)
```

```sh
# 2、设置主机名解析，方便集群之间的直接调用
# 可使用 hostnamectl 命令, 也可以直接编辑/etc/hosts 添加如下内容
192.168.31.191 master
192.168.31.192 node1
192.168.31.193 node2
# 可分别 ping master、ping node1来验证
```

```sh
# 3、时间同步
sudo systemctl start chronyd # 启动chronyd服务
sudo systemctl enable chronyd # 设置chronyd服务开机自启
date # 验证时间
```

```sh
# 4、禁用iptables和firewalld服务
sudo systemctl stop firewalld
sudo systemctl disable firewalld

sudo systemctl stop iptables
sudo systemctl disable iptables
```

```sh
# 5、禁用selinux
sudo setenforce 0 # 暂时关闭
sudo sed -i 's/enforcing/disabled/' /etc/selinux/config # 永久关闭，需要重启
# 将/etc/selinux/config文件中的enforcing选项改完disabled
```

```sh
# 6、禁用swap分区
sudo vim /etc/fstab
# 注释掉swap分区那一行 需要重启 
```

```sh
# 7、修改linux内核参数，网桥过滤和地址转发功能
# 创建 /etc/sysctl.d/kubernetes.conf 文件
sudo touch /etc/sysctl.d/kubernetes.conf && sudo vim /etc/sysctl.d/kubernetes.conf
# 添加如下内容
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1

sudo sysctl -p # 重新加载配置
sudo modprobe br_netfilter # 加载网桥过滤模块
sudo lsmod | grep br_netfilter # 查看网桥过滤模块是否加载成功
```

```sh
# 8、配置ipvs，可暂不做
```

**重启所有 Linux 服务器！**

**重启所有 Linux 服务器！**

**重启所有 Linux 服务器！**

#### 2.2 安装docker 以及 k8s 组件

首先是docker

> 如果`vagrant up`初始化虚拟机的时候已经安装过docker，可跳过安装docker步骤
> 如果没安装过、卸载、想更换版本的话，可以按照下面步骤安装一次

```sh
# 安装docker
sudo wget https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -O /etc/yum.repos.d/docker-ce.repo
sudo yum -y install docker-ce-18.06.3.ce-3.el7
# 如果当前用户不是root用户，没有权限访问docker, 需要将当前用户添加到docker用户组
sudo gpasswd -a vagrant docker # 比如添加 vagrant用户
newgrp docker # 刷新docker用户组
sudo systemctl enable docker && systemctl start docker

# 设置docker镜像加速器
sudo mkdir -p /etc/docker # 安装好docker后当前目录已经存在
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "exec-opts": ["native.cgroupdriver=systemd"],    
  "registry-mirrors": ["https://0caxxpjq.mirror.aliyuncs.com"],    
  "live-restore": true,
  "log-driver":"json-file",
  "log-opts": {"max-size":"500m", "max-file":"3"}
}
EOF
sudo systemctl daemon-reload && sudo systemctl restart docker
```

安装k8s组件 `kubeadm` `kubelet` `kubectl`

```sh
# 设置k8s镜像源为国内阿里云的镜像源
# 如果提升没权限，直接创建该文件，再复制内容进去
sudo cat > /etc/yum.repos.d/kubernetes.repo << EOF
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

# 安装时指定版本
sudo yum install -y kubelet-1.23.6 kubeadm-1.23.6 kubectl-1.23.6

# 保持Docker和kubelet使用的cgroup driver一致，都为systemd
sudo vim /etc/sysconfig/kubelet
# 修改这一行，docker的配置已经在/etc/docker/daemon.json里面改过了
KUBELET_EXTRA_ARGS="--cgroup-driver=systemd"

# 设置为开启自启动，并启动
sudo systemctl enable kubelet && sudo systemctl start kubelet
```

#### 2.3 部署 k8s 的 Master 节点
```sh
# 在本地导出一份初始化配置文件，方便修改
kubeadm config print init-defaults > init-kubeadm.conf
vim init-kubeadm.conf # 打开文件，主要修改3个地方，如下图
# 1、替换k8s镜像仓库为阿里云镜像仓库，加速组件拉取，默认拉取镜像地址k8s.gcr.io国内无法访问
# 2、替换advertiseAddress为本机IP
# 3、配置 pod 网络为 flannel 网段
```

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211281559130.png)

修改完文件保存后，使用`kubeadm`拉取默认组件镜像
```sh
# 拉取默认组件镜像
kubeadm config images pull --config init-kubeadm.conf
# 拉取完后，用刚才的配置文件初始化 k8s 集群
sudo kubeadm init --config init-kubeadm.conf
# 初始化后，会有提示消息，根据提示消息操作
```
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211281600685.png)
第一部分复制授权文件，以便 kubectl 可以有权限访问集群

第二部分是在 node 节点执行的命令，可以快速将 node 节点加入到 master 集群内，下面马上用到
```sh
# 这段token默认有效期24小时，过期后不能再用
kubeadm join 192.168.31.191:6443 --token abcdef.0123456789abcdef --discovery-token-ca-cert-hash sha256:c0d040643cbd428cbc141e7e464a5cfb3adcd81ad11d3cf72a7c1d285c9209f4

# 可用下面命令创建token
kubeadm token create --print-join-command
# 或者直接生成永不过期的token
kubeadm token create --ttl 0 --print-join-command
```

如果碰到报错`[ERROR FileContent--proc-sys-net-bridge-bridge-nf-call-iptables]: /proc/sys/net/bridge/bridge-nf-call-iptables contents are not set to 1`
执行下面
```sh
echo 1 > /proc/sys/net/bridge/bridge-nf-call-iptables
echo 1 > /proc/sys/net/bridge/bridge-nf-call-ip6tables
```


#### 2.4 部署 k8s 的 Node 节点
在 node 虚拟机上添加上面的命令，有多少台就添加多少
```sh
# 以root权限添加
$ sudo kubeadm join 192.168.31.191:6443 --token abcdef.0123456789abcdef --discovery-token-ca-cert-hash sha256:c0d040643cbd428cbc141e7e464a5cfb3adcd81ad11d3cf72a7c1d285c9209f4

# 添加成功会看到如下输出

[preflight] Running pre-flight checks
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap...

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.
```


#### 2.5 安装 Flannel （网络插件）
上面初始化配置有 `配置 pod 网络为 flannel 网段`这么一项

它的作用是通过创建虚拟网络，让不同节点下的服务有全局唯一的IP地址，且服务之间介意互相访问和连接，说直白点：**让所有的 Pod 加入到同一个局域网中**
```sh
# 获取 flannel 的配置文件 
# 如果报错连接不上raw.githubusercontent.com，先获取IP再添加到/etc/hosts
# 实在还是连接不上，直接在浏览器访问这个文件，新建 kube-flannel.yml 文件，然后拷贝内容进去
# 内容拷贝出来放在文章最后的附录了 -> 获取时间 2022-11-25
wget https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
# 使用配置文件启动 flannel
kubectl apply -f kube-flannel.yml

# 如无意外，得到如下输出
podsecuritypolicy.policy/psp.flannel.unprivileged created
clusterrole.rbac.authorization.k8s.io/flannel created
clusterrolebinding.rbac.authorization.k8s.io/flannel created
serviceaccount/flannel created
configmap/kube-flannel-cfg created
daemonset.apps/kube-flannel-ds created
```

> node节点不需要安装，插件使用的是DaemonSet的控制器，它会在每个节点上运行

#### 2.6 查看集群节点状态
```sh
$ kubectl get nodes
# 如无意外，能看到类似如下输出
NAME               STATUS   ROLES                  AGE    VERSION
cicd-k8s-node-01   Ready    <none>                 56m    v1.23.6
cicd-k8s-node-02   Ready    <none>                 6m3s   v1.23.6
node               Ready    control-plane,master   105m   v1.23.6
```

至此，kubernetes的集群环境搭建完成

## 三、部署nginx服务（测试）
```sh
# 部署nginx
kubectl create deployment nginx --image=nginx:1.14-alpine
# 暴露端口
kubectl expose deployment nginx --port=80 --type=NodePort
# 查看服务状态
kubectl get pods,svc

# 如无意外，可看到如下输出
NAME                         READY   STATUS    RESTARTS        AGE
pod/nginx-7cbb8cd5d8-4wc6n   1/1     Running   1 (6m45s ago)   47m

NAME                 TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
service/kubernetes   ClusterIP   10.96.0.1      <none>        443/TCP        158m
service/nginx        NodePort    10.100.2.154   <none>        80:32021/TCP   47m
```

这时候访问 `[master IP]:[端口]` -> `192.168.31.191:32021`会发现访问不了

甚至ping一下各个节点由flannel分配的ip -> `ping 10.100.2.154`也发现无法访问

节点间无法通信？？？

## 四、浏览器无法访问

这其实是虚拟机的限制，所以在部署flannel的时候，需要修改flannel的启动参数，设置一下默认网卡

`ip addr`查看IP，发现分配`192.168.31.191`的网卡是`eth1`

然后修改flannel的配置文件`kube-flannel.yml`，指定网卡
```yaml
# 找到 kind: DaemonSet
# 修改 spec.template.spec.containers[0].args 字段
# 在args下增加一行 - --iface=eth1
# 
containers:
  - name: kube-flannel
    image: rancher/mirrored-flannelcni-flannel:v0.18.1
    command:
      - /opt/bin/flanneld
    args:
      - --ip-masq
      - --kube-subnet-mgr
      - --iface=eth1   # 增加这一行
```

修改完后重新执行，启动 flannel
```sh
kubectl apply -f kube-flannel.yml
```

这时候在浏览器访问或者`curl`一下`[master ip]:[端口]`，都可以正常访问

## 五、总结

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211281603501.png)

## 参考
[Kubernetes安装配置指南](https://mp.weixin.qq.com/s?__biz=MzA5Mjc1MjEwMg==&mid=2452395461&idx=1&sn=970236861faefd9a14f2ec13ce03e780&chksm=87b0644cb0c7ed5a486ac93f49eaf60e6e9d347a1ac86b1f51c72b152306246cc892f746b071&token=1780604434&lang=zh_CN#rd) 很清晰

[部署Kubernetes(k8s)时，为什么要关闭swap、selinux、firewalld？ - 知乎](https://www.zhihu.com/question/374752553)

[从零开始在ubuntu上安装和使用k8s集群及报错解决 — 浮云的博客](https://last2win.com/2020/01/30/k8s-install-and-use-and-fix-bug/#k8s-1) 部署踩坑

[Kubernetes_02_从零开始搭建k8s集群（亲测可用）_毛奇志的技术博客_51CTO博客](https://blog.51cto.com/u_15287666/5780765) 前人经验

[公网K8S搭建](https://shimo.im/docs/gO3oxnybjbFBg9qD/read) 这篇参考了上面这篇

[Vagrant学习笔记：搭建K8s集群 - 知乎](https://zhuanlan.zhihu.com/p/563193623) 抽出`common.sh、master.sh、node.sh`三份文件，用sh脚本替代重复性工作，思路值得学习
