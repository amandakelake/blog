// 给定一个数组，它的第 i 个元素是一支给定股票第 i 天的价格。
// 设计一个算法来计算你所能获取的最大利润。你可以尽可能地完成更多的交易（多次买卖一支股票）。
// 注意：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

/**
 * @param {number[]} prices
 * @return {number}
 */

// 大概思路，找到数组中所有连续降序的最大和最小值，他们的差的和即为最大利润
// 贪心算法 总是做出在当前看来是最好的选择，不从整体最优上加以考虑，也就是说，只关心当前最优解
var maxProfit = function (prices) {
  let res = 0;
  let temp = 0; // 差
  let i = 0;
  const len = prices.length;
  for (i; i < len; i++) {
    temp = prices[i + 1] - prices[i];
    if (temp > 0) {
      res += temp;
    }
  }
  return res;
};