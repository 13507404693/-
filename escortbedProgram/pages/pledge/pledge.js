// pages/pledge/pledge.js
const app = getApp()
 
const Moment = require("../../utils/moment.js")
import Api from '../../utils/api.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataInfo: '',
    pledgeDialog: false,
    pledgeSure:false,
    contentarry_img:'../../ images / popup / bluetooth.png',
    contentarry_text:'',
    unbindDialog:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
  },
  getData(){
    let self = this
    Api.queryDepositByUserId(app.globalData.token,function(res){
      if (res.data.resultCode == 200) {
        let list = res.data.resultData.list
        for (let i in list) {
          list[i].create_time = Moment(list[i].create_time).format('YYYY/MM/DD hh:mm:ss')
        }
        self.setData({
          dataInfo: res.data.resultData
        })
      } else {
        wx.showToast({
          title: res.data.resultMsg || '服务器错误',
          icon: 'none'
        })
      }
    });
  },
  togglePledgeDialog() {
    this.setData({
      pledgeDialog: !this.data.pledgeDialog
    })
  },
  toggSure(){
    this.setData({
      pledgeSure: !this.data.pledgeSure
    })
  },
  refund () {
    const that=this;
    that.setData({ 
        unbindDialog: !that.data.unbindDialog
      })
  },
  toggleUnbindDialog(){
    const that = this;
    that.setData({
      unbindDialog: !that.data.unbindDialog
    })
  },
  //点击确定退款押金
  unbind(){
    wx.showLoading({
      title: '退款中',
      mask:true
    })
    let self = this
    Api.backDeposit(app.globalData.token, function (res) {
      wx.hideLoading()
      if (res.data.resultCode == 200) {
        wx.showToast({
          title: "退款成功",
        })
        self.getData();
        self.setData({
          unbindDialog: false
        })
      } if (res.data.resultCode == 200011) {
        wx.showToast({
          title: res.data.resultMsg,
          icon: 'none',
          duration: 2000,
          success: wx.redirectTo({
            url: '/pages/index/index',
          })
        })
      } else {
        wx.showToast({
          title: res.data.resultMsg,
          icon: 'none'
        })
      }
    },function(err){
        wx.showToast({
          title: '网络出现异常',
          duration: 3000,
          icon: 'none'
        })
    });

    wx.getNetworkType({
      success: (res) => {
        if (res.networkType == 'none'){
          wx.hideLoading();
          wx.showToast({
            title: "网络出现异常",
            duration: 3000,
            icon: 'none'
          })
        }
      }
    });
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