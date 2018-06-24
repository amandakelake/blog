// 给定一个排序数组，你需要在原地删除重复出现的元素，使得每个元素只出现一次，返回移除后数组的新长度。
// 不要使用额外的数组空间，你必须在原地修改输入数组并在使用 O(1) 额外空间的条件下完成。
/**
 * 
 * @param {Array} nums 
 * @return {Number}
 */

var removeDuplicates = function (nums) {
  var j = 0;
  var i = 0;
  for (l = nums.length; i < l; i++) {
    // 最后以j为索引的是去重后的数组
    if (nums[j] !== nums[i]) {
      // nums[i] 前面的都可以改变
      nums[++j] = nums[i];
    }
  }
  return j + 1;
};

// 下面是数组去重的几个方法

// for循环 + indexOf
function removeDuplicates_for_loop(arr) {
  let res = [];
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    if (res.indexOf(arr[i]) === -1) {
      res.push(arr[i]);
    }
  }
  return res;
}

// filter
function removeDuplicates_filter(arr) {
  let res = arr.filter((item, i, Array) => {
    // 对于重复的元素，返回的下标i是该元素第一次出现时的索引
    // 所以对于重复的元素，会返回false
    return Array.indexOf(item) === i;
  })
  return res;
}

// 对象
// 该方法没办法区分字符串和数字
function removeDuplicates_obj(arr) {
  let obj = {};
  arr.forEach(item => {
    obj[item] = null;
  });
  return Object.keys(obj);
}

// 对象+filter
function removeDuplicates_obj_2(arr) {
  let obj = {};
  // 把数组的值存成 Object 的 key 值
  // 再通过filter筛选出那些为true的值，就是去重后的数组
  return arr.filter(function (item, index, array) {
    // 因为字符串“1”和数组1对于对象的key来说是一样的
    // 所以需要使用 typeof item + item 拼成字符串作为 key 值来避免这个问题
    // 但是依然无法区分object类型，两个对象就是object[object Object]使用 JSON.stringify 将对象序列化
    return obj.hasOwnProperty(typeof item + JSON.stringify(item)) ? false : (obj[typeof item + JSON.stringify(item)] = true)
  })
}

// reduce
function removeDuplicates_reduce(arr) {
  // sort()是不稳定，默认排序顺序是根据字符串Unicode码点，如要按照数值大小，则需要compareFunction
  return arr.sort((a, b) => a - b).reduce((init, currentValue) => {
    // 判断新数组的最后一个值是否等于正在判断的当前值currentValue
    if (init.length === 0 || init[init.length - 1] !== currentValue) {
      init.push(currentValue);
    }
    return init;
  }, []);
}

// ES6 => Set
function removeDuplicates_Set(arr) {
  // return [...new Set(arr)];
  return Array.from(new Set(arr));
}


