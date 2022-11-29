# 【kubernetes】Ingress-nginx 部署

## 一、背景

在k8s中，服务和pod的IP地址仅可以在集群内部使用，对集群外不可见，为了让外部应用能够访问集群内部服务，k8s提供了几种方案
* NodePort：需要知道service对应的pod所在的node的IP
* LoadBalance：通常需要第三方云服务商提供支持
* Ingress

部署在k8s集群中的应用，我们可以通过service (NodePort、Loadbalancer类型)暴露给外部用户，对于小规模的应用，NodePort还过得去，但当应用越来越多的时候，如果更方便的管理大量端口呢？

## 二、简介
[Ingress | Kubernetes](https://kubernetes.io/zh-cn/docs/concepts/services-networking/ingress/)


K8s提供了 Ingress 资源对象，一个路由请求描述配置文件，而配置需要Ingress 控制器来生效，常用的是 Ingress-nginx，一个基于 Nginx的 Ingress 控制器

Ingress由服务、控制器组成
* Ingress service：将Nginx的配置抽象成一个Ingress对象，每添加一个新的服务只需写一个新的Ingress的yaml文件即可
* Ingress controller: 将新加入的Ingress转化成Nginx的配置文件并使之生效

## 三、解决了什么问题
* 动态配置服务
    * 传统方式, 当新增加一个服务时, 需要在流量入口加一个反向代理指向我们新的k8s服务.
    * 而如果用了Ingress, 只需要配置好这个服务, 当服务启动时, 会自动注册到Ingress的中, 不需要额外的操作.
* 减少不必要的端口暴露
    * k8s的很多服务会以NodePort方式映射出去, 这样就相当于给宿主机打了很多孔, 既不安全也不优雅
    * Ingress可以避免这个问题, 除了Ingress自身服务可能需要映射出去, 其他服务都不要用NodePort方式

## 四、原理
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292109034.png)
* 用户编写 Ingress Service规则， 说明每个域名对应 K8s集群中的哪个Service
* Ingress控制器会动态感知到 Ingress 服务规则的变化，然后生成一段对应的Nginx反向代理配置
* Ingress控制器会将生成的Nginx配置写入到一个运行中的Nginx服务中，并动态更新
* 然后客户端通过访问域名，实际上Nginx会将请求转发到具体的Pod中，到此就完成了整个请求的过程
  
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292110851.png)

## 五、Ingress-nginx 运行原理
`Ingress-nginx` 控制器用来组装`nginx.conf`配置文件

对于nginx来说，当配置文件发生任何变动，需要重新加载nginx来生效

而`Ingress-nginx`则尽量避免不必要的reload，内部使用一个`lua-nginx-module`来实现，只在影响upstream的配置发生变更才会reload nginx

`Ingress-nginx`使用集群中的不同对象来构建模型，watch到发生变更后，控制器会根据集群状态重建一个新的模型与旧的模型进行比较，决定是否需要reload


> 简单点说这货就是将nginx打包成为一个docker镜像，镜像里运行着一个nginx服务，另外还运行着一个nginx-controller的服务，这个nginx-controller会调用k8s的API去查询servie后端的pod变换，然后将pod加入到nginx的upstream代理，并且能重启nginx。这样就完成了自动感知pod变化，实现服务的反向代理。为啥要比traefik多一个nginx-controller服务？因为traefik可以直接调用K8S的API，而Nginx不能，所有需要这个nginx-controller调用K8S的API，再去生成nginx配置文件。这里解决了nginx upstream后端节点的变动问题，但nginx还少了一个监听的域名，所以需要ingress去定义域名到内部service的对应关系，最后nginx-controller根据ingress规则，和对k8s的pod感知，生成出了域名到pod的upstream配置，一个完整的配置文件就诞生了。

