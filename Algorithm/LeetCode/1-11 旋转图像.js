/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
var rotate = function(matrix) {
    
};


let rotate = function (matrix) {
  let len = matrix.length
  // 先求转置矩阵 然后每行反序
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]]
    }
    matrix[i].reverse()
  }
  // return matrix
}