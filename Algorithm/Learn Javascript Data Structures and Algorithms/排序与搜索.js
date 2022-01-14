function ArrayList() {
    let array = [];

    this.insert = (item) => {
        array.push(item);
    };

    this.toString = () => {
        return array.join();
    };

    // 先定义一个内部swap方法 用于交换数组中的两个值
    const swap = function (index1, index2) {
        const aux = array[index1];
        array[index1] = array[index2];
        array[index2] = aux;
    };

    // 冒泡算法
    // 比较任意两个相邻的项，如果第一个比第二个大，则交换顺序
    var bubbleSort = function () {
        const len = array.length;
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < len - 1; j++) {
                if (array[j] > array[j + 1]) {
                    swap(j, j + 1);
                }
            }
        }
    };
    // 改进一下，从内循环中减去外循环中已跑过的轮数
    var modifiedBubbleSort = function () {
        const len = array.length;
        for (let i = 0; i < len; i++) {
            // 看这里j < len - 1 - i
            for (let j = 0; j < len - 1 - i; j++) {
                if (array[j] > array[j + 1]) {
                    swap(j, j + 1);
                }
            }
        }
    };

    // 选择排序
    // 找到数组中最小的项并将其放到第一位，找到第二小的值，并将其放到第二位，依次……
    var selectionSort = function () {
        const len = array.length;
        let indexMin; // 最小值下标
        for (let i = 0; i < len - 1; i++) {
            // 假设当前遍历的是最小值
            indexMin = i;
            // 前面已经拍过序的不用再循环了
            for (let j = i; j < len; j++) {
                // 依次比较，交换最小值下标
                if (array[indexMin] > array[j]) {
                    indexMin = j;
                }
            }
            // 如果找到的最小值跟原来设定的最小值不一样，交换其值
            if (i !== indexMin) {
                swap(i, indexMin);
            }
        }
    };

    // 插入排序
    // 每次只排序一个数组项，确定它应该插入到哪个位置
    var insertionSort = function () {
        let j, temp;
        // 默认第一项已经排序，所以从第二项开始
        for (let i = 1; i < array.length; i++) {
            // 辅助变量和值，存储当前下标和值
            j = i;
            temp = array[i];
            // 一直跟前一项比较，直到找到正确的位置插入
            while (j > 0 && array[j - 1] > temp) {
                // 移到当前位置
                array[j] = array[j - 1];
                j--;
            }
            array[j] = temp;
        }
    };

    // 归并排序（分治）
    // * 将数组拆分成较小的数组，直到每个数组的长度为1；
    // * 合并和排序小数组，直到回到原始数组的长度；
    var mergeSort = function () {
        // 递归的停止条件
        if (array.length == 1) {
            return array;
        }
        // 中间值取整，分成两个小组
        var middle = Math.floor(array.length / 2),
            left = array.slice(0, middle),
            right = array.slice(middle);
        // 递归，对左右两部分数据进行合并排序
        return merge(mergeSort(left), mergeSort(right));
    };

    // 辅助函数需要函数提升，所以使用function() {...}
    function merge(left, right) {
        var result = [];
        while (left.length > 0 && right.length > 0) {
            // 比较左边的数组的值是否被右边的小
            if (left[0] < right[0]) {
                result.push(left.shift());
            } else {
                result.push(right.shift());
            }
        }
        return result.concat(left).concat(right);
    }

    // 快速排序（分治）
    // * 从数组中选择中间项目作为主元
    // * 建立左右两个数组，分别存储左边和右边的数组
    // * 利用递归进行下次比较
    var quickSort = function () {
        if (array.length <= 1) {
            return array;
        }
        // 取中间数作为基准索引，浮点数向下取整
        var index = Math.floor(array.length / 2);
        // 取得该值
        var pivot = array.splice(index, 1);
        // 分别建立左右空数组，作为push所用
        var left = [];
        var right = [];
        for (var i = 0; i < array.length; i++) {
            // 基准左边的传到左数组,右边的传到右数组
            if (array[i] < pivot) {
                left.push(array[i]);
            } else {
                right.push(array[i]);
            }
        }
        // 不断递归重复比较
        return quickSort(left).concat(pivot, quickSort(right));
    };


    // 搜索-顺序搜索
    var sequentialSearch = function (item) {
        for (let i = 0; i < array.length; i++) {
            if (item === array[i]) {
                return i;
            }
        }
        return -1;
    };

    // 搜索-二分搜索
    // 选择数组的中间值
    // 如果选中值是待搜索值，那么算法执行完毕（值找到了）。
    // 如果待搜索值比选中值要小，则返回步骤1并在选中值左边的子数组中寻找
    // 如果待搜索值比选中值要大，则返回步骤1并在选种值右边的子数组中寻找
    var binarySearch = function (item) {
        // 先将数组进行排序
        this.quickSort();

        let low = 0, hight = array.length - 1, mid, element;

        while (low <= high) {
            // 取中间值
            mid = Math.floor((low + high) / 2);
            element = array[mid];
            if (element < item) {
                low = mid + 1;
            } else if (element > item) {
                high = mid - 1;
            } else {
                return mid;
            }
        }

        return -1;
    };
}
