var swapPairs = function(head) {
    if(!head || !head.next) {
        return head;
    }

    var tmp = head.next;
    // 递归只捋第一层的关系
    head.next = swapPairs(tmp.next);
    tmp.next = head;

    return tmp;
};
