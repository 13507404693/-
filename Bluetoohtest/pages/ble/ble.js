 // pages/ble/ble.js
const {showApi} = require('../../utils/index')
import ble from '../../utils/Ble.js'
var host='https://bed.leagoohealth.com/program'
var hosts= 'http://192.168.99.80:9087'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    deviceNum:'666666',
    e:'ethis',
    a1:'80',
    a2:'3000',
    a3:'2000',
    arr:'',//开锁
    arrt:'',//关锁
    ld: '',
    htime: '',
    mtime: '',
    resultData:'',
    coleseData:'',
    funk:true,
    go:true,
    stop:false,
    interval:'',
    uTimeVal:'',//开锁力度
    cTimeVal: '',//时间的高位
    lTimeVal: '',//时间低位
    just:0,
    negative:0
  },
  //开锁力度
  uTime(e){
    console.log(e.detail.value);
    this.setData({
      uTimeVal: e.detail.value
    })
  },
  //时间的高位
  cTime(e){
    console.log(e.detail.value);
    this.setData({
      cTimeVal: e.detail.value
    })
  },
  //时间低位
  lTime(e){
    console.log(e.detail.value);
    this.setData({
      lTimeVal: e.detail.value
    })
  },
  //开锁请求
  qer(){
    wx.request({
      method: 'POST',
      url:  host + '/test/blueTooth/openLock',
      data: {
        openPwm: this.data.uTimeVal,
        openTime: this.data.cTimeVal,
        closeTime: this.data.lTimeVal
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Access-Token': wx.getStorageSync('token')
      },
      success: res => {
        console.log(res)
        if (res.data.resultCode == 200){ 
          console.log('开锁请求'+ res.data.resultData);
            this.setData({
              resultData: res.data.resultData
            })

          console.log(this.data.resultData)
          this.openLock();
          this.coleqer();
          
        }
      },
      fail: err => {
        console.log(err);
      }
    })
  },
  coleqer() { //关锁请求
    wx.request({
      method: 'POST',
      url: host + '/test/blueTooth/closeLock',
      data: {
        openPwm: this.data.uTimeVal,
        openTime: this.data.cTimeVal,
        closeTime: this.data.lTimeVal
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Access-Token': wx.getStorageSync('token')
      },
      success: res => {
        console.log('关锁请求' + res.data.resultData);
        if (res.data.resultCode == 200) {
          this.setData({
            coleseData:res.data.resultData
          })
          //this.openLock()
        }

      },
      fail: err => {
        console.log(err);
      }
    })
  },
  openLock(){//开锁流程
    console.log(this.data.resultData)
    this.openBluetoothAdapter();
    
    let arr = this.data.resultData.split(',');
    console.log(this.data.resultData);
    let buffer = new ArrayBuffer(16)
    let view = new DataView(buffer, 0, 16)
    view.setUint8(0, arr[0])
    view.setUint8(1, arr[1])
    view.setUint8(2, arr[2])
    view.setUint8(3, arr[3])
    view.setUint8(4, arr[4])
    view.setUint8(5, arr[5])
    view.setUint8(6, arr[6])
    view.setUint8(7, arr[7])
    view.setUint8(8, arr[8])
    view.setUint8(9, arr[9])
    view.setUint8(10, arr[10])
    view.setUint8(11, arr[11])
    view.setUint8(12, arr[12])
    view.setUint8(13, arr[13])
    view.setUint8(14, arr[14])
    view.setUint8(15, arr[15])


    ble.writeBLECharacteristicValue(ble.deviceId, ble.serviceId, buffer).then(result => {
      console.log('开锁成功', result);
      wx.showToast({
        title: '开锁成功',
        icon: 'none'
      })
      wx.hideLoading()
    }).catch(err => {
      console.log('开锁失败', err)
      wx.showToast({
        title: '开锁失败',
        icon: 'none'
      })
      wx.hideLoading()
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options){
      wx.showToast({
        title: '提示:开启蓝牙才能正常运行哦',
        icon:'none'
      })
  },
  ip_val(e){
    console.log(e);
      this.setData({ 
        mac: e.detail.value
      })
  },
  // 连接设备蓝牙
  blelianjie(){
    if (this.data.mac== ''){
      wx.showToast({
        title:'mac地址不能为空',
        icon:'none'
      })
      return false;
    } 
    ble.advertisData = this.data.mac;
    ble.startConnect(this)
  },
  //表单提交事件  开锁事件
  submits(e) {
    const that = this;
    const ld = that.data.uTimeVal;//开锁力度
    const htime = that.data.cTimeVal;//时间的高位
    const mtime = that.data.lTimeVal;//时间的高位
    

      if (ld==''){ 
      wx.showToast({
        title: '力度不能为空',
        icon: 'none'
      })
      return false;
    } else if (htime==''){ 
      wx.showToast({
        title: '高位不能为空',
        icon: 'none'
      })
      return false;
    } else if (mtime ==''){ 
      wx.showToast({
        title: '低位不能为空',
        icon: 'none'
      })
      return false;
    }

    that.setData({ 
      ld: ld,
      htime: htime,
      mtime: mtime
    })

    wx.showLoading({
      title: '开锁中',
    })
    
    //点击 开锁，吧开锁 关锁的指令全部请求保存起来

    this.qer();//开锁请求
    this.coleqer();//关锁请求

  },
  coles() {
    wx.showLoading({
      title: '关锁中',
    })
     this.coletap()
  },

  coletap(){ //关锁方法
    console.log(this.data.arrt)
    let arr = this.data.coleseData.split(',');
    let buffer = new ArrayBuffer(16)
    let view = new DataView(buffer, 0, 16)
    view.setUint8(0, arr[0])
    view.setUint8(1, arr[1])
    view.setUint8(2, arr[2])
    view.setUint8(3, arr[3])
    view.setUint8(4, arr[4])
    view.setUint8(5, arr[5])
    view.setUint8(6, arr[6])
    view.setUint8(7, arr[7])
    view.setUint8(8, arr[8])
    view.setUint8(9, arr[9])
    view.setUint8(10, arr[10])
    view.setUint8(11, arr[11])
    view.setUint8(12, arr[12])
    view.setUint8(13, arr[13])
    view.setUint8(14, arr[14])
    view.setUint8(15, arr[15])

    ble.writeBLECharacteristicValue(ble.deviceId, ble.serviceId, buffer).then(result => {
      console.log('关锁成功', this.data.coleseData);
      wx.hideLoading();

    }).catch(err => {
      console.log('关锁失败', err)
      wx.hideLoading()
    }) 
  },
  continuity(){//连续开锁，和连续关锁
    // uTimeVal: '',//开锁力度
    // cTimeVal: '',//时间的高位
    // lTimeVal: '',//时间低位

    if (this.data.uTimeVal == '') {
      wx.showToast({
        title: '力度不能为空',
        icon: 'none'
      })
      return false;
    } else if (this.data.cTimeVal == '') {
      wx.showToast({
        title: '高位不能为空',
        icon: 'none'
      })
      return false;
    } else if (this.data.lTimeVal == '') {
      wx.showToast({
        title: '低位不能为空',
        icon: 'none'
      })
      return false;
    }


      wx.showToast({
        title:'开锁中',
      })

      this.data.interval=setInterval(() => {
        if (this.data.go == true) {
          //开锁
          this.setData({ 
            just: this.data.just+1
          })
          console.log('开')
          wx.showToast({
            title:'开锁成功',
            icon:''
          })
          this.openLock();
          this.setData({
            stop: true,
            go: false
          })  
        } else if (this.data.stop == true) {
          this.setData({
            negative: this.data.negative +1
          })
          console.log('关')
          wx.showToast({
            title: '关锁成功',
            icon: ''
          })
          this.coletap();
          this.setData({
            stop: false,
            go: true
          })
        }

      }, 3000)
      
  },
  
  stops(){//关闭定时器
    clearInterval(this.data.interval);
    wx.showToast({
      title: '暂停连续开锁',
    })
  },
  callBack(val) {

    if(val==1){ 
      this.setData({ 
        funk:false,
      })
    }
  console.log(val);
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
    this.openBluetoothAdapter();
  },
  //检测蓝牙开关
  openBluetoothAdapter(){
    wx.openBluetoothAdapter({
      success: res => {
        console.log(res)
      }, fail: err => {
        console.log(err)
        wx.showToast({
          title: '请先把手机蓝牙打开',
          icon: 'none'
        })
      }
    })
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