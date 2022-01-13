Node模块机制之require源码

CommonJS规范为Javascript制定了一个美好的愿景——希望Javascript能够在任何地方运行


## CommonJS规范

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201131329023.png)

在Node中，一个文件就是一个模块，每个模块拥有独立的作用域、变量、方法
在模块上下文中
* `module`变量代表当前模块
* 通过`require`方法来引入模块
* 提供了`exports`对象来导出当前模块的变量或者方法

## 模块的分类
在Node中，模块分为两大类
* 核心(原生)模块：Node提供的
* 内建模块：由纯`C/C++`编写提供的
* 全局模块：Node启动时，生成的全局变量，比如`process`
* 文件模块：用户编写的模块
* 普通模块：`node_modules`下的模块，或者用户自己编写的文件
* 外部编写的`C++`模块

![](https://raw.githubusercontent.com/amandakelake/picgo-images/master/images/202201131329718.png)



## `require` 伪代码算法
在读源码之前，先看看官方文档关于`require`的内部实现，写的非常详细了
[Modules: CommonJS modules | Node.js v15.8.0 Documentation](https://nodejs.org/api/modules.html#modules_all_together)
```shell
require(X) from module at path Y
1. If X is a core module,
   a. return the core module
   b. STOP
2. If X begins with '/'
   a. set Y to be the filesystem root
3. If X begins with './' or '/' or '../'
   a. LOAD_AS_FILE(Y + X)
   b. LOAD_AS_DIRECTORY(Y + X)
   c. THROW "not found"
4. If X begins with '#'
   a. LOAD_PACKAGE_IMPORTS(X, dirname(Y))
5. LOAD_PACKAGE_SELF(X, dirname(Y))
6. LOAD_NODE_MODULES(X, dirname(Y))
7. THROW "not found"
```

简单翻译一下（建议还是直接读最新的英文文档）
```shell
在路径Y下require(x)模块 
1. 如果 X 是核心模块
	a. 返回该核心模块 # 在node进程启动时，部分核心模块会被编译成二进制，被加载进内存了
	b. 返回，不再继续往下执行
2. 如果 X 以 '/' 开头
	a. 将 Y 设置为文件系统根目录
3. 如果 X 以 './' 或者 '/' 或者 '../' 开头
	a. LOAD_AS_FILE(Y + X) # LOAD_AS_FILE(X) 依次寻找 X、X.js、X.json、X.node
	b. LOAD_AS_DIRECTORY(Y + X)  # LOAD_AS_DIRECTORY 依次寻找X/package.json里的main字段、X/index.js、X/index.json、X/index.node
	c. 抛出异常 "not found"
# 4和5可以先忽略，不影响理解
4. 如果以 '#' 开头
	a. LOAD_PACKAGE_IMPORTS(X, dirname(Y))
5. LOAD_PACKAGE_SELF(X, dirname(Y))
# 加载node模块，依次向上寻找可能的目录，依次当做文件、目录名加载，这里可能有点难理解，参考下面例子
6. LOAD_NODE_MODULES(X, dirname(Y))
7. THROW "not found"
```

举个例子，在文件`/home/dir1/a.js`内执行 `require('b')`，
直接跑到典型的第6步，会依次先搜索以下目录
* `/home/dir1/node_modules/b`
* `/home/node_modules/b`
* `/node_modules/b`
搜索每个目录时，先把bar当成文件来查找，依次查找以下文件
* `b`
* `b.js`
* `b.json`
* `b.node`
如果都找不到，就把b当做目录来查找，依次加载以下文件
* `b/package.json`里面的`main`字段代表的文件
* `b/index.js`
* `b/index.json`
* `b/index.node`

## module是什么
建个`index.js`文件，然后打印`console.log(module)`，运行输出如下
```shell
# console.log(module)
$ node src/index.js 
Module {
  id: '.',
  path: '/Users/lgc/code-repo/node-repo/fake-module/src',
  exports: {},
  parent: null,
  filename: '/Users/lgc/code-repo/node-repo/fake-module/src/index.js',
  loaded: false,
  children: [],
  paths: [
    '/Users/lgc/code-repo/node-repo/fake-module/src/node_modules',
    '/Users/lgc/code-repo/node-repo/fake-module/node_modules',
    '/Users/lgc/code-repo/node-repo/node_modules',
    '/Users/lgc/code-repo/node_modules',
    '/Users/lgc/node_modules',
    '/Users/node_modules',
    '/node_modules'
  ]
}
```

## Module源码
先把node源码clone一份到本地 [GitHub - nodejs/node](https://github.com/nodejs/node)
用IDE可以直接找到`Module`定义的地方 `lib/internal/modules/cjs/loader.js`

> 为方便理解，下面基本是伪代码，在源码的基础上尽量只挑重要的、核心的代码，减少干扰

```js
function Module(id = '', parent) {
  this.id = id; // require的路径
  this.path = path.dirname(id); // 获取id对应的文件路径 
  this.exports = {}; // 要导出的内容，先初始化为空对象
  moduleParentCache.set(this, parent);
  updateChildren(parent, this, false);
  this.filename = null; // 模块文件名
  this.loaded = false; // 标志当前模块是否已加载
  this.children = [];
}

Module._cache = ObjectCreate(null); // 创建一个空的缓存对象
Module._extensions = ObjectCreate(null); // 创建一个扩展名对象（跟上面说的js、json、node这些扩展名相关，这里先不管，后面就清楚了）
```

`Module`的初始化并不复杂，根据打印出来的内容，对应一下就了解了

## require源码
每个模块实例都有一个`require`方法，挂在`Module.prototype`上，还是在`lib/internal/modules/cjs/loader.js`
```js
Module.prototype.require = function(id) {
    return Module._load(id, this, /* isMain */ false);
};
```

这里可以知道，`require`并不是全局的命令，而是每个模块提供的内部方法，只有在模块内部才能使用，它调用的是`Module._load`方法
```js
Module._load = function(request, parent, isMain) {
    // 1、计算绝对路径
    const filename = Module._resolveFilename(request, parent, isMain);

    // 2、取出缓存，直接返回
    const cachedModule = Module._cache[filename];
    if (cachedModule !== undefined) {
        return cachedModule.exports;
    }
    
    // 3、如果是内置模块，直接返回
    const mod = loadNativeModule(filename, request);
    if (mod && mod.canBeRequiredByUsers) return mod.exports;

    // 4、实例化Module，并存入缓存(此时缓存也是空的)
    const module = cachedModule || new Module(filename, parent);
    Module._cache[filename] = module;
    
    
    // 5、加载模块
    try {
        module.load(filename);
    } finally {
        // 如果有异常，删除缓存
        if (threw) {
            delete Module._cache[filename];
        }
    }
    
    // 6、返回模块的exports属性，并不是返回module
    return module.exports;
};
```

这里比较核心的两个地方
```shell
Module._resolveFilename() # 计算模块路径
module.load(filename); # 加载模块
```


## 计算模块路径 Module._resolveFilename
```js
Module._resolveFilename = function(request, parent, isMain, options) {
    // 如果是内置模块，直接返回request，也就是从最开始传入的 id
    if (NativeModule.canBeRequiredByUsers(request)) {
        return request;
    }
    
    // 确定路径，也就是层层往上寻找node_modules
    let paths;
    paths = Module._resolveLookupPaths(request, parent);

    // 确认最终的filename
    const filename = Module._findPath(request, paths, isMain, false);
    if (filename) return filename;
};
```

`Module.resolveLookupPaths()`方法是列出所有可能的路径，层层往上找，这里不继续看它的源码了，将所有可能的`path`传入`Module._findPath`找到模块的最终绝对路径
```js
Module._findPath = function(request, paths, isMain) {
    // 是否绝对路径
    const absoluteRequest = path.isAbsolute(request);
    if (absoluteRequest) {
        paths = [''];
    } else if (!paths || paths.length === 0) {
        return false;
    }

    // 如果缓存中有该路径，直接返回
    const entry = Module._pathCache[cacheKey];
    if (entry)  return entry;

    // 遍历所有可能的路径，前面Module.resolveLookupPaths返回的
    for (let i = 0; i < paths.length; i++) {
        let filename;
        const rc = stat(basePath);
        if (!trailingSlash) {
            // 当做文件寻找
            if (rc === 0) {
                filename = toRealPath(basePath);
            }

            // 依次加上后缀名来找，js、json、node
            if (!filename) {
                filename = tryExtensions(basePath, exts, isMain);
            }
        }

        // 如果是目录，按照package.json['main']、index.js、index.json、inde.node往下找
        if (!filename && rc === 1) {
            filename = tryPackage(basePath, exts, isMain, request);
        }

        // 将找到的路径存入缓存
        if (filename) {
            Module._pathCache[cacheKey] = filename;
            return filename;
        }
    }
    // 没有找到路径，返回false
    return false;
};
```

## 加载模块 module.load()
找到模块的绝对路径，就可以开始加载模块了，再回到`module.load()`方法
```js
Module.prototype.load = function(filename) {
    const extension = findLongestRegisteredExtension(filename);
    Module._extensions[extension](this, filename);
    this.loaded = true;
};
```
先确认模块的后缀名，不同的后缀名对应不同的处理方法，这里只看`js`和`json`的处理
注意一下`fs.readFileSync`，模块的加载都是同步的
```js
Module._extensions['.js'] = function(module, filename) {
    content = fs.readFileSync(filename, 'utf8');
    module._compile(content, filename);
};

// Native extension for .json
Module._extensions['.json'] = function(module, filename) {
    const content = fs.readFileSync(filename, 'utf8');
    try {
        module.exports = JSONParse(stripBOM(content));
    } catch (err) {
        err.message = filename + ': ' + err.message;
        throw err;
    }
};
```

`.json`文件的处理比较简单，直接`JSONParse`就完事了，有异常就抛出
重点看一下`.js`文件的处理

## 加载 `.js` 模块
首先通过`fs.readFileSync`同步读取文件内容，然后执行`module._compile`
```js
Module.prototype._compile = function(content, filename) {
	  // 
    const compiledWrapper = wrapSafe(filename, content, this);
    const require = makeRequireFunction(this, redirects);
    let result;
    const exports = this.exports;
    const thisValue = exports;
    const module = this;
	 // 这里涉及到上下文的传递
    result = ReflectApply(compiledWrapper, thisValue, [exports, require, module, filename, dirname]);
    return result;
};
```
在编译的过程中，Node对获取的JS文件内容进行了头尾包装，每个模块文件直接都进行了作用域隔离，按照以下的格式导出
```js
(function (exports, require, module, __filename, __dirname) {
  // 模块源码
	exports.[xxx] = fn
});
```
这一段本质上是利用node的虚拟机模块`vm`的`runInThisContext`方法将字符串（文件内容）编译成一个函数，将`exports属性、require方法、module（模块对象本身）、__filename、__dirname`等变量作为参数传递给这个函数执行，注入到模块上下文

## 返回结果
再回到最上面的`Module._load`中，`return module.exports;`

模块可以任意修改`module.exports`的值作为最终输出结果
```js
exports = {
    a: '1'
}

module.exports = {
    a: '1'
}
```

像上面这类代码，并不会改变模块的导出结果，只是改变了 `exports` 这个变量而已，看个例子
```js
let a = 'a';

console.log('module.exports', module.exports); // 空对象 {}
console.log('exports', exports); // 空对象 {}

exports.a = 1; // 修改本模块的值为 { a: 1 }

exports = '88咯'; // 修改exports的引用，但并没有修改本模块

console.log('module', module);
```

执行结果如下
```shell
module.exports {}

exports {}

module Module {
  id: '.',
  path: '...',
  exports: { a: 1 },
  parent: null,
  filename: '...',
  loaded: false,
  children: [],
  paths: [
		# ...
	]
}
```

可以看到模块的值依然是 `{ a: 1 }`，exports的引用更改并不会修改模块本身的值

## 总结
以上的流程，简单总结起来
```bash
Resolution (解析) –> Loading (加载) –> Wrapping (私有化) –> Evaluation (执行) –> Caching (缓存)
```

## 题外：CommonJS和ES6 Modules的循环引用问题
CommonJS循环引用原则：一旦出现某个模块被`循环引用`，就只输出已经执行的部分，还未执行的部分不会输出

ES6 Modules加载原理：遇到模块加载命令`import`时，不会去执行模块，而是生成一个引用，等到真正需要用时，再到模块内去取值，因此ES6模块是动态引用，不存在缓存值的问题，而且模块里面的变量，绑定其所在的模块


## Reference
* [Modules: CommonJS modules | Node.js v15.8.0 Documentation](https://nodejs.org/api/modules.html#modules_all_together) Node官方文档
* 《深入浅出NodeJS》— 朴灵
* [彻底搞懂 Node.js 中的 Require 机制(源码分析到手写实践)](https://mp.weixin.qq.com/s/M8KyGY_PjtxcvFrGb8cbww)
* [require() 源码解读 - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2015/05/require.html)
* [JavaScript 模块的循环加载 - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2015/11/circular-dependency.html)
* [Node.js 如何处理 ES6 模块 - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2020/08/how-nodejs-use-es6-module.html)
