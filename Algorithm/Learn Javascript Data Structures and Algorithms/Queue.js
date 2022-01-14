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

var queue = new Queue();
queue.enqueue(1);
queue.print();
queue.enqueue(2);
queue.print();
queue.dequeue();
queue.print();
