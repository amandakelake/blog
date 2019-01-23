console.log("代理模式")

// 假定ReadImg不能被直接读取，必须通过下方代理使用它的display方法
class ReadImg {
  constructor(fileName) {
    this.fileName = fileName;
    this.loadFromDisk();
  }

  loadFromDisk() {
    console.log("loading..." + this.fileName)
  }

  display() {
    console.log("display..." + this.fileName)
  }
}

class ProxyImg {
  constructor(fileName) {
    this.realImg = new ReadImg(fileName)
  }

  // 提供对外的使用方法一模一样  都是display
  display() {
    this.realImg.display()
  }
}

let proxyImg = new ProxyImg('img.png')
// 执行代理给出的方法
proxyImg.display()

// var myDiv = document.getElementById(myId);
// myDiv.addEventListener("click", function(e) {
//   var target = e.target;
//   if (target.nodeName === "A") {
//     console.log(target.innerHTML)
//   }
// })

// $("#myDiv").click(function() {
//   var fn = function() {
//     $(this).css("background-color", "red")
//   }
//   // 代理this
//   var Fn = $.proxy(fn, this);
//   setTimeout(Fn, 1000)
// })

let star = {
  name: "某娘炮",
  age: 28,
  phone: "star: 111111111"
}

let handler = {
  get: function(target, key) {
    if (key === "phone") {
      // 返回经纪人的电话
      return "agent: 22222222"
    }
    if (key === "price") {
      // 明星不报价，经纪人报价
      return 100000
    }
    return target[key]
  },
  set: function(target, key, value) {
    if (key === 'queryPrice') {
      if (value < 80000) {
        throw new Error("少于10W免谈")
      } else {
        target[key] = value;
        return true;
      }
    }
  }
}

let agent = new Proxy(star, handler);

console.log(agent.name);
console.log(agent.phone);
agent.queryPrice = 120000;
console.log(agent.queryPrice);
agent.queryPrice = 70000;