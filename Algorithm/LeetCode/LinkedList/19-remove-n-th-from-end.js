var findFromEnd = function (head, k) {
    var p1 = head;
    // p1 先走K步
    for (var i = 0; i < k; i++) {
        p1 = p1.next;
    }

    var p2 = head;
    // p1走到尽头，说明p2走了 n-k 步，也就是倒数第K个节点
    while (p1) {
        p2 = p2.next;
        p1 = p1.next;
    }

    return p2;
};

var removeNthFromEnd = function (head, n) {
    var dummy = new ListNode(-1);
    dummy.next = head;
    // 删除第n个，要先找到倒数第n+1个
    var x = findFromEnd(dummy, n + 1);
    x.next = x.next.next;
    return dummy.next;
};
