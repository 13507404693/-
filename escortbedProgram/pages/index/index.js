// pages/index/index.js
const app = getApp()
import BleOpenUtils from '../../utils/BleOpenUtils.js';
import Api from '../../utils/api.js';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //帮助轮播图的图片
    imgUrls: [
      '../../images/banner/1.png',
      '../../images/banner/2.png',
      '../../images/banner/3.png',
      '../../images/banner/4.png'
    ],
    autoplay: false, //自动播放
    interval: 3000, // 自动切换时间间隔
    duration: 500, //滑动动画时长
    deviceDialog: false,
    deviceText: '手动输入设备号',
    deviceNum: '', //设备号
    disabledState: false, //
    bluetoothState: false, //蓝牙状态
    focus: false,
    alertDialog: false,
    alertText: '',
    alertIcon: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("index onload:",options);
    if (options.orderIsId != null) {
      this.checkDeposit()
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.checkBluetooth();
  },
  checkBluetooth() {
    // 1.验证蓝牙是否开启
    const that = this;
    BleOpenUtils.checkBluetooth(
      (flag) => {
        console.log("验证蓝牙开启结果：" + flag);
        that.setData({
           bluetoothState: !flag
         // bluetoothState: false
        });
        //蓝牙已经开启
        if (flag) {
          that.doLoginWx()
        }
      }
    );
  },
  //微信登录
  doLoginWx() {
    // 2.登录 获取token ，
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    const that = this;
    wx.login({
      success(res) {
        console.log("微信登录成功", res);
        //登录后台
        Api.login(
          res.code,
          that.loginSuccess,
          function(err) {
            console.log("后台登录失败", err);
            //必须弹出阻断的框
            that.setData({
              alertDialog: true,
              alertText: '用户异常,请去个人中心，拨打电话反馈问题',
              alertIcon: '',
            })
          },
          function(res) {
            // wx.hideLoading();
          }
        );
      },
      fail(err) {
        console.log("微信登录失败", err);
      },
      complete(res) {
        console.log("微信登录完成", res);
      }
    })
  },
  //登录成功
  loginSuccess(res) {
    wx.hideToast();
    console.log("后台登录成功", res);
    // 2.1新用户走绑定 
    const that = this;
    if (res.data.resultCode == 200) { //登录成功
      //目前先保存全局变量
      app.globalData.token = res.data.resultData;
      console.log(app.globalData.token);
      // 2.2. 老用户检查是否有未支付的订单
      that.checkOrder();
    } else if (res.data.resultCode == 200001) { //需要绑定手机号
      //目前先保存全局变量
      app.globalData.token = res.data.resultData;
      wx.redirectTo({
        url: '/pages/login/login',
      })
    } else if (res.data.resultCode == 200002) { //账户受到限制
      that.setData({
        disabledState: true
      })
    }
  },
  //检查是否有未完成的订单
  checkOrder() {
    Api.checkOrder(app.globalData.token, function (res) {
      console.log("检查订单成功", res);
      //发现有订单，跳转页面 200013, "该订单不需支付"
      if (res.data.resultCode == 200014) { //"您存在未支付订单，请先支付！"
        app.globalData.orderInfo = res.data.resultData;
        wx.reLaunch({
          url: '/pages/use/use',
        })
      }
    });
  },
  //关闭提示框
  toggleAlertDialog() {
    this.setData({
      alertDialog: !this.data.alertDialog
    })
  },
  //调起客户端扫码界面进行扫码
  scan() {
    let that = this
    wx.scanCode({
      success(res) {
        //获取到二维码内容
        let deviceNum = Api.getQueryString('deviceNum', res.result);
        console.log("扫码成功，二维码内容", deviceNum);
        that.setData({
          deviceNum: deviceNum
        });
        //
        that.getDeviceInfo(deviceNum)
      },
      fail(err) {
        console.log("扫码失败", err);
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        })
      },
      complete(res) {
        console.log("扫码完成", res);
      }
    })
  },
  //输入设备号点击确认
  submitDeviceNum() {
    console.log(`设备编码${this.data.deviceNum}`)
    if (!this.data.deviceNum) {
      wx.showToast({
        title: '请输入设备号',
        icon: 'none'
      })
      return
    }
    this.setData({
      deviceDialog: false,
    })
    
    this.getDeviceInfo(this.data.deviceNum)
  },
  //绑定输入
  setDeviceNum(e) {
    this.setData({
      deviceNum: e.detail.value
    })
  },
  //设备请求 状态码
  getDeviceInfo(deviceNum) {
    const self = this;
    app.globalData.deviceNum = deviceNum;
    wx.showLoading({
      title: '获取陪护床信息',
      mask:true
    });
    Api.getDeviceInfo(app.globalData.token,deviceNum, function(res) {
      wx.hideLoading()
      if (res.data.resultCode == 200) {
        // 获取到一堆开锁指令，准备和蓝牙对接
        app.globalData.ble_cmds = res.data.resultData;
        wx.navigateTo({
          url: '/pages/detail/detail',
        })
      // } else if (res.data.resultCode == 200005) {
      //   //200005 设备正在使用
      //   self.setData({
      //     alertDialog: true,
      //     alertText: res.data.resultMsg,
      //     alertIcon: '',
      //   })
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
        wx.showToast({
          title: res.data.resultMsg,
          icon: 'none'
        })
      }
    });
  },
  //事件
  toggleDeviceDialog() {
    this.setData({
      deviceDialog: !this.data.deviceDialog
    })
    if (this.data.deviceDialog == true) {
      this.setData({
        focus: true
      })
    } else if (this.data.deviceDialog == false) {
      this.setData({
        focus: false
      })
    }
  },
  //跳转到个人中心
  toMine() {
    wx.navigateTo({
      url: '/pages/mine/mine',
    })
  },
  //跳转到意见反馈
  toFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback',
    })
  },
  toggleDisabledState() {
    this.setData({
      disabledState: !this.data.disabledState
    })
  },
  //检查押金状态
  checkDeposit() {
    console.log("进入押金检查");
    const that = this;
    Api.chekcDeposit(app.globalData.token ,function(res){
      console.log("押金返回结果",res.data);
      if (res.data.resultData.deposit > 0) {
        //跳出退押金的按钮
        that.toBackDeposit();
      } else {
        //ignore
        console.log('没有押金');
      }
    });
  },
  //跳出退押金的按钮
  toBackDeposit() {
    wx.showModal({
      title: '押金退款',
      content: '是否立即退回押金',
      success: function (res) {
        if (!res.confirm) {
          //ignore
          console.log('用户点击取消')
          return ;
        }
        wx.showLoading({
          title: '退款中',
          mask:true
        })
        //退定金
        Api.backDeposit(app.globalData.token,function(){
          wx.hideLoading();
          wx.showToast({
            title: '退款成功!',
          })
        });
      }
    })
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