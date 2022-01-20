class Scheduler {
    constructor(limit) {
        this.limit = limit;
        this.number = 0;
        this.queue = [];
    }

    addTask(timeout, str) {
        this.queue.push([timeout, str]);
    }

    start() {
        if (this.number < this.limit && this.queue.length) {
            var [timeout, str] = this.queue.shift();
            this.number++;
            setTimeout(() => {
                console.log(str);
                this.number--;
                this.start();
            }, timeout * 1000);
            this.start();
        }
    }
}
