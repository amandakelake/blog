# 用JS实现基础数据结构(栈、队列、单双链表、二叉搜索树)

## Stack
```js
function Stack() {
    var items = [];

    this.push = function (element) {
        items.push(element);
    };

    this.pop = function () {
        return items.pop();
    };

    this.peek = function () {
        return items[items.length - 1];
    };

    this.isEmpty = function () {
        return items.length === 0;
    };

    this.size = function () {
        return items.length;
    };

    this.clear = function () {
        items = [];
    };

    this.print = function () {
        console.log(items.toString());
    };
}
```

## Queue
```js
function Queue() {
    var items = [];

    this.enqueue = function (element) {
        items.push(element);
    };

    /**
     * 移除队列第一项
     */
    this.dequeue = function () {
        return items.shift();
    };

    /**
     * 返回队列中第一个元素
     */
    this.front = function () {
        return items[0];
    };

    this.isEmpty = function () {
        return items.length === 0;
    };

    this.clear = function () {
        items = [];
    };

    this.size = function () {
        return items.length;
    };

    this.print = function () {
        console.log(items.toString());
    };
}
```

## 优先队列
```js
function PriorityQueue() {
    var items = [];

    /**
     * 优先队列元素带有priority
     * @param element any
     * @param priority number
     */
    function QueueElement(element, priority) {
        this.element = element;
        this.priority = priority;
    }

    this.enqueue = function (element, priority) {
        var queueElement = new QueueElement(element, priority);

        if (this.isEmpty()) {
            items.push(queueElement);
        } else {
            var added = false;
            // 如果找到优先级更高的元素，在当前位置插入即可
            for (var i = 0; i < items.length; i++) {
                if (priority < items[i].priority) {
                    items.splice(i, 0, queueElement);
                    added = true;
                    // 找到一个就可以终止循环了
                    break;
                }
            }

            // 没找到优先级更高的，直接往队列最后推
            if (!added) {
                items.push(queueElement);
            }
        }
    };

    this.dequeue = function () {
        return items.shift();
    };

    this.front = function () {
        return items[0];
    };

    this.isEmpty = function () {
        return items.length === 0;
    };

    this.clear = function () {
        items = [];
    };

    this.size = function () {
        return items.length;
    };

    this.print = function () {
        console.log(items.toString());
    };
}
```

## 单链表
```js
function SingleLinkedList() {

    var Node = function (element) {
        this.element = element;
        this.next = null;
    };

    var length = 0;
    var head = null;

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
            node.next = current;
            head = node;
        } else {
            while (index++ < position) {
                previous = current;
                current = current.next;
            }
            node.next = current;
            previous.next = node;
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
        } else {
            while (index++ < position) {
                previous = current;
                current = current.next;
            }

            // 跳过current，连接前后两个节点
            previous.next = current.next;
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
```

## 双链表
```js
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
```

## 二叉搜索树
```js
function BinarySearchTree() {
    var Node = function (key) {
        this.key = key;
        this.left = null;
        this.right = null;
    };

    var root = null;

    this.insert = function (key) {
        var newNode = new Node(key);

        if (root === null) {
            root = newNode;
        } else {
            insertNode(root, newNode);
        }
    };

    var insertNode = function (node, newNode) {
        if (newNode.key < node.key) {
            if (node.left === null) {
                node.left = newNode;
            } else {
                insertNode(node.left, newNode);
            }
        } else {
            if (node.right === null) {
                node.right = newNode;
            } else {
                insertNode(node.right, newNode);
            }
        }
    };

}
```