## 六、安装部署 Nginx ingress controller 
实质上有两个 Nginx ingress controller
* [Ingress-NGINX Controller ](https://github.com/kubernetes/ingress-nginx) kubernetes社区版本
* [NGINX and  NGINX Plus Ingress Controllers](https://github.com/nginxinc/kubernetes-ingress) Nginx Inc 版本

两者对比可以看[A Guide to Choosing an Ingress Controller, Part 4: NGINX Ingress Controller Options - NGINX](https://www.nginx.com/blog/guide-to-choosing-ingress-controller-part-4-nginx-ingress-controller-options/)

一般默认选择 kubernetes社区版本 ，[Installation Guide - NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/deploy/)

[How To Setup Nginx Ingress Controller On Kubernetes](https://devopscube.com/setup-ingress-kubernetes-nginx-controller/) 老外写文章质量确实不错，国内搜来搜去都是复制粘贴的

有两种安装方式

* 手动安装
  据说有助于理解 Nginx ingress controllers的组成和通信原理，so…本文采用下面的一键安装

* 一键安装
```sh
# 网上多数采用的1.1.1版本
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.1/deploy/static/provider/cloud/deploy.yaml
```
但这份文件里面的两个镜像地址是无法拉取的，会报`ErrImagePull/ImagePullBackOff`的错误，原因是官方人员说无法上传到 docker hub[how to pull the image from China network? · Issue #6335 · kubernetes/ingress-nginx · GitHub](https://github.com/kubernetes/ingress-nginx/issues/6335)

后来有有国内好心人搬运到了 docker hub上，两个镜像的地址如下
* https://hub.docker.com/r/anjia0532/google-containers.ingress-nginx.controller/tags
* https://hub.docker.com/r/anjia0532/google-containers.ingress-nginx.kube-webhook-certgen/tags

> [解决国内k8s的ingress-nginx镜像无法正常pull拉取问题_文杰@的博客-CSDN博客](https://blog.csdn.net/weixin_43988498/article/details/122792536)
```sh
docker pull anjia0532/google-containers.ingress-nginx.controller:v1.1.1
docker pull anjia0532/google-containers.ingress-nginx.kube-webhook-certgen:v1.1.1
```

可以先将文件拉下来，然后将镜像地址改为上面两个地址，同时把Service的type改为`NodePort`

```yaml
---
# Source: ingress-nginx/templates/controller-service.yaml
apiVersion: v1
kind: Service
# ... others
spec:
  type: NodePort #  原来是LoadBalancer，改为 NodePort
  # ... others
  ports:
    - name: http
      port: 80
      protocol: TCP
      targetPort: http
      appProtocol: http
    - name: https
      port: 443
      protocol: TCP
      targetPort: https
      appProtocol: https
  selector:
  # ... others
```

再执行`kubectl apply -f deploy.yml`

接下来会自动拉取 ingress 镜像，自动部署 ingress，可以用下面命令查看部署状态
```sh
kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --watch
```

显示如下，安装部署成功

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292110447.png)

输入以下命令检查配置是否生效
```sh
kubectl -n ingress-nginx get svc
```
显示如下，那就是生效了
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292110241.png)

如果中间出了什么问题，可以删除重来
```sh
kubectl delete -f deploy.yml
# 或者删除 namespace
kubectl delete namespace ingress-nginx
# 甚至删除一切pod、svc重来
kubectl delete all --all

kubectl get namespace ingress-nginx # 查看
kubectl edit ns ingress-nginx # 直接编辑

# 亲测，可以删除 Terminating 的 namespace
kubectl get namespace ingress-nginx -o json | tr -d "\n" | sed "s/\"finalizers\": \[[^]]\+\]/\"finalizers\": []/" | kubectl replace --raw /api/v1/namespaces/ingress-nginx/finalize -f -
```
[删除namespace为什么会Terminating？ - 腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/1802531)

## 七、部署应用
新建一份配置文件
```yaml
# base.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-demo
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    kubernetes.io/ingress.class: nginx
spec:
  rules:
  - http:
      paths:
       - path: /
         pathType: ImplementationSpecific
         backend:
           service:
             name: front-service-v1 # 这个服务是我之前k8s部署过的一个测试应用
             port:
```

大概率碰到类似如下报错
```sh
 $ kubectl apply -f ./base.yaml
Error from server (InternalError): error when creating "./base.yaml": Internal error occurred: failed calling webhook "validate.nginx.ingress.kubernetes.io": failed to call webhook: Post "https://ingress-nginx-controller-admission.ingress-nginx.svc:443/networking/v1/ingresses?timeout=10s": dial tcp 10.109.128.203:443: i/o timeout
```
可参考 [kubernetes - Nginx Ingress: service “ingress-nginx-controller-admission” not found - Stack Overflow](https://stackoverflow.com/questions/61365202/nginx-ingress-service-ingress-nginx-controller-admission-not-found)
```sh
# 问题是使用的是Kubernetes版本1.18，但是当前ingress-Nginx中的ValidatingWebhookConfiguration使用了最早的API。这个webhook是ingress-nginx-0.44新加的，主要是防止用户错误配置ingress把pod搞挂了，不用的话，可以删掉
kubectl delete -A ValidatingWebhookConfiguration ingress-nginx-admission
```
再重新部署
```sh
kubectl apply -f ./base.yaml
# 部署成功
ingress.networking.k8s.io/nginx-demo created
```

## 八、问题排查思路
[Nginx Ingress异常问题的排查思路和解决方法_容器服务Kubernetes版-阿里云帮助中心](https://help.aliyun.com/document_detail/405072.html)
```sh
# 1、先查看服务是否起来
kubecetl get all -n ingress-nginx
# 如下图，服务是正常运行

# 2、查看 yaml 配置文件是否写对了，下面命令可以看必要的字段怎么写
kubectl explain svc
kubectl explain deployment

# 3、主机/etc/hosts配置文件，是否暴露访问域
```
![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202211292111310.png)
