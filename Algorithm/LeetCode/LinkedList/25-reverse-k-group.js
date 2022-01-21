/**
 * K个一组翻转链表
 * https://leetcode-cn.com/problems/reverse-nodes-in-k-group/solution/
 * 迭代，每K个就单独翻转，然后穿针引线连起来，不断往后走
 * @param head
 * @param k
 */
var reverseKGroup = function (head, k) {

    var reverseList = function(head) {
        if (!head || !head.next) {
            return head;
        }
        var last = reverseList(head.next);
        head.next.next = head;
        head.next = null;
        return last;
    };

    var dump = new ListNode(-1);
    dump.next = head;

    var pre = dump;
    var end = dump;

    while (end.next) {
        for (var i = 0; i < k && end; i++) {
            end = end.next;
        }
        if (!end) {
            break;
        }

        var start = pre.next;
        var next = end.next;

        // 断开连接
        end.next = null;
        // 翻转当前K个
        pre.next = reverseList(start);

        // 重新连接，穿针引线
        start.next = next;
        pre = start;
        end = pre;
    }

    return dump.next;
}


