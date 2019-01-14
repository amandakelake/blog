import { arrayToHtmlList } from "../util/browser"

// arrayToHtmlList
document.getElementById("arrayToHtmlList").addEventListener('click', () => {
  const arr = ['item1', 'item2', 'item2']
  arrayToHtmlList(arr, 'ul-list');
})