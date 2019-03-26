const {apiData} = require('../server/index.js');
// isBluetoothOpen
// 1 获取到10台设备，展示到界面上 
// 2 勾选要测试的设备，输入次数,开始测试 
// 3 勾选的设备，每一次测试100次，100次之后，开始下一个，直到没有设备为止

const Ble = Ble || {}
Ble.deviceId = ''
Ble.advertisData = ''
Ble.serviceId = '0000FFF0-0000-1000-8000-00805F9B34FB'
Ble.characteristicId = '0000FFF6-0000-1000-8000-00805F9B34FB'
Ble.prepareMuch='';//备份的次数
Ble.much='';//输入设备测试次数
Ble.add_mac='';//设备数量
Ble.equipmentlist='';//设备总数量
Ble.open_cmd='';//开始指令
Ble.close_cmd='';//关锁指令
Ble.Testopening = false;//关锁开锁开关
Ble.accumulation=0;//获取第几个设备号 序列号
Ble.DataBar='';//保存每一条数据
Ble.model='';//手机型号
Ble.accumulationPush=0;//当前执行次数
Ble.id=''
Ble.testdata={
  
}
Ble.context = null
Ble.funk = false;
Ble.openFlag = false;
Ble.ab2hex = function (buffer) { //截取到
  let hexArr = Array.prototype.map.call(new Uint8Array(buffer), bit => ('00' + bit.toString(16)).slice(-2))
  // ArrayBuffer转16进度字符串示例
  return hexArr.join('')
}

// 初始化蓝牙
Ble.startConnect = function (_this, openFlag) {

//赋值每一次说道到的最后一个，赋值个mac的变量advertisData，累加循环
  this.advertisData = this.add_mac[this.accumulation];

 // console.log('获取的第二台设备' + this.accumulation +'mac：'+ this.add_mac[this.accumulation])

console.log('========================这=是开始的')

  if (this.add_mac[this.accumulation] === undefined){ 
      wx.showToast({
        title: '设备已全部测试完成',
        icon:'none'
      })
    console.log('你选择的设备已经测试完了');
    return;
  }

  //循环总设备数量， 用mac去匹配对应的开锁指令，关锁指令，设备号
  for (let i in this.equipmentlist){  
    if(this.advertisData == this.equipmentlist[i].mac_addr){ 
        this.open_cmd = this.equipmentlist[i].open_cmd;//开锁指令
        this.close_cmd = this.equipmentlist[i].close_cmd;//关锁指令
        this.DataBar = this.equipmentlist[i]
    }
  }
  this.testdata =  {
    id: null,
    dev_id: this.DataBar.dev_id,
    start_time: new Date().getTime(),
    test_count: 0,
    platform: this.model,
    scan_status: 0,
    conn_status: 0,
    open_lock: 0,
    close_lock: 0,
    start_scan_time: null,
    end_scan_time: null,
    start_conn_time: null,
    end_conn_time: null,
    start_open_lock: null,
    end_open_lock: null,
    start_close_lock: null,
    end_close_lock: null,
    total_count: this.prepareMuch,
  }
  
  apiData.save(this.testdata).then(res=>{
    console.log("------------------------------------------------------" ,res);
    this.testdata = { ...this.testdata, id: res.data, total_count: this.much};

    if (!openFlag) {
      wx.showLoading({
        title: '蓝牙连接中',
      })
    }

    this.openFlag = openFlag || false;
    console.log(this.openFlag);

    this.context = _this
    wx.closeBluetoothAdapter({
      success: res => {
        wx.openBluetoothAdapter({ //初始化 蓝牙模块  成功 和 失败的回调
          success: res => {
            console.log('初始化蓝牙成功', res)
            this.getBluetoothAdapterState()
          },
          fail: err => {
            console.log('初始化蓝牙是否开启:', err);
            wx.hideLoading();
          }
        })
      },
      fail: (err) => { console.log('连接失败', err) },
    })

  }).catch(res=>{ 
    console.log(res);
    wx.showToast({
      title: '系统错误',
      icon:'none'
    })
  })







}

