// pages/login/login.js
import Api from '../../utils/api.js';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    code: '',
    codeText: '发送验证码',
    time: 60,
    flag: true,
    timer: '',

    showPopup: false,
  },
  
  getCode () {
    let self = this
    if (!this.data.flag){
      wx.showToast({
        title: '正在发送中，请稍后',
        icon: 'none'
      })
      return ;
    }
    //2019-3-11 移动联通电信 现阶段的手机号码 多坐了正则匹配 
    if (/^(0|86|17951)?(13[0-9]|15[012356789]|17[3678]|18[0-9]|14[579]|19[0-9]|16[0-9])[0-9]{8}$/.test(this.data.phone)) {
      self.countTime()
      Api.getSmsCodeForUser(self.data.phone);
    } else {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
    }
  },
  countTime: function () {
    this.data.flag = false
    if (this.data.time > 0) {
      this.data.time--
      this.setData({
        codeText: this.data.time + 's'
      })
      this.data.timer = setTimeout(() => {
        this.countTime()
      }, 1000)
    } else {
      this.data.time = 60
      this.data.flag = true
      this.setData({
        codeText: '发送验证码'
      })
      clearTimeout(this.data.timer)
    }
  },
  doBind(e){
    if (e.detail.errMsg == 'getUserInfo:ok') {
      let self = this
      let userInfo = e.detail.userInfo
      if (!(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57]|19[0-9]|16[0-9])[0-9]{8}$/.test(this.data.phone))) {
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
    

      if (!(this.data.code)){
        wx.showToast({
          title: '请输入短信验证码',
          icon: 'none'
        })
        return
      }

      wx.showLoading({
        title: '绑定中',
        mask:true
      })
  
      Api.bindPhone(this.data.phone, this.data.code, userInfo.nickName, app.globalData.token);
    }
  },
  setPhone (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  setCode (e) {
    this.setData({
      code: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})