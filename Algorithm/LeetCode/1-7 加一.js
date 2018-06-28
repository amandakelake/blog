// 给定一个非负整数组成的非空数组，在该数的基础上加一，返回一个新的数组。

// 最高位数字存放在数组的首位， 数组中每个元素只存储一个数字。

// 你可以假设除了整数 0 之外，这个整数不会以零开头。

/**
 * @param {number[]} digits
 * @return {number[]}
 */
var plusOne = function(digits) {
  // 用该标志位，代表是否需要进位
  let add = true;
  for(let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) {
      digits[i]++;
      // 这里如果return了，整个计算就结束了，也没有下面的add的判断
      return digits;
    } else {
      // 继续下一位，此时add依然是true
      digits[i] = 0;
    }
  }
  // 如果上面一直都没有return,说明需要进一位
  if (add) {
    digits.unshift(1);
  }
  return digits;
};