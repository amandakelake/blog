class Car {
  constructor(num) {
    this.num = num;
  }
}

class Camera {
  shot(car) {
    return {
      num: car.num,
      inTime: Date.now()
    }
  }
}

class Screen {
  show(car, inTime) {
    console.log()
  }
}

class Park {
  constructor(floors) {
    this.floors = floors || []
    this.camera = new Camera()
    this.screen = new Screen()
    this.carList = {} // 存储摄像头返回的车辆信息
  }
  in(car) {}
  out(car) {}
  emptyNum() {
    return this.floors.map(floor => {
      return `${floor.index}层还有${floor.emptyPlaceNum()个空闲车位}`
    }).join('\n')
  }
}

// 层
class Floor {
  constructor(index, places) {
    this.index = index;
    this.places = places || []
  }
  emptyPlaceNum() {
    let num = 0;
    this.places.forEach(p => {
      if (p.empty) {
        num += 1;
      }
      return num;
    })
  }
}

// 车位
class Place {
  constructor() {
    this.empty = true
  }
  in() {
    this.empty = false;
  }
  out() {
    this.empty = true;
  }
}