/**
 * https://leetcode-cn.com/problems/valid-parentheses/
 * 有效的括号
 */
var isValid = function(s) {
    const map = {
        "{": "}",
        "(": ")",
        "[": "]"
    };

    const stack = [];
    for (let i = 0; i < s.length; i++) {
        if (map[s[i]]) {
            stack.push(s[i]);
        } else if (s[i] !== map[stack.pop()]) {
            return false;
        }
    }

    return stack.length === 0;
};
