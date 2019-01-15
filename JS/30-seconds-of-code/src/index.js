import { arrayToHtmlList, copyToClipboard } from "../util/browser"

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