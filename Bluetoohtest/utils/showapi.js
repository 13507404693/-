module.exports= class showapi{ 
  constructor() {
    this.host = 'https://bed.leagoohealth.com/program';//正式环境 
    this.hostce = '';//测试环境
    }

/* 
  开锁设备 返回订单号
  deviceNum  (number)  设备号
*/
  queryBedByDeviceNum(devicenum){ 
    console.log(devicenum)
    return new Promise((resolve, reject) => {
      wx.request({
        method: 'POST',
        url: `${this.host}/handle/openLock`,
        data: {
          deviceNum:devicenum
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'Access-Token': wx.getStorageSync('token')
        },
        success: res => { resolve(res) },
        fail: err => { reject(err) }
      })   
    })

  }


}



