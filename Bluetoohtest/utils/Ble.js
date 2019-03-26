//isBluetoothOpen

const Ble = Ble || {}
Ble.deviceId = ''
Ble.advertisData = ''
Ble.serviceId = '0000FFF0-0000-1000-8000-00805F9B34FB'
Ble.characteristicId = '0000FFF6-0000-1000-8000-00805F9B34FB'
Ble.context = null;
Ble.funk = false;
Ble.openFlag = false;
Ble.totalTestCount = 0; //总测试次数
Ble.currentTestCount = 0; //当前测试次数
Ble.ab2hex = function (buffer) { //截取到
  let hexArr = Array.prototype.map.call(new Uint8Array(buffer), bit => ('00' + bit.toString(16)).slice(-2))
  // ArrayBuffer转16进度字符串示例
  return hexArr.join('')
}
// 初始化蓝牙
Ble.startConnect = function (_this) {

  wx.showLoading({
    title: '蓝牙连接中',
  })

  this.context = _this
  wx.closeBluetoothAdapter()// 关闭蓝牙模块
  wx.openBluetoothAdapter({ //初始化 蓝牙模块  成功 和 失败的回调
    success: res => {
      console.log('初始化蓝牙成功' + res)
      this.context.setData({ bluetoothState: true })
      this.getBluetoothAdapterState()
    },
    fail: err => {
      wx.hideLoading();
      this.context.setData({ bluetoothState: false })
    }
  })
}

//这是点击关闭锁的时候调用
Ble.startConnectend = function (_this) {
  this.context = _this
  wx.closeBluetoothAdapter() // 关闭蓝牙模块
  wx.openBluetoothAdapter({ //初始化 蓝牙模块  成功 和 失败的回调
    success: res => {
      console.log('初始化蓝牙成功' + res)
      this.context.setData({ bluetoothState: true })
      this.getBluetoothAdapterState()
    },
    fail: err => {
      consolelog(JSON.stringify(err))
      wx.hideLoading();
      this.context.setData({ bluetoothState: false })
    }
  })
}

Ble.getBluetoothAdapterState = function () {
  wx.getBluetoothAdapterState({  //获取本机蓝牙适配器状态 
    success: res => {
      console.log('蓝牙状态', res)
      //discovering 是否正在搜索设备   available 蓝牙适配器是否可用 
      if (res.available == false) {
        wx.showToast({
          title: '设备无法开启蓝牙连接',
          icon: 'none'
        })
      } else {
        if (res.discovering == false) {
          this.startBluetoothDevicesDiscovery()
        }
      }
    },fail:function(err){
      consolelog(JSON.stringify(err))
    }
  })
}

Ble.startBluetoothDevicesDiscovery = function () {
  wx.startBluetoothDevicesDiscovery({ //开始搜寻附近的蓝牙外围设备 
    services: [this.serviceId], //搜索对应设备的id   以微信硬件平台的蓝牙智能灯为例，主服务的 UUID 是 FEE7。传入这个参数，只搜索主服务 UUID 为 FEE7 的设备
    allowDuplicatesKey: false,
    success: res => {
      console.log(res)
      if (!res.isDiscovering) {
        this.getBluetoothAdapterState()
      } else {
        this.onBluetoothDeviceFound() //设备参数返回成功 就去执行搜索设备

      }
    },
    fail: err => {
      this.stopBluetoothDevicesDiscovery()
    }
  })
}

Ble.onBluetoothDeviceFound = function () { //搜索相对应的设备
  const that = this;
  wx.onBluetoothDeviceFound((res) => {
    console.log('搜索到的设备没配对成功有', res)
    res.devices.forEach(device => {
      let _advertisData = this.ab2hex(device.advertisData) //得到设备的mac地址

      console.log('my', that.advertisData)
      console.log('you', _advertisData)
      if (_advertisData == that.advertisData) {
        console.log('条件配对成功设备已搜索到', device)
        // this.context.connectCallBack('1');
        this.context.callBack('1')
        that.deviceId = device.deviceId;
        that.stopBluetoothDevicesDiscovery() //设备已经搜索到，停止搜索
        console.log('设备已经搜索到，停止搜索')
        that.createBLEConnection()
      }
    })
  })
}

