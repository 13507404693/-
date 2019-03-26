// pages/order/order.js
const app = getApp()
const Moment = require("../../utils/moment.js")
import Api from '../../utils/api.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    loadMore: true,
    dataInfo: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getData()
  },

  getData() {
    let self = this
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    Api.orderQueryPage(self.data.page, app.globalData.token, function(res) {
      if (res.data.resultCode == 200) {
        let list = res.data.resultData.pageForm.objList
        for (let i in list) {
          list[i].endTime = Moment(list[i].endTime).format('YYYY/MM/DD hh:mm:ss')
          list[i].startTime = Moment(list[i].startTime).format('YYYY/MM/DD hh:mm:ss')
        }
        const toFtotalPrice = res.data.resultData.totalPrice.toFixed(2);

        self.setData({
          dataInfo: res.data.resultData,
          totalPrice: toFtotalPrice
        })

      } else {
        wx.showToast({
          title: res.data.resultMsg,
          icon: 'none'
        })
      }
    });
  },
  lower: function(e) {
    let self = this
    if (self.data.loadMore) {
      self.setData({
        loadMore: false,
        page: self.data.page + 1
      })
      Api.queryOrderByUserId(self.data.page, app.globalData.token, function(res) {
        if (res.data.resultCode == 200) {
          let allData = self.data.dataInfo
          let list = res.data.resultData.pageForm.objList
          for (let i in list) {
            list[i].endTime = Moment(list[i].endTime).format('YYYY/MM/DD hh:mm:ss')
            list[i].startTime = Moment(list[i].startTime).format('YYYY/MM/DD hh:mm:ss')
            allData.pageForm.objList.push(list[i])
          }
          self.setData({
            dataInfo: allData
          })
          if (res.data.resultData.pageForm.currentPage == res.data.resultData.pageForm.pageCount) {

          } else {
            self.setData({
              loadMore: true
            })
          }
        } else {
          wx.showToast({
            title: res.data.resultMsg,
            icon: 'none'
          })
        }
      });
    }
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