/**
 * 伪代码
 */
function fakeFn(S, T) {
    let left = 0;
    let right = 0;

    while (right < S.length) {
        // 增大窗口
        window.add(s[right]);
        right++;

        while (leftNeedShrink) {
            // 缩小窗口
            window.remove(s[left]);
            left++;
        }
    }
}

/**
 * 滑动窗口算法框架
 * @param S
 * @param T
 */
function slidingWindow(S, T) {
    // window 存当前窗口的字符
    const window = {};
    const need = {};
    // need中记录需要凑齐的字符
    for (const s of T) {
        if (need[s]) {
            need[s]++;
        } else {
            need[s] = 1;
        }
    }

    let left = 0;
    let right = 0;
    let valid = 0; // 表示窗口中满足need条件的字符个数，如果valid === need.length大小相同，说明已经完全覆盖了T

    while (right < S.length) {
        // c是将要移入窗口的字符
        let c = S[right];
        // 右移
        right++;

        // 一、此处进行窗口内数据更新

        // debug位置
        console.log(`left: ${left}, right: ${right}`);

        // 判断左边窗口是否需要收缩
        let leftNeedShrink = true;
        while (leftNeedShrink) {
            let d = S[left];
            // 左移
            left++;

            // 二、进行窗口内的数据更新
        }
    }
}


/**
 * https://leetcode-cn.com/problems/minimum-window-substring/solution/
 * 给你一个字符串 s 、一个字符串 t 。返回 s 中涵盖 t 所有字符的最小子串。如果 s 中不存在涵盖 t 所有字符的子串，则返回空字符串 "" 。
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
var minWindow = function (S, T) {
    // window 存当前窗口的字符
    const window = {};
    // need中记录需要凑齐的字符极其个数
    const need = {};
    for (let a of T) {
        // 统计需要的字符
        need[a] = (need[a] || 0) + 1;
    }


    // 避免循环读取
    const needLen = Object.keys(need).length

    let left = 0;
    let right = 0;
    // 表示窗口中满足need条件的字符个数，如果valid === need.length大小相同，说明已经完全覆盖了T
    let valid = 0;

    // 最小覆盖子串的起点以及长度
    let start = 0;
    let len = Number.MAX_VALUE;

    while (right < S.length) {
        let c = S[right];
        right++;

        // 更新窗口
        if (need[c]) {
            // 当前字符在需要的字符中，则更新当前窗口统计
            window[c] = (window[c] || 0) + 1;
            if (window[c] === need[c]) {
                // 当前窗口和需要的字符匹配时，验证数量增加1
                valid++;
            }
        }

        // 当验证数量与需要的字符个数一致时，就应该收缩窗口了
        while (valid === needLen) {
            if (right - left < len) {
                start = left;
                len = right - left;
            }
            let d = S[left]; // 即将要移走的字符
            left++;
            if (need[d]) {
                // 移走后，有一个字符不满足个数了，valid减一
                if (window[d] === need[d]) {
                    valid--;
                }
                window[d]--;
            }
        }
    }

    return len === Number.MAX_VALUE ? '' : S.substr(start, len);
};
