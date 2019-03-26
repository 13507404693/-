// pages/detail/detail.js
const app = getApp()
import BleOpenUtils from '../../utils/BleOpenUtils.js';
import Cmd from '../../utils/Cmd.js';
import Api from '../../utils/api.js';
//开锁界面
Page({
  /**
   * 页面的初始数据
   */
  data: {
    deviceInfo: null,
    cashState: false,
    orderNo: '',
    bluetoothState: true,
    advertisData: '',
    deviceId: '',
    chs: [],
    numi: 1,
    openSuccessFlag: false,
    alertDialog: false,
    alertText: null,
    flngclick:true
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      deviceInfo: app.globalData.ble_cmds
    })
    //连接蓝牙
    const that = this;
    BleOpenUtils.openBleStartConnect(false, function(flag) {
        //显示蓝牙提示
        that.setData({
          bluetoothState: flag
        });
      }, app.globalData.token,
      app.globalData.ble_cmds.secretKey,
      app.globalData.ble_cmds,
      app.globalData.deviceNum,
      that.openSuccess
    );
  },
  checkBluetooth() {
    const that = this;
    wx.openBluetoothAdapter({
      success(res) {
        that.setData({
          bluetoothState: true
        })
        console.log("蓝牙已经开启", res);
      },
      fail(res) {
        that.setData({
          bluetoothState: false
        })
        console.log("蓝牙未开启", res);
      },
      complete(res) {
        console.log("判断蓝牙是否开启完成", res);
      }
    })
  },
  //关闭提示框
  toggleAlertDialog() {
    this.setData({
      alertDialog: !this.data.alertDialog
    })
  },
  /**
   * 开锁操作成功完成之后
   */
  openSuccess() {
    const that = this;
    console.log(' 开锁操作成功完成之后-----------------------------------')
    Api.checkOrder(app.globalData.token, function(res) {
      wx.hideLoading();
      app.globalData.orderInfo = res.data.resultData;
      app.globalData.openSuccessAlert = true;
      
      wx.reLaunch({
        url: '/pages/use/use',
      })
    });
  },
  // 支付押金代码
  payDeposit() {
    const that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    Api.payDeposit(app.globalData.token, this.data.orderNo, function(res) {
      wx.hideLoading()
      if (res.data.resultCode == 200) {
        wx.requestPayment({
          timeStamp: res.data.resultData.timeStamp.toString(),
          nonceStr: res.data.resultData.nonceStr,
          package: res.data.resultData.package,
          signType: 'MD5',
          paySign: res.data.resultData.sign,
          success(res) {
            console.log('支付成功', res)
            that.setData({
              cashState: false
            })
          },
          fail(err) {
            wx.showToast({
              title: '支付取消',
              icon: 'none'
            })
            console.log("支付失败", err);
          },
          complete: (res) => {
            console.log('支付执行完成', res)
          }
        })
      } else {
        wx.showToast({
          title: res.data.resultMsg,
          icon: 'none'
        })
      }
    });
  },
  //点击开锁
  openLock() {
    const self = this;
    wx.showLoading({
      title: '开锁中',
      mask: true
    })
    self.setData({ 
      flngclick:false
    })


    Api.getDeviceInfo(app.globalData.token, self.data.deviceInfo.deviceNum, function(res) {
      if(res.data.resultCode != 200){
        wx.hideLoading();
      }
      if (res.data.resultCode == 200) {
        self.doOpenLockAfterCheck();
      // } else if (res.data.resultCode == 200005) {
        //200005 设备正在使用
        // self.setData({
        //   alertDialog: true,
        //   alertText: res.data.resultMsg,
        //   alertIcon: '',
        // })
      } else if (res.data.resultCode == 200004 || res.data.resultCode == 200009) {
        //200009 该时间段不可使用
        //200004 该设备不存在
        self.setData({
          alertDialog: true,
          alertText: res.data.resultMsg,
          alertIcon: '',
        })
      } else if (res.data.resultCode == 200006) {
        //200006 该设备故障
        self.setData({
          alertDialog: true,
          alertText: res.data.resultMsg,
          alertIcon: 'fault',
        })
      } else if (res.data.resultCode == 200007) {
        //200007  该设备电量低
        self.setData({
          alertDialog: true,
          alertText: res.data.resultMsg,
          alertIcon: 'cell',
        })
      } else if (res.data.resultCode == 200008) {
        //200008 该设备正在消毒
        self.setData({
          alertDialog: true,
          alertText: res.data.resultMsg,
          alertIcon: 'disinfect',
        })
      } else {
        self.setData({
          flngclick: true
        })
        wx.showToast({
          title: res.data.resultMsg,
          icon: 'none'
        })
      }
    });
  },
  doOpenLockAfterCheck() {
    const that = this;
    //判断是否能够正常开锁 
    wx.openBluetoothAdapter({
      success(res) {
        that.setData({
          bluetoothState: true
        })
        //具体的开锁操作
        that.doOpenLock();
      },
      fail(res) {
        that.setData({
          bluetoothState: false
        })

      },
      complete(res) {
        console.log("判断蓝牙是否开启完成", res);
      }
    })
  },
  //去开锁
  doOpenLock() {
    const that = this;
    Api.openLock(app.globalData.token, app.globalData.deviceNum, function(res) {
      console.log('开锁后台api成功:', res)
      BleOpenUtils.lockStatus == 'close'
      //20005 该设备被使用
      if (res.data.resultCode == 200005) {
        // console.log("open lock :" + res.data.resultCode)
        // wx.redirectTo({
        //   url: '/pages/use/use',
        // })
        that.setData({
          alertDialog: true,
          alertText: res.data.resultMsg,
          alertIcon: '',
        })
        return;
      }

      if (res.data.resultCode == 200014) { //您存在未支付订单，请先支付！
        console.log("open lock :" + res.data.resultCode)
        wx.redirectTo({
          url: '/pages/use/use',
        })
        return;
      }

      if (res.data.resultCode == 200011) { //您还未支付押金,请先支付押金。
        console.log("open lock: " + res.data.resultCode)
        wx.hideLoading()
        that.setData({
          cashState: true,
          orderNo: res.data.resultData
        })
        return;
      }
      if (res.data.resultCode == 200) {
        //  发送开锁指令去 创建订单        
        console.log('code==200 开锁返回的命令成功')
        let arr = res.data.resultData.split(',')
        BleOpenUtils.tryOpenLock(0, app.globalData.deviceNum, Cmd.openLock(arr));
        return;
      }


      wx.showToast({
        title: res.data.resultMsg,
        icon: 'none'
      })
    });
  },
  //跳转到个人中心
  toMine() {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.navigateTo({
      url: '/pages/mine/mine',
    })
  },
  //跳转到意见反馈
  toFeedback() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.navigateTo({
      url: '/pages/feedback/feedback',
    })
  },

  /**
   * 生命周期函数--监听页面加载 
   * 查询设备信息
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    BleOpenUtils.closeBLEConnection();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})