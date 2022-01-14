function DoubleLinkedList() {
    var Node = function (element) {
        this.element = element;
        this.next = null;
        this.prev = null;
    };

    var length = 0;
    var head = null;
    var tail = null;

    /**
     * @param element any
     */
    this.append = function (element) {
        var node = new Node(element);
        var current;

        if (head === null) {
            head = node;
        } else {
            current = head;

            // 从头部元素开始往后查询
            while (current.next) {
                current = current.next;
            }

            // 在最后一个阶段后插入
            current.next = node;
        }

        length++;
    };

    /**
     *
     * @param position number
     * @param element any
     * @returns {boolean}
     */
    this.insert = function (position, element) {
        if (position < 0 || position > length) {
            return false;
        }

        var node = new Node(element);
        var current = head;
        var previous;
        var index = 0;

        if (position === 0) {
            if (!head) {
                head = node;
                tail = node;
            } else {
                node.next = current;
                current.prev = node;
                head = node;
            }
        } else if (position === length) {
            current = tail;
            current.next = node;
            node.prev = current;
        } else {
            while (index++ < position) {
                previous = current;
                current = current.next;
            }
            node.next = current;
            previous.next = node;

            current.prev = node;
            node.prev = previous;
        }

        length++;
        return true;
    };
    /**
     * @param position number
     * @returns {null|*}
     */
    this.removeAt = function (position) {
        if (position < 0 || position > length) {
            return null;
        }

        var current = head;
        var previous;
        var index = 0;

        if (position === 0) {
            head = current.next;
            if (length === 1) {
                tail = null;
            } else {
                head.prev = null;
            }
        } else if (position === length - 1) {
            current = tail;
            tail = current.prev;
            tail.next = null;
        } else {
            while (index++ < position) {
                previous = current;
                current = current.next;
            }

            // 跳过current，连接前后两个节点
            previous.next = current.next;
            current.next.prev = previous;
        }

        length--;
        return current.element;
    };
    this.remove = function (element) {
        var index = this.indexOf(element);
        return this.removeAt(index);
    };
    this.indexOf = function (element) {
        var current = head;
        var index = 0;
        while (current) {
            if (element === current.element) {
                return index;
            }
            index++;
            current = current.next;
        }
        return -1;
    };
    this.isEmpty = function () {
        return length === 0;
    };
    this.size = function () {
        return length;
    };
    this.getHead = function () {
        return head;
    };
    this.toString = function () {
        var current = head;
        var string = '';

        while (current) {
            string += ',' + current.element;
            current = current.next;
        }

        return string.slice(1);
    };
    this.print = function () {
        console.log(this.toString());
    };
}
