var reverse = function (head) {
    if (!head || !head.next) {
        return head;
    }
    var last = reverse(head.next);
    head.next.next = head;
    head.next = null;
    return last;
};

/**
 * 截取区间进行反转，再接起三部分
 */
var reverseBetween1 = function (head, left, right) {
    var dump = new ListNode(-1);
    dump.next = head;

    var pre = dump;
    // 1、来到 left前一个节点
    for (var i = 0; i < left - 1; i++) {
        pre = pre.next;
    }

    // 2、来到 right 节点
    var rightNode = pre;
    for (var i = 0; i < right - left + 1; i++) {
        rightNode = rightNode.next;
    }

    // 3、切出子链表
    var leftNode = pre.next;
    var cur = rightNode.next;

    // 切断，只留下中间部分
    pre.next = null;
    rightNode.next = null;

    reverse(leftNode);

    // 接骨
    pre.next = rightNode;
    leftNode.next = cur;
    return dump.next;
};

/**
 * 迭代，依次将要迭代的元素放到区间的第一位
 */
var reverseBetween = function (head, left, right) {
    var dump = new ListNode(-1);
    dump.next = head;

    var pre = dump;
    for (var i = 0; i < left -1; i++) {
        pre = pre.next;
    }

    var cur = pre.next;
    for (var i = 0; i < right -left; i++) {
        const next = cur.next;
        cur.next = next.next;
        next.next = pre.next;
        pre.next = next;
    }
    return dump.next;
};
