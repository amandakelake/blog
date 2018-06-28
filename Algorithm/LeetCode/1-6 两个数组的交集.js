// 给定两个数组，写一个方法来计算它们的交集。

// 例如:
// 给定 nums1 = [1, 2, 2, 1], nums2 = [2, 2], 返回 [2, 2].

// 大概思路，新建一个对象，键代表元素，值代表出现的次数
// 循环两个数组，循环第一个时往对象里面加，循环第二个数组时开始减，并往结果数组里面加

/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersect = function(nums1, nums2) {
 let res = [];
 let obj = {};
 for(let i = 0; i < nums1.length; i++) {
   if (!obj[nums1[i]]) {
     obj[nums1[i]] = 1;
   } else {
     obj[nums1[i]]++;
   }
 }
 for(let j = 0; j < nums2.length; i++) {
   if (obj[nums2[j]]) {
    obj[nums2[j]]--;
    res.push(nums2[j]);
   }
 }
 return res;
};