
/**
 * {@link https://leetcode-cn.com/problems/merge-k-sorted-lists/solution/}
 * 给你一个链表数组，每个链表都已经按升序排列。
 * 请你将所有链表合并到一个升序链表中，返回合并后的链表。
 * @param lists
 * @returns {*|null}
 */

/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */

var mergeKLists = function (lists) {
    let n = lists.length;
    if (n === 0) return null;
    let mergeTwoLists = (l1, l2) => {
        if (l1 == null) return l2;
        if (l2 == null) return l1;
        if (l1.val <= l2.val) {
            l1.next = mergeTwoLists(l1.next, l2);
            return l1;
        } else {
            l2.next = mergeTwoLists(l1, l2.next);
            return l2;
        }
    };
    let merge = (left, right) => {
        if (left === right) return lists[left];
        let mid = (left + right) >> 1;
        let l1 = merge(left, mid);
        let l2 = merge(mid + 1, right);
        return mergeTwoLists(l1, l2);
    };
    return merge(0, n - 1);
};