Ble.getBluetoothAdapterState = function () {
  wx.getBluetoothAdapterState({  //获取本机蓝牙适配器状态 判断用户是否开启蓝牙 
    success: res => {
      console.log('蓝牙状态', res)
      //discovering 是否正在搜索设备   available 蓝牙适配器是否可用 
      if (res.available == false) {
        wx.showToast({
          title: '设备无法开启蓝牙连接',
          icon: 'none'
        })
      } else if (res.discovering == false) {
        this.startBluetoothDevicesDiscovery()
      } else if (res.available) {
        this.startBluetoothDevicesDiscovery()
      }
    }, fail: err => {
      console.log('检测蓝牙是否开启:', err);
    }
  })
}

Ble.startBluetoothDevicesDiscovery = function () {
  wx.startBluetoothDevicesDiscovery({ //开始搜寻附近的蓝牙外围设备 
    services: [this.serviceId], //搜索对应设备的id   以微信硬件平台的蓝牙智能灯为例，主服务的 UUID 是 FEE7。传入这个参数，只搜索主服务 UUID 为 FEE7 的设备
    allowDuplicatesKey: false,
    success: res => {
      console.log('主服务', res)

      if (!res.isDiscovering) { //是否在搜索到了设备
        this.getBluetoothAdapterState()
      } else {
        this.onBluetoothDeviceFound() //设备参数返回成功 就去执行搜索设备
      }
    },
    fail: err => {
      console.dir('主服务：', err)
      this.stopBluetoothDevicesDiscovery()
    }
  })
}

//安卓 是通过 deviceId 与mac 地址配对 然后ios是通过advertisData 通过建立  这里的操作 安卓和ios建立蓝牙多是通过advertisData 转换成二进制来判断连接的
Ble.onBluetoothDeviceFound = function () { //搜索相对应的设备
  const that = this;
  wx.onBluetoothDeviceFound((res) => {
    console.dir('搜索到的设备没配对成功有', res)
    res.devices.forEach(device => {
      //扫码开始
      this.testdata = { ...this.testdata, scan_status: 1,start_scan_time: new Date().getTime()};
      
      apiData.update(this.testdata).then(res => {
        console.log('333',res)
      }).catch(err => {
        console.log('444',err)
      })

      let _advertisData = this.ab2hex(device.advertisData) //得到设备的mac地址

      console.dir('my'+ that.advertisData)
      console.dir('you'+_advertisData)

      if (_advertisData == that.advertisData) {
        console.dir('条件配对成功设备已搜索到'+ device)
      
        //扫描结束
        this.testdata = { ...this.testdata, scan_status: 2,end_scan_time: new Date().getTime() };
        apiData.update(this.testdata).then(res => {
          console.log(res)

          //console.log('99999:' + device.deviceId);
          wx.setStorageSync('device', device.deviceId)//第一搜索到设备 保存在本地，给关锁的时候使用
          that.deviceId = device.deviceId;
          that.stopBluetoothDevicesDiscovery() //设备已经搜索到，停止搜索
          //console.log('设备已经搜索到，停止搜索')
          that.createBLEConnection();


        }).catch(err => {
          console.log(err)
        })


      }
    })
  })
}

//根据缓存的deviceVal 去判断，如果有这个参数，那就直接走连接，没有的话，就走搜索mac地址连接
Ble.deviceVal = function (deviceVal){
  const that=this;
  if (deviceVal) {
    this.deviceId = deviceVal;
//去断开蓝牙模块,断开成功就可以去再次连接。
    this.createBLEConnection();
    return false;
  }
  this.startBluetoothDevicesDiscovery()
}


Ble.createBLEConnection = function () {
  //开始连接时间
  this.testdata = { ...this.testdata, scan_status: 2, start_conn_time: new Date().getTime() };
  apiData.update(this.testdata).then(res => {
    console.log(res)
    this.openlock(0);
  }).catch(err => {
    console.log(err)
  })

}

