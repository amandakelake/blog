// 判断一个 9x9 的数独是否有效。只需要根据以下规则，验证已经填入的数字是否有效即可。

// 数字 1-9 在每一行只能出现一次。
// 数字 1-9 在每一列只能出现一次。
// 数字 1-9 在每一个以粗实线分隔的 3x3 宫内只能出现一次。

// 要解决行、列、三格的问题
// 第一种是依次遍历行、列、小宫格  比较麻烦
// 第二种是合并三种判断  一次遍历完成

/**
 * @param {character[][]} board
 * @return {boolean}
 */
var isValidSudoku = function (board) {
  // 用来处理小宫格
  let littleBoard = [[], [], [], [], [], [], [], [], []];

  for (let i = 0; i < 9; i++) {
    // 储存列
    let column = [];

    // 检查每一行
    if (!hasRepeat(board[i])) return false;

    // 处理列
    for (let j = 0; j < 9; j++) {
      // 把每一列拿出来推进去
      column.push(board[j][i]);

      // 顺便预处理一下小的九宫格，这个地方可以好好思考一下
      const boxId = 3 * parseInt(i / 3) + parseInt(j / 3);
      littleBoard[boxId].push(board[i][j]);
    }

    // 检查每一列
    if (!hasRepeat(column)) return false;
  }

  // 判断小的九宫格
  for (let k = 0; k < 9; k++) {
    if (!hasRepeat(littleBoard[k])) return false;
  }

  return true;

  // 判断一维数组是否有重复
  function hasRepeat(arr) {
    let temp = [];
    for (let i = 0; i < 9; i++) {
      if (arr[i] === '.') continue;
      if (temp.indexOf(arr[i]) === -1) {
        temp.push(arr[i]);
      } else {
        return false;
      }
    }
    return true;
  }
};