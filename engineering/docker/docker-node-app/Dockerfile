# 使用最新的LTS node版本，将会从Docker Hub上面拉取这个版本
FROM node:carbon

# 定义项目要上传的容器位置，也就是我们这个项目要放到那个容器中
WORKDIR /usr/src/app

# 需要使用npm  所以复制一发
# npm 从版本4以上会生成package-lock.json文件
COPY package*.json ./

# 运行安装指令
RUN npm install

# 复制当前app目录文件到上面定义的目录WORKDIR中
# Bundle app source
COPY . .

# 对外开放端口，让外部可以访问容器内的app
EXPOSE 3000

# 启动App, 两条命令其实一样的
# CMD ["node", "server.js"]
CMD ["npm", "start"]
