import AutoTestApi from '../../utils/apis/AutoTestApi.js';
import BleAutoRunner from '../../utils/BleAutoRunner.js';
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    alertDialog: false, //弹出框标识
    intensity: '', //力度
    openTime: '', //开锁时间
    closeTime: '', //关锁时间
    equipmentlist: [], //设备列表
    much: '', //总次数次数
    add_mac: '' ,//要测试的mac 地址
    model:'',//手机型号
    system:''//手机系统

  },
  //设置力度
  intensity(e) {
    const that = this;
    that.setData({
      intensity: e.detail.value
    })
  },
  //设置开锁时间
  openTime(e) {
    const that = this;
    that.setData({
      openTime: e.detail.value
    })
  },
  //设置关锁时间
  closeTime(e) {
    const that = this;
    that.setData({
      closeTime: e.detail.value
    })
  },
  //设置次数
  much(e) {
    const that = this;
    that.setData({
      much: e.detail.value
    })
  },
  //选择要测试的设备
  checkboxChange(e) {
    const that = this;
    that.setData({
      add_mac: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    const that=this;
    wx.getSystemInfo({
      success(res) {

        console.log(res.model)
        console.log(res.system)
        that.setData({ 
          model: res.model || '未搜索到',
          system: res.system || '未搜索到'
        })
        
      }

    })
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
    this.setData({
      alertDialog: true
    });
    //为了方便,记录上一次输入的内容
    let config = wx.getStorageSync("config");
    if (config != null && config != ''){
      config = JSON.parse(config);
      this.setData({
        intensity: Number.parseInt(config.openPwm),
        openTime: Number.parseInt(config.openTime),
        closeTime: Number.parseInt(config.closeTime)
      });
    }
  },
  //表单验证
  validate() {
    const that = this;
    if (that.data.intensity == '') {
      wx.showToast({
        title: '请输入力度',
        icon: 'none'
      })
      return false;
    }
    if (that.data.openTime == '') {
      wx.showToast({
        title: '请输入开锁时间',
        icon: 'none'
      })
      return false;
    }
    if (that.data.closeTime == '') {
      wx.showToast({
        title: '请输入关锁时间',
        icon: 'none'
      })
      return false;
    }
    return true;
  },
  alertDialog() {
    const that = this;
    if (!that.validate()) {
      return;
    }
    this.setData({
      alertDialog: true
    });
    wx.showLoading({
      title: '加载中...',
    })
    //存储
    wx.setStorageSync("config", JSON.stringify({
      openPwm: that.data.intensity,
      openTime: that.data.openTime,
      closeTime: that.data.closeTime,
    }));
    //配置
    AutoTestApi.btLock_config({
      openPwm: that.data.intensity,
      openTime: that.data.openTime,
      closeTime: that.data.closeTime,
    }, function(res) {
      if (res.statusCode == 200) {
        wx.hideLoading();
        that.setData({
          alertDialog: !that.data.alertDialog
        })

        //获取蓝牙列表
        AutoTestApi.btLock_queryList({}, function(res) {
          wx.hideToast();
          that.setData({
            equipmentlist: res.data
          })
        });
      }
    });
  },
  //开始测试
  startest() {
    const that = this;
    if (that.data.much == '') {
      wx.showToast({
        title: '请输入开锁次数',
        icon: 'none'
      })
      return;
    }
    if (that.data.add_mac == '' || that.data.add_mac == null || that.data.add_mac.length == 0) {
      wx.showToast({
        title: '请选择测试设备',
        icon: 'none'
      })
      return;
    }


    wx.openBluetoothAdapter({ //初始化 蓝牙模块  成功 和 失败的回调
      success: res => {
        console.log('蓝牙开启成功' + res)

      },
      fail: err => {
        wx.showToast({
          title: '请开手动开启蓝牙',
          icon:'none'
        })
        return false
      
      }
    }) 


    const much = that.data.much; //输入设备次数
    const add_mac = that.data.add_mac; //设备max
    BleAutoRunner.start(that.data.much, that.data.add_mac, that.data.equipmentlist, 0, 0, function() {
      console.log("测试完成");
      console.log('测试完成-----------------'+BleAutoRunner.currentTestLog)
      wx.showToast({
        title: '测试完成',
        duration: 2000
      })
    });
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