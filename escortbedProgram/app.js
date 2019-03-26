 App({
  onLaunch: function () {
    // 获取用户的当前设置。返回值中只会出现小程序已经向用户请求过的权限。
    wx.getSetting({
      success: res => {
        console.log("获取用户设置成功");
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log("获取用户信息",res);
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
            },
            fail(err){
              console.log("get user info failed" ,err);
            },
            complete(res){
              console.log("get user info is completed",res);
            }
          })
        }
      },
      fail:(err) =>{
        console.log("获取用户设置失败",err);
      },
      complete: (res)=>{
        console.log("获取用户设置完成",res);
      }
    })
  },
  globalData: {
    userInfo: null , //全局用户信息
    orderInfo: null , //订单信息
    token: null , //token ,不解释
    deviceNum: null, //输入的设备号
    openSuccessAlert: false //开锁完成后的提示
  }
})
