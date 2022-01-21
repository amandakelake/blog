/**
 * 基础二分搜索，只返回一个数
 */
var search = function (nums, target) {
    let left = 0;
    // 搜索闭合区间 [left, right]
    let right = nums.length - 1;

    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        const value = nums[mid];
        if (value === target) {
            return mid;
        } else if (value < target) {
            left = mid + 1; // mid已经搜过了，所以从mid+1搜起
        } else if (value > target) {
            right = mid - 1; // 同理
        }
    }
    return -1;
};


/**
 * 进阶版
 */
var leftBound = function (nums, target) {
    let left = 0;
    let right = nums.length - 1;

    // 停止条件是 left = right + 1
    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        const value = nums[mid];
        if (value === target) {
            // 别返回，向左推进
            right = mid - 1;
        } else if (value < target) {
            left = mid + 1;
        } else if (value > target) {
            right = mid - 1;
        }
    }
    // 防止left越界
    if (left >= nums.length || nums[left] !== target) {
        return -1;
    }
    return left;
};

var rightBound = function (nums, target) {
    let left = 0;
    let right = nums.length - 1;

    // 停止条件是 left = right + 1
    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        const value = nums[mid];
        if (value === target) {
            // 别返回，向右推进
            left = mid + 1;
        } else if (value < target) {
            left = mid + 1;
        } else if (value > target) {
            right = mid - 1; // 同理
        }
    }
    // 防止right越界
    if (right < 0 || nums[right] !== target) {
        return -1;
    }
    return right;
};