Ble.openlock = function (count) {
  //连接蓝牙之后，就一直是true·
  if (count == 6 && this.openFlag == false) {
    //五次没有连接上，重新卸载蓝牙模块，重新连接
    this.startConnect(this.context, true);
    return false;
  
  }

  //成立 
  if (count == 6 && this.openFlag == true) {

    //执行到这一步 一定是deviceId值错误
    wx.showToast({
      title: '连接中断,请重试',
      icon: 'none'
    })
    
    setTimeout(() => {
      wx.navigateBack({
        data: 1,
      })
    }, 2000)
    return false;
  }

  const self = this;
  //500毫秒连接一次，连接一次失败，继续连接，直到10次连接失败，就让他跳转首页
  setTimeout(() => {
    wx.createBLEConnection({
      deviceId: wx.getStorageSync('device'),
      success: res => {
        console.log('连接', res)
        if (res.errCode == 0) {
          //连接结束时间
          this.testdata = { ...this.testdata, scan_status: 2, end_conn_time: new Date().getTime() };
          apiData.update(this.testdata).then(res => {
            console.log(res)

            wx.hideLoading() //连接成功  关闭提示狂
            self.funk = true //防止 连接点击开锁按钮处理
            wx.showToast({
              title: '蓝牙连接设备成功',
              icon: 'none'
            })
            this.getBLEDeviceServices(this.deviceId)

          }).catch(err => {
            console.log(err)
          })
          
        }
      },
      fail: err => {
        console.log('连接失败:', err)
        console.log(count)
        this.testdata = { ...this.testdata, scan_status: 3, end_conn_time: new Date().getTime() };
        apiData.update(this.testdata).then(res => {
          console.log(res)
          self.openlock(count + 1);
          
        }).catch(err => {
          console.log(err)
        })
        self.openlock(count + 1);
      }
    })
  }, 500)
}



Ble.getBLEDeviceServices = function (deviceId) {
  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
  wx.getBLEDeviceServices({
    deviceId,
    success: (res) => {
      console.log('服务', res)
      this.getBLEDeviceCharacteristics(this.deviceId, this.serviceId)
      // for (let i = 0; i < res.services.length; i++) {
      //   if (res.services[i].isPrimary) {
      //     this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
      //   }
      // }
    }, fail: (err) => {
      console.log('服务失败', err)
    }
  })
}

Ble.getBLEDeviceCharacteristics = function (deviceId, serviceId) {
  const that = this;

  wx.getBLEDeviceCharacteristics({
    deviceId,
    serviceId,
    success: (res) => {
      console.log('特征值', res.characteristics)
      for (let i = 0; i < res.characteristics.length; i++) {
        let item = res.characteristics[i]

        if (item.uuid == that.characteristicId) {
          that.notifyBLECharacteristicValueChange(this.deviceId, this.serviceId, this.characteristicId)
        }
      }
    },
    fail(res) {
      console.log('特征值:', res)
    }
  })
}

//开锁
Ble.writeBLECharacteristicValue = function (deviceId, serviceId, buffer) {
  console.log('characteristicId' + this.characteristicId);
  console.log('deviceId' + deviceId)
  console.log('serviceId' + serviceId)
  console.log('buffer' + buffer)
  console.log(JSON.stringify(buffer));

  return new Promise((resolve, reject) => {
    wx.writeBLECharacteristicValue({
      deviceId,//设备的 id 
      serviceId, //0000FFF0-0000-1000-8000-00805F9B34FB
      characteristicId: this.characteristicId,//0000FFF6-0000-1000-8000-00805F9B34FB
      value: buffer,//蓝牙设备特征值对应的二进制值
      success: res => { resolve(res) },
      fail: err => { reject(err) },
      complete: (res) => {
        console.log("指令发送完成：", res);
      }
    })
  })
 

}

//监听蓝牙 特征值变化
Ble.notifyBLECharacteristicValueChange = function (deviceId, serviceId, characteristicId) {
  console.log('qqqq:' + 1111)
  

  //检查次数已经完成 停止循环
  if (Ble.much == 0) {
    console.log('锁测试已完成');
 
    this.much=this.prepareMuch
    this.accumulation += 1;
    console.log('我的第一次累加' + this.accumulation) 
    Ble.startConnect(this)
    return false;
  }

  const that=this;
  wx.notifyBLECharacteristicValueChange({
    state: true,
    deviceId,
    serviceId,
    characteristicId,
    success: res => {
      console.log('监听成功：', res)
      this.onBLECharacteristicValueChange()

      //定义一个全局变量 因为考虑到了循环 默认Testopening=false 开锁==fasle  关锁==true
      if (this.Testopening == false) {

        console.log(that.open_cmd)
        const numflng = 1;
      
          this.connectCallBack(that.open_cmd, numflng);
        this.onBluetoothDeviceFound()
          this.Testopening = true; 
       
      } else if (that.Testopening == true) {
        setTimeout(() => {
          const numflng = 0;
          this.onBluetoothDeviceFound()
          this.connectCallBack(that.close_cmd, numflng);
          this.Testopening = false;
        }, 1000)

      }


    }, fail(err) {
      console.log('监听失败:', err)
    }, complete: (res) => {
      console.log('监听成功执行', res)
    }
  })
}

