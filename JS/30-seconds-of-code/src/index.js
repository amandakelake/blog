import {
  arrayToHtmlList,
  copyToClipboard,
  counter,
  createEventHub
} from "../util/browser"

// arrayToHtmlList
document.getElementById("arrayToHtmlList").addEventListener('click', () => {
  const arr = ['item1', 'item2', 'item2']
  arrayToHtmlList(arr, 'ul-list');
})

// copyToClipboard
document.getElementById("copyToClipboard").addEventListener('click', () => {
  const str = document.getElementById("copyText").innerText.toString();
  copyToClipboard(str);
})

document.getElementById("counter-trigger").addEventListener('click', () => {
  counter('#counter', 0, 1000, 5, 10000)
})

// createEventHub
const eventHub = createEventHub();

let createEventHubVariable = 1;
document.getElementById("createEventHubVariable").innerHTML = createEventHubVariable;

const handler = data => {
  console.log(data);
}
/**
  // hub订阅了myEvent， myEvent2 两个事件
  // 其中myEvent事件注册了两个回调handler 和 匿名函数
  eventHub.on('myEvent', handler);
  eventHub.on('myEvent', () => {
    console.log('I am handler 2');
    console.log('eventHub', eventHub)
  });
  eventHub.on('myEvent2', () => {
    createEventHubVariable++;
    console.log('eventHub', eventHub);
  });

  // 某些用户或者数据变化产生的交互：发布
  // 传入不同的参数，执行回调handler， 同时也会执行上面注册的匿名函数
  eventHub.emit('myEvent', 'I am a string');
  eventHub.emit('myEvent', { arg: 'I am a object'});
  eventHub.emit('myEvent2');

  // 只移除了handler， 匿名函数还是在的
  eventHub.off('myEvent', handler)
*/
document.getElementById("log-hub").addEventListener('click', () => {
  console.log('eventHub', eventHub);
})

document.getElementById("log-va").addEventListener('click', () => {
  console.log('createEventHubVariable', createEventHubVariable);
})

document.getElementById("subscribe-myEvent-h").addEventListener('click', () => {
  eventHub.on('myEvent', handler);
  console.log('eventHub', eventHub);
})

document.getElementById("subscribe-myEvent-u").addEventListener('click', () => {
  eventHub.on('myEvent', () => console.log('I am handler 2'));
  console.log('eventHub', eventHub)
})

document.getElementById("subscribe-myEvent2").addEventListener('click', () => {
  eventHub.on('myEvent2', () => {
    createEventHubVariable++;
    document.getElementById("createEventHubVariable").innerHTML = createEventHubVariable;
  });
  console.log('eventHub', eventHub)
})

document.getElementById("emit-myEvent").addEventListener('click', () => {
  eventHub.emit('myEvent', 'I am a string');
  eventHub.emit('myEvent', {
    arg: 'I am a object'
  });
})

document.getElementById("emit-myEvent2").addEventListener('click', () => {
  eventHub.emit('myEvent2');
  document.getElementById("createEventHubVariable").innerHTML = createEventHubVariable;
  console.log('createEventHubVariable', createEventHubVariable);
})

document.getElementById("off-myEvent-handler").addEventListener('click', () => {
  eventHub.off('myEvent', handler);
  console.log('eventHub', eventHub);
})