# RN性能优化以及我踩过的一些“弱智”坑儿😂（持续更新。。。）

## 一、前言

最近在进行公司RN项目重构，思考了一些从react到react-native的性能优化相关问题，借此总结记录一下，就先当占个坑，bug写多了，认识会越来越深刻
这部分都不是死知识，可能哪天我又会有更广阔的思路与解决办法，所以本文会持续保持更新。。。

另外，写RN的过程中当然会踩过大大小小的坑，有些解决了，有些还等挖掘更好的方案，甚至有些解决不了的就直接绕道了（希望有大神指导一下），也一并记录下来好了，这部分也会持续更新。。。
可惜有些问题解决完就忘了，没记录下来，特别是调试、真机、平台方面的

题外话：有些当初苦苦想破脑袋的坑，踩过后才发现是如此的弱🐔，本来是不应该show出来贻笑大方的，但万一就是有小白也刚好陷入跟我当初一样的思维怪圈呢？所以不怕大家笑话，就一股脑都写下来吧，若干年后回头一看：原来当年我傻的如此可爱，能博得自己一笑，不也挺有意思的么


## 二、RN性能优化（持续更新。。。）
[image:777DC2D6-EE2A-46A2-BB68-ED36C3B0B6CE-13728-0000CE079A7A5A10/A13CC126-B79E-48FC-AC35-EE40B87AD6D1.png]
### 1、是否重新渲染
[React.Component - React](https://doc.react-china.org/docs/react-component.html#shouldcomponentupdate)



## 三、踩坑总结（持续更新。。。）
这里科普一下自己遇到问题的通用解决办法

1、看官方文档，很多问题官方都已经考虑到了，对着关键词搜
这里要吐槽一句，RN的中文文档是真滴烂，推荐看英文文档（看不懂就好好学英语）
2、google （不要百度）
google出来的列表里面，优先看github的issue，其次看stackoverflow，然后才是其他的选项
[image:2BFC6DCD-C869-4418-B9FA-B4C63B342CDA-13728-0000CEE5786A3563/E3D09196-D76A-469F-9653-953DC2EB5194.png]
3、问同事（一定要再自己google后），问你认识的大神好友
带着清晰的问题，傻逼问题就别问了

4、以上三板斧都解决不了的话，信佛的阿弥陀佛，信基督的阿门吧




## 参考
[React性能优化总结 · Issue #3 · Pines-Cheng/blog · GitHub](https://github.com/Pines-Cheng/blog/issues/3)
[Immutable 详解及 React 中实践 · Issue #3 · camsong/blog · GitHub](https://github.com/camsong/blog/issues/3)
[【译】React 组件渲染性能探索 · Issue #10 · Pines-Cheng/blog · GitHub](https://github.com/Pines-Cheng/blog/issues/10)
[在React.js中使用PureComponent的重要性和使用方式 - 众成翻译](https://www.zcfy.cc/article/why-and-how-to-use-purecomponent-in-react-js-60devs)

[image:3454323D-7D12-417B-95EF-A3B76E3B709D-17051-00009F9A7D7B12E3/6BD45E7D-9FB3-4F2D-9275-B25BAE5CBE70.png]

[React Native性能之谜 – ThoughtWorks洞见](https://insights.thoughtworks.cn/the-react-native-mystery/)从native、js、bridge的层面分析了性能的关键，大部分是思路
[React-Native通用化建设与性能优化 - Web前端 腾讯IVWeb 团队社区](https://ivweb.io/topic/5906feb806f26845b620dd82)
[探索react native首屏渲染最佳实践 | AlloyTeam](http://www.alloyteam.com/2016/03/best-practice-in-react-native/)
[袁 聪 - 全民K歌React Native实践与优化 | MySlide - 专注PPT分享，追随SlideShare和SpeakerDeck的脚步](https://myslide.cn/slides/3943?vertical=1)
[ReactNative/chapter2.md at master · GammaGos/ReactNative · GitHub](https://github.com/GammaGos/ReactNative/blob/master/BestActualCombat/articles/chapter2.md) 这篇从作者实际出发   有场景和示例