Ble.createBLEConnection = function () {
  console.log('dev111' + this.deviceId)
  wx.createBLEConnection({
    deviceId: this.deviceId,
    success: res => {
      console.log('连接', res)
      if (res.errCode == 0) {
        wx.hideLoading() //连接成功  关闭提示狂
        wx.showToast({
          title: '蓝牙连接设备成功',
          icon: 'none'
        })
        this.getBLEDeviceServices(this.deviceId)
      }
    },
    fail: err => {

      console.log('连接失败：', err)

      wx.hideLoading()
      wx.showToast({
        title: '连接失败,请重试',
        icon: 'none',
        duration: 2000
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 2100)

      //this.startConnectDevices()

    }
  })
}

Ble.getBLEDeviceServices = function (deviceId) {
  wx.getBLEDeviceServices({
    deviceId,
    success: (res) => {
      console.log('服务', res)
      this.getBLEDeviceCharacteristics(this.deviceId, this.serviceId)
      // for (let i = 0; i < res.services.length; i++) {
      //   if (res.services[i].isPrimary) {
      //     this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
      //   }
      // }
    }
  })
}

Ble.getBLEDeviceCharacteristics = function (deviceId, serviceId) {
  wx.getBLEDeviceCharacteristics({
    deviceId,
    serviceId,
    success: (res) => {
      console.log('特征值', res.characteristics)
      for (let i = 0; i < res.characteristics.length; i++) {
        let item = res.characteristics[i]
        if (item.uuid == this.characteristicId) {
          this.notifyBLECharacteristicValueChange(this.deviceId, this.serviceId, this.characteristicId)
          //this.context.connectCallBack()
        }
      }
    },
    fail(res) {
      console.error('getBLEDeviceCharacteristics', res)
    }
  })
}

//开锁
Ble.writeBLECharacteristicValue = function (deviceId, serviceId, buffer) {
  
  console.log('characteristicId' + this.characteristicId);
  console.log('deviceId' + deviceId)
  console.log('serviceId' + serviceId)
  console.log(buffer)
  console.log(JSON.stringify(buffer));

  return new Promise((resolve, reject) => {
    wx.writeBLECharacteristicValue({
      deviceId,//设备的 id 
      serviceId, //0000FFF0-0000-1000-8000-00805F9B34FB
      characteristicId: this.characteristicId,//0000FFF6-0000-1000-8000-00805F9B34FB
      value: buffer,//蓝牙设备特征值对应的二进制值
      success: res => { resolve(res) },
      fail: err => { reject(err) }
    })
  })
}

Ble.notifyBLECharacteristicValueChange = function (deviceId, serviceId, characteristicId) {
  wx.notifyBLECharacteristicValueChange({
    state: true,
    deviceId,
    serviceId,
    characteristicId,
    success: res => {
      console.log('监听成功：', res)
      this.onBLECharacteristicValueChange()
    }
  })
}

Ble.onBLECharacteristicValueChange = function () {
  wx.onBLECharacteristicValueChange(res => {
    console.log('123')
    console.log('监听值', this.ab2hex(res.value))
    this.context.callBack(this.ab2hex(res.value))
  })
}

Ble.stopBluetoothDevicesDiscovery = function () {
  console.log('停止搜索')
  // wx.stopBluetoothDevicesDiscovery()
  wx.stopBluetoothDevicesDiscovery({ 
    success:function(res){ 
      console.log(res)
    },fail:function(err){ 
      JSON.stringify(err)
    },complete:function(res){ 
      console.log('停止搜索执行',res)
    }
  })
}

// 开锁
// Ble.unlocking = function () {
//   let buffer = new ArrayBuffer(16)
//   let view = new DataView(buffer, 0, 16)
//   view.setUint8(0, '0xd1')
//   view.setUint8(1, '0x01')
//   view.setUint8(2, '0x06')
//   view.setUint8(3, '0x30')
//   view.setUint8(4, '0x30')
//   view.setUint8(5, '0x30')
//   view.setUint8(6, '0x30')
//   view.setUint8(7, '0x30')
//   view.setUint8(8, '0x30')
//   view.setUint8(9, '0x00')
//   view.setUint8(10, '0x00')
//   view.setUint8(11, '0x00')
//   view.setUint8(12, '0x00')
//   view.setUint8(13, '0x00')
//   view.setUint8(14, '0x00')
//   view.setUint8(15, '0x00')
//   return buffer
// }

//设备电量
Ble.cell = function () {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
  // view.setUint8(0, 0xD4)
  // view.setUint8(1, 0x01)
  // view.setUint8(2, 0x01)
  // view.setUint8(3, 0x01)
  // view.setUint8(4, 0x00)
  // view.setUint8(5, 0x00)
  // view.setUint8(6, 0x00)
  // view.setUint8(7, 0x00)
  // view.setUint8(8, 0x00)
  // view.setUint8(9, 0x00)
  // view.setUint8(10, 0x00)
  // view.setUint8(11, 0x00)
  // view.setUint8(12, 0x00)
  // view.setUint8(13, 0x00)
  // view.setUint8(14, 0x00)
  // view.setUint8(15, 0x00)
  view.setUint8(0, 0xDC)
  view.setUint8(1, 0x01)
  view.setUint8(2, 0x6E)
  view.setUint8(3, 0xA5)
  view.setUint8(4, 0x89)
  view.setUint8(5, 0xEB)
  view.setUint8(6, 0xA8)
  view.setUint8(7, 0xF5)
  view.setUint8(8, 0x59)
  view.setUint8(9, 0x5F)
  view.setUint8(10, 0xBD)
  view.setUint8(11, 0xEA)
  view.setUint8(12, 0x92)
  view.setUint8(13, 0x75)
  view.setUint8(14, 0xB2)
  view.setUint8(15, 0xBD)
  return buffer
}

//上一个订单
Ble.previousOrderA = function () {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
  // view.setUint8(0, 0xDb)
  // view.setUint8(1, 0x01)
  // view.setUint8(2, 0x01)
  // view.setUint8(3, 0x01)
  // view.setUint8(4, 0x00)
  // view.setUint8(5, 0x00)
  // view.setUint8(6, 0x00)
  // view.setUint8(7, 0x00)
  // view.setUint8(8, 0x00)
  // view.setUint8(9, 0x00)
  // view.setUint8(10, 0x00)
  // view.setUint8(11, 0x00)
  // view.setUint8(12, 0x00)
  // view.setUint8(13, 0x00)
  // view.setUint8(14, 0x00)
  // view.setUint8(15, 0x00)
  view.setUint8(0, 0xB9)
  view.setUint8(1, 0x43)
  view.setUint8(2, 0x00)
  view.setUint8(3, 0x28)
  view.setUint8(4, 0x71)
  view.setUint8(5, 0x20)
  view.setUint8(6, 0x83)
  view.setUint8(7, 0xD9)
  view.setUint8(8, 0xDB)
  view.setUint8(9, 0x93)
  view.setUint8(10, 0x8F)
  view.setUint8(11, 0xE1)
  view.setUint8(12, 0xE6)
  view.setUint8(13, 0x33)
  view.setUint8(14, 0xED)
  view.setUint8(15, 0xC5)
  return buffer
}
Ble.previousOrderB = function () {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
  // view.setUint8(0, 0xDc)
  // view.setUint8(1, 0x01)
  // view.setUint8(2, 0x01)
  // view.setUint8(3, 0x01)
  // view.setUint8(4, 0x00)
  // view.setUint8(5, 0x00)
  // view.setUint8(6, 0x00)
  // view.setUint8(7, 0x00)
  // view.setUint8(8, 0x00)
  // view.setUint8(9, 0x00)
  // view.setUint8(10, 0x00)
  // view.setUint8(11, 0x00)
  // view.setUint8(12, 0x00)
  // view.setUint8(13, 0x00)
  // view.setUint8(14, 0x00)
  // view.setUint8(15, 0x00)
  view.setUint8(0, 0x75)
  view.setUint8(1, 0x7A)
  view.setUint8(2, 0xCE)
  view.setUint8(3, 0xBC)
  view.setUint8(4, 0x62)
  view.setUint8(5, 0x56)
  view.setUint8(6, 0xEB)
  view.setUint8(7, 0x12)
  view.setUint8(8, 0xD6)
  view.setUint8(9, 0xCF)
  view.setUint8(10, 0x33)
  view.setUint8(11, 0x0B)
  view.setUint8(12, 0x61)
  view.setUint8(13, 0xC3)
  view.setUint8(14, 0xFB)
  view.setUint8(15, 0x13)
  return buffer
}

//锁状态
Ble.lockState = function () {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
  // view.setUint8(0, 0xd2)
  // view.setUint8(1, 0x01)
  // view.setUint8(2, 0x01)
  // view.setUint8(3, 0x01)
  // view.setUint8(4, 0x00)
  // view.setUint8(5, 0x00)
  // view.setUint8(6, 0x00)
  // view.setUint8(7, 0x00)
  // view.setUint8(8, 0x00)
  // view.setUint8(9, 0x00)
  // view.setUint8(10, 0x00)
  // view.setUint8(11, 0x00)
  // view.setUint8(12, 0x00)
  // view.setUint8(13, 0x00)
  // view.setUint8(14, 0x00)
  // view.setUint8(15, 0x00)
  view.setUint8(0, 0xB1)
  view.setUint8(1, 0x4A)
  view.setUint8(2, 0x3F)
  view.setUint8(3, 0xF7)
  view.setUint8(4, 0x32)
  view.setUint8(5, 0x55)
  view.setUint8(6, 0x05)
  view.setUint8(7, 0xEE)
  view.setUint8(8, 0x2A)
  view.setUint8(9, 0x6B)
  view.setUint8(10, 0x98)
  view.setUint8(11, 0xF4)
  view.setUint8(12, 0x3C)
  view.setUint8(13, 0xD3)
  view.setUint8(14, 0x8B)
  view.setUint8(15, 0xA9)
  return buffer
}

//柜机状态
Ble.machineState = function () {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
  // view.setUint8(0, 0xD5)
  // view.setUint8(1, 0x01)
  // view.setUint8(2, 0x01)
  // view.setUint8(3, 0x01)
  // view.setUint8(4, 0x00)
  // view.setUint8(5, 0x00)
  // view.setUint8(6, 0x00)
  // view.setUint8(7, 0x00)
  // view.setUint8(8, 0x00)
  // view.setUint8(9, 0x00)
  // view.setUint8(10, 0x00)
  // view.setUint8(11, 0x00)
  // view.setUint8(12, 0x00)
  // view.setUint8(13, 0x00)
  // view.setUint8(14, 0x00)
  // view.setUint8(15, 0x00)
  view.setUint8(0, 0x8C)
  view.setUint8(1, 0xEE)
  view.setUint8(2, 0x3A)
  view.setUint8(3, 0x69)
  view.setUint8(4, 0x9E)
  view.setUint8(5, 0xD3)
  view.setUint8(6, 0x86)
  view.setUint8(7, 0x72)
  view.setUint8(8, 0xA3)
  view.setUint8(9, 0x97)
  view.setUint8(10, 0xE7)
  view.setUint8(11, 0xC0)
  view.setUint8(12, 0xA6)
  view.setUint8(13, 0x39)
  view.setUint8(14, 0x8A)
  view.setUint8(15, 0xFA)
  return buffer
}

//版本号
Ble.versions = function () {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
  // view.setUint8(0, 0xD6)
  // view.setUint8(1, 0x01)
  // view.setUint8(2, 0x01)
  // view.setUint8(3, 0x01)
  // view.setUint8(4, 0x00)
  // view.setUint8(5, 0x00)
  // view.setUint8(6, 0x00)
  // view.setUint8(7, 0x00)
  // view.setUint8(8, 0x00)
  // view.setUint8(9, 0x00)
  // view.setUint8(10, 0x00)
  // view.setUint8(11, 0x00)
  // view.setUint8(12, 0x00)
  // view.setUint8(13, 0x00)
  // view.setUint8(14, 0x00)
  // view.setUint8(15, 0x00)
  view.setUint8(0, 0xC1)
  view.setUint8(1, 0x14)
  view.setUint8(2, 0x1E)
  view.setUint8(3, 0x4F)
  view.setUint8(4, 0x29)
  view.setUint8(5, 0x35)
  view.setUint8(6, 0xA8)
  view.setUint8(7, 0x3E)
  view.setUint8(8, 0x19)
  view.setUint8(9, 0x5F)
  view.setUint8(10, 0x40)
  view.setUint8(11, 0xDD)
  view.setUint8(12, 0xA2)
  view.setUint8(13, 0x61)
  view.setUint8(14, 0xEE)
  view.setUint8(15, 0xC7)
  return buffer
}

export default Ble
