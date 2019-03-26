// pages/use/use.js
const app = getApp()
const Moment = require("../../utils/moment.js")
import BleOpenUtils from '../../utils/BleOpenUtils.js';
import Cmd from '../../utils/Cmd.js';
import Api from '../../utils/api.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    hours: [0, 0],
    minutes: [0, 0],
    seconds: [0, 0],
    interval: '',
    bluetoothState: true,
    orderInfo: null,
    openSuccessFlag: false,
    alertIcon: '',
  },
  //去个人中心
  toMine() {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.navigateTo({
      url: '/pages/mine/mine',
    })
  },

  //意见反馈
  toFeedback() {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.navigateTo({
      url: '/pages/feedback/feedback',
    })
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      openSuccessFlag: app.globalData.openSuccessAlert
    });
  },
  openSuccessCheckOrder() {
    this.setData({
      openSuccessFlag: false
    });
    app.globalData.openSuccessAlert = false;
  },
  // 去支付页面 
  toPay() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    console.log("topay = ", this.data.orderInfo);
    Api.payOrder(app.globalData.token, this.data.orderInfo.orderNo);
  },
  closeLock() {
    wx.showLoading({
      title: '关锁中',
      mask: true
    })
    const that = this;
    BleOpenUtils.startCloseConnect(app.globalData.token, that.data.orderInfo.secretKey, false, function(flag) {
      that.setData({
        bluetoothState: flag
      });
    }, function(val) {
      that.closeSuccess(val);
    });
  },
  closeSuccess(val) {
    console.log("正常关锁后的回调", val);
    const that = this;
    Api.listenBlue(app.globalData.token, that.data.orderInfo.deviceNum, val, function(res) {
      console.log("关锁后同步后台状态", res);
      if (res.data.resultCode == 200020) {
        //锁未正常关闭！
        wx.showToast({
          title: '锁未正常关闭',
          icon: 'none',
          duration: 3000
        })
      } else if (res.data.resultCode == 200040) {
        that.closeOrder() //去支付
      } else if (res.data.resultCode == 200037) {
        wx.showToast({
          title: '请先把门关上，然后点击结束订单',
          icon: 'none',
          duration: 3000
        })
      } else if (res.data.resultCode == 200038) {
        wx.showToast({
          title: '请先把门拉开,然后关上门,结束订单',
          icon: 'none',
          duration: 2000
        })
      } else if (res.data.resultCode == 200017) {
        wx.showToast({
          title: '锁未开',
          icon: 'none',
          duration: 2000
        })
      }
    });
  },
  //强制结束订单
  closeOrder() {
    console.log("closeOrder");
    let that = this;
    console.log(this.data.orderInfo);
    Api.overOrder(app.globalData.token, this.data.orderInfo.orderNo,
      function() {
        console.log("超过五分钟，需要付费的订单");
        that.checkOrder();
      },
      function() {
        console.log("五分钟之内，不需要支付，直接关闭，并条船到首页");
        wx.showToast({
          title: '锁正常关闭',
          duration: 1000,
          success: () => {
            wx.redirectTo({
              url: '/pages/index/index?orderIsId=Close', //结束订单
            })
          }
        })
      }

    );
  },
  checkOrder() { //请求界面信息
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    const that = this;
    Api.checkOrder(app.globalData.token, function(res) {
      wx.hideLoading();
      if (res.data.resultData == null) {
        wx.redirectTo({
          url: '/pages/index/index', //进入
        })
        return;
      }
      that.setData({
        orderInfo: res.data.resultData
      });
      app.globalData.orderInfo = res.data.resultData;
      that.renderTime();
    });
  },
  calcTime(duration) {
    const that = this;
    let hours, minutes, seconds
    if (duration.hours() < 10) {
      hours = '0' + duration.hours()
    } else {
      hours = duration.hours()
    }
    if (duration.minutes() < 10) {
      minutes = '0' + duration.minutes()
    } else {
      minutes = duration.minutes()
    }
    if (duration.seconds() < 10) {
      seconds = '0' + duration.seconds()
    } else {
      seconds = duration.seconds()
    }
    that.setData({
      hours: hours.toString().split(''),
      minutes: minutes.toString().split(''),
      seconds: seconds.toString().split(''),
    })
  },
  renderTime() {
    const that = this;
    const orderInfo = this.data.orderInfo;
    console.log("use.wxml 订单", orderInfo);
    if (orderInfo == null) {
      return;
    }
    if (that.interval != null) {
      clearInterval(that.interval)
    }
    //订单已经结束,需要计算一个时间
    if (orderInfo.oStatus == 1) {
      let millisecond = Moment(orderInfo.endTime).diff(Moment(orderInfo.startTime));
      let duration = Moment.duration(millisecond);
      console.log("user.js", duration);
      that.calcTime(duration);
      return;
    }
    //计时
    let millisecond = Moment(orderInfo.endTime).diff(Moment(orderInfo.startTime))
    let duration = Moment.duration(millisecond)
    

    if (orderInfo.oStatus == 0) {
      that.interval = setInterval(() => {
        millisecond = millisecond + 1000
        duration = Moment.duration(millisecond)
        that.calcTime(duration);
        /**换算成秒 */
        let s = millisecond / 1000;
        //订单 == 6分钟3秒,开始检查一次订单
        if (s == 6 * 60 + 3) {
          that.checkOrder();
        } else if (s / 60 / 60 > 1 && s % 60 == 3) {
          //超过 1小时3秒,再次检查
          that.checkOrder();
        }
      }, 1000)
    }
  },
  coloslock(val) {
    let that = this
    if (val === '1') {
      return;
    }
    Api.closeLock(app.globalData.token, this.data.orderInfo.deviceNum, function(res) {
      if (res.data.resultCode != 200) {
        wx.showToast({
          title: res.data.resultMsg,
          icon: 'none'
        })
        return;
      }
      let arr = res.data.resultData.split(',');
      BleOpenUtils.writeBLECharacteristicValue(that.data.orderInfo.deviceNum,
        BleOpenUtils.serviceId, Cmd.closeLock(arr),
        function(res) {
          console.log("关锁成功", res);
        });
    });

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    console.log("进入use", app.globalData.orderInfo);
    // if (app.globalData.orderInfo == null) {
    //   wx.redirectTo({
    //     url: '/pages/index/index', //进入
    //   })
    //   return;
    // }
    // console.log("onshow ---------------");
    this.checkOrder();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    wx.closeBLEConnection({
      deviceId: wx.getStorageSync('device'),
      success(res) {
        console.log('关闭模块', res)
      },
      fail(err) {
        console.log('断开蓝牙', err);
      },
      complete: function(err) {
        console.log('断开蓝牙', err)
      }
    })
    if (this.refreshOrder != null) {
      clearInterval(this.refreshOrder)
    }
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