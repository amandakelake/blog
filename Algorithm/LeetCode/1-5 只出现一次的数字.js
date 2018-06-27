// 给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素
// 你的算法应该具有线性时间复杂度。 你可以不使用额外空间来实现吗？
/**
 * @param {number[]} nums
 * @return {number}
 */

// 异或运算，两个相同的数，异或的结果是0，一直异或最后剩下的就是结果
var singleNumber = function(nums) {
  let res = 0;
  for(let i = 0; i < nums.length; i++) {
    res = res ^ nums[i]
  }
  return res;
};