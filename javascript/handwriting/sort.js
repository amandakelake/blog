/**
 * 分治算法 平均时间复杂度：O(nlogn)，空间复杂度 O(n)
 * 分解 - 解决 - 合并
 * 归并最后到底都是相邻元素之间的比较交换
 */
const mergeSort = (array) => {
    // 边界
    const mid = Math.floor(array.length / 2);
    const left = array.slice(0, mid);
    const right = array.slice(mid);

    const merge = (left, right) => {
        const result = [];
        // 直到两边数组都只有一个元素
        while (left.length > 0 && right.length > 0) {
            if (left[0] < right[0]) {
                result.push(left.shift()); // 把最小的最先取出，放到结果集中
            } else {
                result.push(right.shift());
            }
        }
        // 剩下的就是合并，这样就排好序了
        return result.concat(left).concat(right);
    };

    return merge(mergeSort(left), mergeSort(right));
};

/**
 * 不是一种稳定的排序算法,最好的情况也就是O(logn),最坏的情况是O(n)
 * 最差情况：已正序/倒序排过序，所有的元素都相同
 * 取出基准值，与基准比较切成左右两个数组，再递归处理
 */
const quickSort = (array) => {
    const mid = Math.floor(array.length / 2);
    const pivot = array.splice(mid, 1); // 直接取出
    // 根据pivot切割出两个数组，小于pivot的都在左边，大于pivot的都在右边
    const left = [];
    const right = [];

    for (let i = 0; i < array.length; i++) {
        if (array[i] < pivot) {
            left.push(array[i]);
        } else {
            right.push(array[i]);
        }
    }

    return quickSort(left).concat(pivot, quickSort(right));
}
