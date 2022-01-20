// 迭代法
var reverseList1 = function(head) {
    var cur = head;
    var pre = null;
    var tmp = null; // 用来辅助交换

    // 不断遍历cur
    while (cur) {
        tmp = cur.next;
        // 每次迭代都将cur的next指向pre
        cur.next = pre;
        // pre和cur分别前进一步
        pre = cur;
        cur = tmp;
    }

    return pre;
};

// 递归法
var reverseList = function(head) {
    if (!head || !head.next) {
        return head;
    }
    // 递归, 只看第一层（详细后面都是正确的），不要继续往后压栈去想
    var last = reverseList(head.next);
    // 只要处理头结点即可
    head.next.next = head;
    head.next = null;
    return last;
};
