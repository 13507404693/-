const Cmd = Cmd || {};

// ArrayBuffer转16进度字符串
Cmd.ab2hex = function (buffer) {
  let hexArr = Array.prototype.map.call(new Uint8Array(buffer), bit => ('00' + bit.toString(16)).slice(-2))
  return hexArr.join('')
}

//判断是否在数组中
Cmd.inArray = function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

/**
 * 切除 emoji表情
 * @param {String} str 
 */
Cmd.filterEmoji=function(str){
  return str.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
}

//设备电量
Cmd.cell = function () {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
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
Cmd.previousOrderA = function () {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
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

//下一个订单
Cmd.previousOrderB = function () {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
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
Cmd.lockState = function () {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
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
Cmd.machineState = function () {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
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
Cmd.versions = function () {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
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
//写入订单号命令
Cmd.order = function (arr){
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
  view.setUint8(0, arr[0])
  view.setUint8(1, arr[1])
  view.setUint8(2, arr[2])
  view.setUint8(3, arr[3])
  view.setUint8(4, arr[4])
  view.setUint8(5, arr[5])
  view.setUint8(6, arr[6])
  view.setUint8(7, arr[7])
  view.setUint8(8, arr[8])
  view.setUint8(9, arr[9])
  view.setUint8(10, arr[10])
  view.setUint8(11, arr[11])
  view.setUint8(12, arr[12])
  view.setUint8(13, arr[13])
  view.setUint8(14, arr[14])
  view.setUint8(15, arr[15])
  return buffer;
}

//写入消毒时间命令
Cmd.disinfection = function(arr){
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
  view.setUint8(0, arr[0])
  view.setUint8(1, arr[1])
  view.setUint8(2, arr[2])
  view.setUint8(3, arr[3])
  view.setUint8(4, arr[4])
  view.setUint8(5, arr[5])
  view.setUint8(6, arr[6])
  view.setUint8(7, arr[7])
  view.setUint8(8, arr[8])
  view.setUint8(9, arr[9])
  view.setUint8(10, arr[10])
  view.setUint8(11, arr[11])
  view.setUint8(12, arr[12])
  view.setUint8(13, arr[13])
  view.setUint8(14, arr[14])
  view.setUint8(15, arr[15])
  return buffer;
}
/**
 * 校准时间
 */
Cmd.ntp = function (arr){
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
  view.setUint8(0, arr[0])
  view.setUint8(1, arr[1])
  view.setUint8(2, arr[2])
  view.setUint8(3, arr[3])
  view.setUint8(4, arr[4])
  view.setUint8(5, arr[5])
  view.setUint8(6, arr[6])
  view.setUint8(7, arr[7])
  view.setUint8(8, arr[8])
  view.setUint8(9, arr[9])
  view.setUint8(10, arr[10])
  view.setUint8(11, arr[11])
  view.setUint8(12, arr[12])
  view.setUint8(13, arr[13])
  view.setUint8(14, arr[14])
  view.setUint8(15, arr[15])
  return buffer;
}
/**
 * 开锁指令
 */
Cmd.openLock = (arr) =>{
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16);

  view.setUint8(0, arr[0])
  view.setUint8(1, arr[1])
  view.setUint8(2, arr[2])
  view.setUint8(3, arr[3])
  view.setUint8(4, arr[4])
  view.setUint8(5, arr[5])
  view.setUint8(6, arr[6])
  view.setUint8(7, arr[7])
  view.setUint8(8, arr[8])
  view.setUint8(9, arr[9])
  view.setUint8(10, arr[10])
  view.setUint8(11, arr[11])
  view.setUint8(12, arr[12])
  view.setUint8(13, arr[13])
  view.setUint8(14, arr[14])
  view.setUint8(15, arr[15])
  return buffer;
}
/**
 * 关锁指令
 */
Cmd.closeLock = (arr) => {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
  view.setUint8(0, arr[0])
  view.setUint8(1, arr[1])
  view.setUint8(2, arr[2])
  view.setUint8(3, arr[3])
  view.setUint8(4, arr[4])
  view.setUint8(5, arr[5])
  view.setUint8(6, arr[6])
  view.setUint8(7, arr[7])
  view.setUint8(8, arr[8])
  view.setUint8(9, arr[9])
  view.setUint8(10, arr[10])
  view.setUint8(11, arr[11])
  view.setUint8(12, arr[12])
  view.setUint8(13, arr[13])
  view.setUint8(14, arr[14])
  view.setUint8(15, arr[15])
  return buff;
}


//获取蓝牙时间
Cmd.getTime = function () {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16)
  view.setUint8(0, 0xCB)
  view.setUint8(1, 0x10)
  view.setUint8(2, 0x0E)
  view.setUint8(3, 0x62)
  view.setUint8(4, 0xDE)
  view.setUint8(5, 0x87)
  view.setUint8(6, 0x61)
  view.setUint8(7, 0x97)
  view.setUint8(8, 0x04)
  view.setUint8(9, 0x56)
  view.setUint8(10, 0x52)
  view.setUint8(11, 0xCD)
  view.setUint8(12, 0x7D)
  view.setUint8(13, 0xFB)
  view.setUint8(14, 0x76)
  view.setUint8(15, 0xF7)
  return buffer
}

export default Cmd;