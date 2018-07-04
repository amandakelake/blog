class Node {
  constructor(v, next) {
    this.value = v
    this.next = next
  }
}

class DoubleLinkList {
  constructor() {
    // 链表长度
    this.size = 0
    // 虚拟头部
    this.dummyNode = new Node(null, null)
  }
  addNode(v, index) {
    this.checkIndex(index)
    let prev = this.dummyNode
    for (let i = 0; i < index; i++) {
      prev = prev.next
    }
    prev.next = new Node(v, prev.next)
    this.size++
    return prev.next
  }
  insertNode(v, index) {
    return this.addNode(v, index)
  }
  addToFirst(v) {
    return this.addNode(v, 0)
  }
  addToLast(v) {
    return this.addNode(v, this.size)
  }
  removeNode(index, isLast) {
    this.checkIndex(index)
    let prev = this.dummyNode
    index = isLast ? index - 1 : index
    for (let i = 0; i < index; i++) {
      prev = prev.next
    }
    let node = prev.next
    if (isLast) {
      prev.next = null
    } else {
      let next = prev.next
      prev.next = node.next
      node.next = null
    }
    this.size--
    return node
  }
  removeFirstNode() {
    return this.removeNode(0)
  }
  removeLastNode() {
    return this.removeNode(this.size, true)
  }
  checkIndex(index) {
    if (index < 0 || index > this.size) throw Error('Index error')
  }
  getNode(index) {
    this.checkIndex()
    if (this.isEmpty()) return
    let prev = this.dummyNode
    for (let i = 0; i < index; i++) {
      prev = prev.next
    }
    return prev
  }
  isEmpty() {
    return this.size === 0
  }
  getSize() {
    return this.size
  }
}
