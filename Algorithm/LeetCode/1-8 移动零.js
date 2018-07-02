// 给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。

// 必须在原数组上操作，不能拷贝额外的数组。
// 尽量减少操作次数。

// 使用j类记录非0s数字,遇到非0则把该数塞到j的位置，
// 按照j进行循环
// 最后补0在后面
var moveZeroes = function(nums) {
  let j = 0;
  const len = nums.length;
  for(let i = 0; i < len; i++) {
    if (nums[i] !== 0) {
      // j也跟着增
      nums[j++] = nums[i];
    }
  }
  // 最后补长度
  for(j; j < len; j++) {
    nums[j] = 0;
  }
};