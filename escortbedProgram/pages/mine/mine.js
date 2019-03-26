// pages/mine/mine.js
const app = getApp()
import Api from  '../../utils/api.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    serviceDialog: false,
    hasOrderDialog: false,
    unbindDialog: false,
  },

  unbind() {
    let self = this
    wx.showLoading({
      title: '解绑中',
      mask: true   //mask:true 加上一层透明的模板，让提示出现的时候，用户点击界面其他地方无效 
    })
    Api.unbind(app.globalData.token, function(res) {
      if (res.data.resultCode == 200) {
        wx.hideLoading()
        wx.reLaunch({
          url: '/pages/login/login',
        })
      } else if (res.data.resultCode == 200014) {
        wx.hideLoading()
        self.setData({
          unbindDialog: false,
          hasOrderDialog: true
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: '服务器错误',
          icon: 'none'
        })
      }
    });


  },
  toggleUnbindDialog() {

    this.setData({
      unbindDialog: !this.data.unbindDialog
    })
  },
  toggleHasOrderDialog() {
    this.setData({
      hasOrderDialog: !this.data.hasOrderDialog
    })
  },
  toggleServiceDialog() {
    this.setData({
      serviceDialog: !this.data.serviceDialog
    })
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: '4000029800'
    })
  },
  toOrder() {
    wx.navigateTo({
      url: '/pages/order/order'
    })
  },
  toPledge(){
    wx.navigateTo({
      url: '/pages/pledge/pledge'
    })
  },
  toAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },
  toHelp() {
    wx.navigateTo({
      url: '/pages/help/help'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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