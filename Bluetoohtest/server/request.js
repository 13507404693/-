/*
  请求的封装
*/
const {json2Form}=require('../utils/util.js')
const { host } = require('../utils/api.js')


module.exports = class request{ 

  constructor(){ 
    //配置域名的
    // this.host ='https://192.168.99.74:8091/api/';
    this.host = host
  }

/**
 * get : 请求，
 * url : 接口
 */
  get_request(url,token){ 
    return new Promise((resole,reject)=>{ 
      wx.request({
        method: 'GET',
        url: this.host + url,
        header: {
          "content-type": "application/x-www-form-urlencoded",
          'Access-Token': token
        },
        success: resole,
        fail: reject
      }) 
    }) 
  }


/**
 * post : 请求,
 * url  : 接口,
 * data : 参数
 * token : 用户标识
 * 
 */
  post_request(url,data,token){
  return new Promise((resole, reject) => {
    wx.request({
      method: 'POST',
      url: this.host + url,
      data:data,
      header: {
        "content-type": "application/x-www-form-urlencoded",
        'Access-Token': token
      },
      success: resole,
      fail: reject
    })
  })
}


/**
 * post : 请求,
 * url  : 接口,
 * data : 参数
 * 
 */

  post_requestjsonForm(url, data){
    console.log(url)
    console.log(data)
    console.log(this.host)

    return new Promise((resole, reject) => {
      wx.request({
        method: 'POST',
        url: this.host + url,
        header:{
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: json2Form(data),
        success: resole,
        fail: reject
      })
    })
  }


}

