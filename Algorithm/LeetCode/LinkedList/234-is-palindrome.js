/**
 * https://leetcode-cn.com/problems/palindrome-linked-list/
 * 给你一个单链表的头节点 head ，请你判断该链表是否为回文链表。如果是，返回 true ；否则，返回 false 。
 * @param head
 * @returns {boolean}
 */
var isPalindrome = function(head) {
    var arr = [];
    while (head) {
        arr.push(head.val);
        head = head.next;
    }

    for (var i = 0, j = arr.length - 1; i < j; i++, j--) {
        if (arr[i] !== arr[j]) {
            return false;
        }
    }
    return true;
};

// 方法一：将值复制到数组中后用双指针，时间和空间复杂度都是O(n)
// 方法二：将原始链表反转存入一条新的链表，然后比较两条链表
// 方法三：快慢指针找到中间节点，反转前半段，比较前半段和后半段

var isPalindrome3 = function(head) {
    if (!head || !head.next) {
        return true;
    }

    // 1、快慢指针找出中间点
    var fast = head;
    var slow = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    // 如果链表长度是奇数，让slow指向后半段的起点
    if (fast) {
        slow = slow.next;
    }

    // 2、反转后半段
    var left = head;
    var right = reverseList(slow); // 之前实现过的反转链表

    // 3、对比两段
    while(right) {
        if (left.val !== right.val) {
            return false;
        }
        left = left.next;
        right = right.next;
    }

    return true;
};
