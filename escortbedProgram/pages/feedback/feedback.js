// pages/feedback/feedback.js
const app = getApp()
import Api from '../../utils/api.js';
import Cmd from '../../utils/Cmd.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['二维码损坏，无法扫码', '扫码后无法开锁', '关锁后忘记结束订单', '抽屉破损', '柜子破损', '其他'],
    index: '二维码损坏，无法扫码',
    des:'',
    moreState: false,
    plrce:true,
    typeArr: [{
      icon: 'lock',
      value: 1,
      name: '门锁',
      selected: false
    }, {
      icon: 'qrcode',
      value: 2,
      name: '二维码',
      selected: false
    }, {
      icon: 'chest',
      value: 3,
      name: '柜体',
      selected: false
    }, {
      icon: 'sterilize',
      value: 4,
      name: '消毒',
      selected: false
    }, {
      icon: 'other',
      value: 5,
      name: '其他',
      selected: false
    }],
    deviceNum: '',
    errImgUrl: '',
    type: '',
    des: '',
    funk: false
  },

  submitFeedback() {
    if (!this.data.deviceNum) {
      wx.showToast({
        title: '请输入设备编号',
        icon: 'none'
      })
      return
    }
    let arr = []
    for (let i in this.data.typeArr) {
      if (this.data.typeArr[i].selected) {
        arr.push(this.data.typeArr[i].value)
      }
    }
    if (arr.length <= 0) {
      wx.showToast({
        title: '请选择问题类型',
        icon: 'none'
      })
      return
    }
    // deviceNum: self.data.deviceNum,
    //   faultTypes: arr.join(','),
    //     des: this.data.array[this.data.index] + this.data.des,
    //       image: this.data.errImgUrl,
    let self = this
    Api.getDeviceInfo(app.globalData.token, self.data.deviceNum, function(res) {
      if (res.data.resultCode == 200004) {
        wx.showToast({
          title: res.data.resultMsg,
          icon: 'none'
        })
      } else {
        Api.addFaultBack(app.globalData.token, self.data.deviceNum, arr.join(','),
          self.data.array[self.data.index] + self.data.des, self.data.errImgUrl);
      }
    });


  },
  selectType(e) {
    let arr = this.data.typeArr
    arr[e.currentTarget.dataset.index].selected = !arr[e.currentTarget.dataset.index].selected
    this.setData({
      typeArr: arr,
      moreState: true
    })
  },
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },
  scan() {
    let self = this
    wx.scanCode({
      success(res) {
        let deviceNum = Api.getQueryString('deviceNum', res.result);
        if (deviceNum == null) {
          wx.showToast({
            title: '未识别的二维码',
            icon: 'none'
          })
          return;
        }
        if (!/\d{6}/.test(deviceNum)) {
          wx.showToast({
            title: '未识别的二维码',
            icon: 'none'
          })
          return;
        }
        console.log(deviceNum);
        self.setData({
          deviceNum: deviceNum,
        })
      }
    })
  },
  setDeviceNum(e) {
    this.setData({
      deviceNum: e.detail.value
    })
  },
  setDes(e) {
    /* 
      去掉表情
    */
    const that=this;
    let Emojival = Cmd.filterEmoji(e.detail.value)
    that.setData({
      des: Emojival
    })
  },
  chooseImg() {
    let self = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res);
        wx.uploadFile({
          url: Api.host + '/handle/uploadImage',
          filePath: res.tempFilePaths[0],
          name: 'file',
          success(r) {
            console.log(r);
            let obj = JSON.parse(r.data)
            if (r.statusCode == 200) {
              self.setData({
                errImgUrl: obj.resultData
              })
            } else {
              wx.showToast({
                title: obj.resultMsg,
                icon: 'none'
              })
            }
          }
        })
      }
    })
  },
  delImg() {
    this.setData({
      errImgUrl: ''
    })
  },
  picker() {
    const that = this;
    that.setData({
      funk: true,
      plrce: false
    })
  },
  returni() {
    const that = this;
    that.setData({
      funk: false,
      plrce:true
    })
  },
  feedblackval(e) {

    const that = this;
    that.setData({
      index: e.currentTarget.dataset.val,
      funk: false,
      plrce:true
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