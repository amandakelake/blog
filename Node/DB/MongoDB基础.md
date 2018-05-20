# mongoDB基础
#develop/mongoDB


#### 1、安装
mac安装很简单
```
brew install mongodb
```
其他系统请自行下载[MongoDB for GIANT Ideas | MongoDB](https://www.mongodb.com/)

#### 2、找到安装目录
安装完后，目前homebrew会把MongoDB安装在这个目录下面
```
usr/local/Cellar/mongoDB
```

如果找不到`usr`目录，就一直`cd ..`往后退到mac的根目录

#### 3、建立存储数据的文件夹
创建一个你喜欢的文件夹来存储你的数据，比如我就放在了`/Users/macbookpro-luoguangcong/Data-DB`下面

#### 4、启动MongoDB
进入mongoDB执行目录，现在安装的monoDB下面还有一个版本目录的，比如我的是3.6.4，并进入到bin目录`mongodb/3.6.4/bin`

执行命令`mongod --dbpath <pathname>`, `pathname`就是上面建立的存储数据的文件夹
```
mongodb/3.6.4/bin                                                             
▶ mongod --dbpath /Users/macbookpro-luoguangcong/Data-DB
```

看到`waiting for connections on port 27017`这样的字眼，那就是OK了

打开浏览器输入`localhost:27017`,会看到`It looks like you are trying to access MongoDB over HTTP on the native driver port.`的字眼

如果不想每次启动mongodb都要切换到`/usr/local/Cellar/mongoDB/3.6.4/bin`目录下，我们可以将它添加到环境变量，操作如下
```
echo 'export PATH=/usr/local/Cellar/mongoDB/3.6.4/bin:$PATH'>>~/.bash_profile
```
如果用的是iterm2，用的shell是zsh的话，把`.bash_profile`换成`.zshrc`

重启命令终端，或者`source ~/.zshrc`即可生效

接下来我在任何目录下执行`mongod --dbpath ~/Data-DB`都可以直接开启了。

#### 5、基础操作
在另一个命令行窗口进入如下操作
```
mongo
```
终端会一直出现`>`的符号，就可以输入各种命令了

[Tutorials-for-Web-Developers/MongoDB 极简实践入门.md at master · StevenSLXie/Tutorials-for-Web-Developers · GitHub](https://github.com/StevenSLXie/Tutorials-for-Web-Developers/blob/master/MongoDB%20%E6%9E%81%E7%AE%80%E5%AE%9E%E8%B7%B5%E5%85%A5%E9%97%A8.md)

显示数据库
```
> show dbs
admin   0.000GB
config  0.000GB
local   0.000GB
```
没有test这个库的话会直接新建一个
```
> use test
switched to db test
```
但`show dbs`的时候`test`不会出现，因为这时候这个数据库是空的

往`test`数据库里添加一个集合(collection)，集合类似于SQL中的表格
```
> db.createCollection('author')
{ "ok" : 1 }
```
这时候再`show dbs`和`show collections`就能看见test数据库相关的内容了
```
> show databases
admin   0.000GB
config  0.000GB
local   0.000GB
test    0.000GB
> show collections
author
```

如果不需要author这个集合，可以这样删除
```
db.author.drop()
```

**集合(collection)类似于SQL的表格(table)，类似于Excel的一个个表格**

#### 6、插入
创建一个叫电影的集合
```
db.createCollection('movie')
```
插入数据
```js
db.movie.insert(
 {
   title: 'Forrest Gump', 
   directed_by: 'Robert Zemeckis',
   stars: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
   tags: ['drama', 'romance'],
   debut: new Date(1994,7,6,0,0),
   likes: 864367,
   dislikes: 30127,
   comments: [	
      {
         user:'user1',
         message: 'My first comment',
         dateCreated: new Date(2013,11,10,2,35),
         like: 0 
      },
      {
         user:'user2',
         message: 'My first comment too!',
         dateCreated: new Date(2013,11,11,6,20),
         like: 0 
      }
   ]
 }
)
```
能看到如下输出`WriteResult({ "nInserted" : 1 })`

如下命令查找内容，但`find()`里面什么都没写，也就是说不做筛选，所以会全部返回，`pertty()`是格式化，试一下就知道了
```
db.movie.find()
db.movie.find().pretty()
```

但是你会看到，结果中多了一个
```
"_id" : ObjectId("5b00cba4640212f1efd91c3c")
```
这是数据库自动创建的一个ID号，在同一个数据库里，每个文档的ID号都是不同的

#### 7、正确退出数据库
```
use admin;
db.shutdownServer();
```

到这里，已经有了最基础的基础认知，要学之后的各种查询、更新、搜索等等也就是看看API文档的事情。