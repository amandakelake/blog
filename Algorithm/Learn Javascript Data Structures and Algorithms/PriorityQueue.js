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
