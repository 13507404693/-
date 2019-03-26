/*
所有请求的方法全部写在这个里面的
*/
const { host } = require('../utils/api.js')

module.exports = class apiData {
  constructor() {
    //配置域名的
    // this.host ='https://192.168.99.74:8091/api/';
     this.host=host
  }
    /*
      获取设备列表 
      method ： post 
      data   ： {}
    */
  queryList(data){ 
      return new Promise((resole, reject)=>{ 
        wx.request({
          method:'POST',
          url:`${this.host}btLock/queryList`,
          data:JSON.stringify(data),
          header: {
            "content-type": 'application/json',
            'Cookie': wx.getStorageSync("sessionId")
          },
          success:resole,
          fail: reject
        }) 
      })
    }

    /*
      获取设备列表 
      method ： post 
      data   ： {
                dev_id:
                start_time：毫秒数
                total_count: 总次数
                test_count: 当前次数
                platform : 平台
		          }
    */

  save(data) {
    return new Promise((resole, reject) => {
      wx.request({
        method: 'POST',
        url: `${this.host}testLog/save`,
        data: data,
        header: {
          "content-type": 'application/json',
          'Cookie': wx.getStorageSync("sessionId")
        },
        success: resole,
        fail: reject
      })
    })
  }

  update(data){
    return new Promise((resole, reject) => {
      wx.request({
        method: 'POST',
        url: `${this.host}testLog/update`,
        data: data,
        header: {
          "content-type": 'application/json',
          'Cookie': wx.getStorageSync("sessionId")
        },
        success: resole,
        fail: reject
      })
    })
  }



}

