/**
 * 返回 nums 中能够凑出 target 的两个元素的值，且不能重复
 */
var twoSumTarget = function (nums, start, target) {
    nums.sort();
    let lo = start;
    let hi = nums.length - 1;
    const res = [];

    while (lo < hi) {
        const sum = nums[lo] + nums[hi];

        // 处理重复元素
        let left = nums[lo];
        let right = nums[hi];

        if (sum < target) {
            // 跳过重复的元素
            while (lo < hi && nums[lo] === left) {
                lo++;
            }
        } else if (sum > target) {
            while (lo < li && nums[hi] === right) {
                hi--;
            }
        } else {
            res.push([left, right]);
            while (lo < hi && nums[lo] === left) {
                lo++;
            }
            while (lo < hi && nums[hi] === right) {
                hi--;
            }
        }
    }

    return res;
};

/**
 * 三数之和，本质上，迭代+处理twoSumTarget
 */
var threeSumTarget = function (nums, target) {
    nums.sort();

    const n = nums.length;
    const res = [];
    for (let i = 0; i < n; i++) {
        // 找到符合要求的二元结果，下标是从 i+1开始
        const tuples = twoSumTarget(nums, i + 1, target - nums[i]);
        for (let val of tuples) {
            val.push(nums[i]);
            res.push(val);
        }
        // 跳过第一个数字重复的情况，否则会出现重复结果
        while (i < n - 1 && nums[i] === nums[i + 1]) {
            i++;
        }
    }

    return res;
};