//获取一个监听值
Ble.onBLECharacteristicValueChange = function () {
  wx.onBLECharacteristicValueChange(res => {
    console.log('123')
    console.log('监听值', this.ab2hex(res.value))
   // this.context.callBack(this.ab2hex(res.value))
  })
}
//停止蓝牙搜索
Ble.stopBluetoothDevicesDiscovery = function () {
  console.log('停止搜索')
  wx.stopBluetoothDevicesDiscovery({
    success: function (res) {
      console.log('停止成功', res)
    }, fail(err) {
      console.log('停止失败', err)
    }, complete(res) {
      console.log('停止搜索执行', res)
    }
  })
}

//指令的回调
Ble.connectCallBack=function(resultData, numflng){
  const that=this;

  console.log(resultData);
  let arr = resultData.split(',');
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

  //开锁开始时间
  this.testdata = { ...this.testdata, start_open_lock: new Date().getTime() };
  apiData.update(this.testdata).then(res => {
    console.log(res)
  }).catch(err => {
    console.log(err)
  })

  //1 是开锁 失败未处理
  if (numflng == 1) {
    this.writeBLECharacteristicValue(this.deviceId, this.serviceId, buffer).then(result => {
      console.log('开锁成功', result);
      wx.showToast({
        title: '开锁成功',
        icon: 'none'
      })
      wx.hideLoading()
      //开锁结束时间
      this.testdata = { ...this.testdata, open_lock: 2,start_open_lock: new Date().getTime() };
      apiData.update(this.testdata).then(res => {
        console.log(res)
        
        that.notifyBLECharacteristicValueChange(that.deviceId, that.serviceId, that.characteristicId)

      }).catch(err => {
        console.log(err)
      })


    }).catch(err => {
      console.log('开锁失败', err)
      wx.showToast({
        title: '开锁失败',
        icon: 'none'
      })
    
      this.testdata = { ...this.testdata, open_lock: 2, start_open_lock: new Date().getTime() };
      apiData.update(this.testdata).then(res => {
        console.log(res)

        //开锁失败，再次开锁
        this.Testopening = false;
        that.notifyBLECharacteristicValueChange(this.deviceId, this.serviceId, this.characteristicId)
        wx.hideLoading()


      }).catch(err => {
        console.log(err)
      })



    })

  }
  //1 是关锁 失败未处理
  if (numflng == 0) {


    //关锁开始时间
    this.testdata = { ...this.testdata, start_close_lock: new Date().getTime() };
    apiData.update(this.testdata).then(res => {
      
      console.log(res)


    }).catch(err => {
      
      console.log(err)
    
    })

    this.writeBLECharacteristicValue(this.deviceId, this.serviceId, buffer).then(result => {
      
      console.log('关锁成功', result);

      wx.showToast({
        title: '关锁成功',
        icon: 'none'
      })


    //关锁结束时间
      this.testdata = { ...this.testdata, close_lock: 3, end_close_lock: new Date().getTime() };
      apiData.update(this.testdata).then(res => {
        console.log(res)
        this.much--;
        this.accumulationPush + 1;

        wx.hideLoading()
        wx.closeBLEConnection({
          deviceId: wx.getStorageSync('device'),
          success(res) {
            console.log(res)
            wx.closeBluetoothAdapter({
              success(res) {
                console.log('========================这=是结束的')
                that.startConnect(this, false)
                console.log(res)
              }, fail: function (err) {
                console.log(err)
              }
            })

          }, fail(err) {
            console.log(err);
          }
        })

      }).catch(err => {
        console.log(err)
      })

       //关锁成功时间
      

     
    }).catch(err => {
      console.log('关锁失败', err)
      wx.showToast({
        title: '关锁失败',
        icon: 'none'
      })
    
      //关锁失败时间
      this.testdata = { ...this.testdata, open_lock: 2, start_open_lock: new Date().getTime() };
      apiData.update(this.testdata).then(res => {
        console.log(res)


      }).catch(err => {
        console.log(err)
      })

      //关锁失败，再次关锁
      this.Testopening = true;
      that.notifyBLECharacteristicValueChange(this.deviceId, this.serviceId, this.characteristicId)

      wx.hideLoading()
    })
  }

}



export default Ble
