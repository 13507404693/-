//BleAutoRunner  蓝牙自动执行
import AutoTestApi from './apis/AutoTestApi.js';
//
const BleAutoRunner = BleAutoRunner || {};
//
BleAutoRunner.model = wx.getSystemInfoSync().model; //当前手机平台
BleAutoRunner.serviceId = '0000FFF0-0000-1000-8000-00805F9B34FB'; //特征值
BleAutoRunner.characteristicId = '0000FFF6-0000-1000-8000-00805F9B34FB'; //特征值
BleAutoRunner.totalTestCount = 0; //测试次数 
BleAutoRunner.deviceList = []; //原始设备列表
BleAutoRunner.selectNums = []; //被选择的设备编号
BleAutoRunner.currentTestCount = 0; //当前请求次数
BleAutoRunner.currentIndex = 0; //当前设备索引
BleAutoRunner.finishCallBack = null; //结束以后的回调
BleAutoRunner.currentTestLog = null; //当前测试的日志
BleAutoRunner.bleDev = null; //当前正在测试的设备
BleAutoRunner.deviceId = null; //当前测试设备ID
BleAutoRunner.retryCount = 0; //重连必须的参数
BleAutoRunner.retry = false; //重连必须的参数
BleAutoRunner.lockCurrentState = false; //当前锁状态 false = 关

/**
 * 转码
 */
BleAutoRunner.ab2hex = function(buffer) { //截取到
  let hexArr = Array.prototype.map.call(new Uint8Array(buffer), bit => ('00' + bit.toString(16)).slice(-2))
  // ArrayBuffer转16进度字符串示例
  return hexArr.join('')
}

/**
 * 开始自动执行
 */
BleAutoRunner.start = (totalTestCount, selectNums, deviceList, currentTestCount, currentIndex, finishCallBack) => {
  //没有测试次数
  if (totalTestCount == 0) {
    wx.showToast({
      title: '没有测试次数',
    })
    return;
  }
  if (selectNums.length == 0) {
    wx.showToast({
      title: '没有测试设备',
    })
    return;
  }
  //测试次数等于总测试次数
  if (totalTestCount <= currentTestCount) {
    //检查是否是最后一个测试设备
    finishCallBack();
    console.log(currentIndex + "'''" + selectNums.length);
    if (currentIndex >= selectNums.length - 1) {
      wx.hideToast();
      //测试完成回调 
      finishCallBack();
      console.log('222----------------')
    } else {
      console.log('111-------------------', currentIndex)  
      //重置测试次数,重新开始下一个设备测试
      BleAutoRunner.start(totalTestCount,selectNums, deviceList, 0, currentIndex+1, finishCallBack);
    }
    return;
  }
  //保存值
  BleAutoRunner.retryCount = 0; //重连必须的参数
  BleAutoRunner.retry = false; //重连必须的参数
  BleAutoRunner.totalTestCount = Math.max(totalTestCount || 0, 0); //测试次数 
  BleAutoRunner.deviceList = deviceList || []; //原始设备列表
  BleAutoRunner.selectNums = selectNums || []; //被选择的设备编号
  BleAutoRunner.currentTestCount = Math.max(currentTestCount || 0, 0); //当前请求次数
  BleAutoRunner.currentIndex = currentIndex ; // Math.max(currentIndex || 0, 0); //当前设备索引
  BleAutoRunner.lockCurrentState = false;
  BleAutoRunner.finishCallBack = finishCallBack || function() { //结束以后的回调
    console.log("执行完成")
  };
  //开始执行蓝牙代码
  BleAutoRunner.execute();
}
/**
 * 执行测试
 */
BleAutoRunner.execute = () => {
  console.log("execute: currentTestCount: " + BleAutoRunner.currentTestCount);
  BleAutoRunner.currentTestCount++; //当前测试次数变成1
  console.log(`currentIndex----${BleAutoRunner.currentIndex}`)
  console.log(`selectNums----${BleAutoRunner.selectNums}`)
  let devNum = BleAutoRunner.selectNums[BleAutoRunner.currentIndex]; //取出一个设备
  console.log("执行前设备号:", devNum);
  BleAutoRunner.bleDev = null;
  for (let i = 0; i < BleAutoRunner.deviceList.length; i++) {
    console.log(BleAutoRunner.deviceList[i].mac_addr + " == " + devNum);
    if (BleAutoRunner.deviceList[i].mac_addr == devNum) {
      BleAutoRunner.bleDev = { ...BleAutoRunner.deviceList[i]
      };
      break;
    }
  }
  if (BleAutoRunner.bleDev == null) {
    console.log(`找不到设备号`);
    return;
  } 
  //  示例数据
  /*
    {
      "id": 20,
      "dev_id": "100035",
      "mac_addr": "0081f99ee411",
      "open_cmd": null,
      "close_cmd": null
    }
  */
  BleAutoRunner.advertisData = devNum;
  wx.showLoading({
    title: `设备:${BleAutoRunner.bleDev.dev_id}`,
    mask:true
  });
  console.log("当前设备", BleAutoRunner.bleDev);
  //创建一个测试日志
  BleAutoRunner.currentTestLog = {
    id: null,
    dev_id: BleAutoRunner.bleDev.dev_id,
    start_time: new Date().getTime(),
    test_count: BleAutoRunner.currentTestCount,
    platform: AutoTestApi.model,
    scan_status: 0,
    start_scan_time: null,
    end_scan_time: null,
    conn_status: 0,
    start_conn_time: null,
    end_conn_time: null,
    open_lock: 0,
    start_open_lock: null,
    end_open_lock: null,
    close_lock: 0,
    start_close_lock: null,
    end_close_lock: null,
    total_count: BleAutoRunner.totalTestCount,
  };
  //存入一条数据
  AutoTestApi.testLog_save(BleAutoRunner.currentTestLog, function(res) {
    BleAutoRunner.startConnect(res.data); //一定要保存成功以后执行
  }, function(err) {
    //保存失败
    wx.showToast("执行出现异常", err);
    BleAutoRunner.finishCallBack();
  });
}

/**
 * 开始连接
 */
BleAutoRunner.startConnect = (logId) => {
  BleAutoRunner.currentTestLog = { ...BleAutoRunner.currentTestLog,
    id: logId,
    scan_status: 1,
    start_scan_time: new Date().getTime()
  };
  const that = BleAutoRunner;
  AutoTestApi.testLog_update(BleAutoRunner.currentTestLog, null, null, function(res) {
    //关闭当前的蓝牙模块
    BleAutoRunner.reOpen();
  });
}
/**
 * 重新打开蓝牙模块
 */
BleAutoRunner.reOpen = () => {
  const that = BleAutoRunner;
  //关闭当前的蓝牙模块
  wx.closeBluetoothAdapter({
    success: (res) => {
      console.log("关闭蓝牙模块成功", res);
      //重新打开蓝牙模块
      wx.openBluetoothAdapter({ //初始化 蓝牙模块  成功 和 失败的回调
        success: res => {
          console.log('初始化蓝牙成功', res)
          that.getBluetoothAdapterState();
        },
        fail: err => {
          console.log('初始化蓝牙是否开启:', err);
          wx.hideLoading();
        },
        complete: function(res) {
          console.log('初始化蓝牙执行完成:', res)

        }
      })
    },
    fail: (err) => {
      console.log("关闭蓝牙模块出错", err);
    },
    complete: (res) => {
      console.log("关闭蓝牙模块完成的", res);
      // ignore
    },
  });
}

/**
 * 获取本机蓝牙适配器状态 判断用户是否开启蓝牙
 */
BleAutoRunner.getBluetoothAdapterState = function() { 
  const that = BleAutoRunner;
  wx.getBluetoothAdapterState({
    success: res => {
      console.log('检测蓝牙是否开启成功', res)
      //discovering 是否正在搜索设备   
      //available 蓝牙适配器是否可用 
      if (res.available == false) {
        wx.showToast({
          title: '设备无法开启蓝牙连接',
          icon: 'none'
        })
        return;
      }
      if (res.discovering == false && res.available) {
        that.startBluetoothDevicesDiscovery()
      }
    },
    fail: err => {
      console.log('检测蓝牙是否开启失败:', err);
      wx.showToast({
        title: '请开启蓝牙',
        icon:'error'
      })
    },
    complete: (res) => {
      console.log('检测蓝牙是否开启完成:', res)
    }
  })
}

/**
 * 这个函数的作用就是只搜索和蓝牙锁相关的mac地址数据
 */
BleAutoRunner.startBluetoothDevicesDiscovery = function() {
  const that = BleAutoRunner;
  wx.startBluetoothDevicesDiscovery({
    services: [that.serviceId],
    allowDuplicatesKey: false,
    success: res => {
      console.log('搜索蓝牙信息失败', res)
      if (!res.isDiscovering) { //是否在搜索到了设备
        that.getBluetoothAdapterState()
      } else {
        that.onBluetoothDeviceFound() //设备参数返回成功 就去执行搜索设备
      }
    },
    fail: err => {
      console.log('搜索蓝牙信息失败', err)
      that.stopBluetoothDevicesDiscovery();
      BleAutoRunner.currentTestLog = { ...BleAutoRunner.currentTestLog,
        scan_status: 3,
        end_scan_time: new Date().getTime()
      };
      AutoTestApi.testLog_update(BleAutoRunner.currentTestLog);
    },
    complete: function(res) {
      console.log('搜索蓝牙信息成功', res)
    }
  })
}
//安卓 是通过 deviceId 与mac 地址配对 然后ios是通过advertisData 通过建立  
// 这里的操作 安卓和ios建立蓝牙多是通过advertisData 转换成二进制来判断连接的
BleAutoRunner.onBluetoothDeviceFound = function() { //搜索相对应的设备
  const that = BleAutoRunner;
  wx.onBluetoothDeviceFound((res) => {
    console.log('搜索到的设备没配对成功', res)
    res.devices.forEach(device => {
      console.log(device)
      let _advertisData = BleAutoRunner.ab2hex(device.advertisData)
     // let _advertisData = BleAutoRunner.bleDev.mac_addr //得到设备的mac地址
      console.log("配对设备mac--------", _advertisData, that.advertisData);
      if (_advertisData == that.advertisData) {
        that.deviceId = device.deviceId;
        console.log('设备已经搜索到，停止搜索')
        that.stopBluetoothDevicesDiscovery() //设备已经搜索到，停止搜索

         BleAutoRunner.currentTestLog = {...BleAutoRunner.currentTestLog,
                  scan_status: 2,
                  end_scan_time: new Date().getTime()
        };

      AutoTestApi.testLog_update(BleAutoRunner.currentTestLog, null, null, function (res) {
        console.log("创建连接", res);
        BleAutoRunner.createBleConnection(BleAutoRunner.retryCount, BleAutoRunner.retry);
      });

      } else if (_advertisData.length>12){ 
        //新版本
        let _advertisDataivFour = _advertisData.substr(0, _advertisData.length-4); 
        console.log('123');
        console.log(_advertisDataivFour);
        if (_advertisDataivFour == that.advertisData){ 
                that.deviceId = device.deviceId;
                that.stopBluetoothDevicesDiscovery() //设备已经搜索到，停止搜索

          BleAutoRunner.currentTestLog = {
            ...BleAutoRunner.currentTestLog,
            scan_status: 2,
            end_scan_time: new Date().getTime()
          };
          AutoTestApi.testLog_update(BleAutoRunner.currentTestLog, null, null, function (res) {
            console.log("创建连接", res);
            BleAutoRunner.createBleConnection(BleAutoRunner.retryCount, BleAutoRunner.retry);
          });

        }
        
       
      }



    })
  })
}

/**
 * 停止蓝牙搜索
 */
BleAutoRunner.stopBluetoothDevicesDiscovery = function() {
  console.log('停止搜索')
  wx.stopBluetoothDevicesDiscovery({
    success: function(res) {
      console.log('停止成功', res)

 
    },
    fail(err) {
      console.log('停止失败', err)
    },
    complete(res) {
      console.log('停止搜索执行', res)
    }
  })
}
/**
 * 保存连接信息,多次连接
 */
BleAutoRunner.createBleConnection = (count, retry) => {
  if (count == 0 && retry == false) {
    BleAutoRunner.retryCount = count;
    BleAutoRunner.retry = retry;
    //开始连接时间
    BleAutoRunner.currentTestLog = { ...BleAutoRunner.currentTestLog,
      conn_status: 1,
      start_conn_time: new Date().getTime()
    };
    AutoTestApi.testLog_update(BleAutoRunner.currentTestLog, null, null, function(res) {
      BleAutoRunner.doConnection(count++);
    });
    return;
  }
  if (count == 6 && retry == false) { //三秒没有连接上
    BleAutoRunner.retryCount = 0;
    BleAutoRunner.retry = true;
    BleAutoRunner.reOpen(); //重新打开
    return;
  }
  if (count == 6 && retry == true){
    //蓝牙连接彻底失败 ,记录一下
    BleAutoRunner.currentTestLog = {
      ...BleAutoRunner.currentTestLog,
      conn_status: 3,
      end_conn_time: new Date().getTime()
    };
    AutoTestApi.testLog_update(BleAutoRunner.currentTestLog, null, null, function(res) {
      //彻底放弃这台设备的测试,开启下一台设备的测试
      BleAutoRunner.start  (BleAutoRunner.totalTestCount, BleAutoRunner.deviceList, 0,
        BleAutoRunner.currentIndex +1, BleAutoRunner.finishCallBack)
    });
    return;
  }
  //具体的连接代码
  BleAutoRunner.doConnection(count++, retry);
}
/**
 * 开始执行微信连接
 */
BleAutoRunner.doConnection = (count, retry) => {
  const that = BleAutoRunner;
  wx.createBLEConnection({
    deviceId: that.deviceId,
    success: res => {
      console.log('连接蓝牙', res)
      if (res.errCode == 0) {
        wx.hideLoading() //连接成功  关闭提示狂
        wx.showToast({
          title: '蓝牙连接设备成功',
          icon: 'none'
        })
        //蓝牙连接彻底失败 ,记录一下
        BleAutoRunner.currentTestLog = {
          ...BleAutoRunner.currentTestLog,
          conn_status: 2,
          end_conn_time: new Date().getTime()
        };
        AutoTestApi.testLog_update(BleAutoRunner.currentTestLog, null, null, function(res) {
          //开启监听
          that.getBLEDeviceServices(that.deviceId)
        });

      }
    },
    fail: err => {
      console.log('连接失败:', err)
      that.createBleConnection(count++, retry);
    },
    complete: function(res) {
      console.log('连接蓝牙执行', res)
    }
  })
}

/**
 * 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  获取蓝牙所有的服务 主要的是蓝牙的uuid
 */
BleAutoRunner.getBLEDeviceServices = function(deviceId) {
  const that = BleAutoRunner;
  wx.getBLEDeviceServices({
    deviceId,
    success: (res) => {
      console.log('获取蓝牙所有的服务 主要的是蓝牙的uuid成功', res)
      //that.serviceId
      console.log('serviceId---uuid '+res.services[0].uuid)
     // that.getBLEDeviceCharacteristics(res.deviceId, res.services[0].uuid);
      that.getBLEDeviceCharacteristics(that.deviceId, that.serviceId)
    },
    fail: (err) => {
      console.log('获取蓝牙所有的服务 主要的是蓝牙的uuid失败', err)
    },
    complete(res) {
      console.log('获取蓝牙所有的服务 主要的是蓝牙的uuid执行完成', res)
    }
  })
}

//获取蓝牙某个服务中所有的特征值 uuid properties的支持性
BleAutoRunner.getBLEDeviceCharacteristics = function(deviceId, serviceId) {
  const that = BleAutoRunner;
  wx.getBLEDeviceCharacteristics({
    deviceId,//蓝牙设备 id
    serviceId,//蓝牙服务 uuid，需要使用 getBLEDeviceServices 获取
    success: (res) => {
      console.log(res);
      console.log('特征值', res.characteristics)
      for (let i = 0; i < res.characteristics.length; i++) {
        let item = res.characteristics[i];

        console.log(item.uuid, that.characteristicId)
        if (item.uuid == that.characteristicId) {
         // that.characteristicId = item.uuid    
          that.writeOpen();     
          //that.notifyBLECharacteristicValueChange(res.deviceId,res.serviceId, that.characteristicId)
          break;
        }
      }
    },
    fail(res) {
      console.error('特征值:', res)
    },
    complete: (res) => {
      console.log('特征值执行', res)
    }
  })
}

// 监听蓝牙 特征值变化 
// 启用低功耗蓝牙设备特征值变化时的 notify 功能，必须先启用，才能够监听到事件
BleAutoRunner.notifyBLECharacteristicValueChange = function(deviceId, serviceId, characteristicId) {
  console.log('123')
  const that = BleAutoRunner;
  wx.notifyBLECharacteristicValueChange({
    state: true, //启用 notify 功能
    deviceId,// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    serviceId,// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
    characteristicId,  // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
    success: res => {
      console.log('启用监听成功：', res)
     
      that.onBLECharacteristicValueChange()
    },
    fail(err) {
      console.log('启用监听失败:', err)
    },
    complete: (res) => {
      console.log('启用监听完成', res)
    }
  })
}

//获取一个监听值 低功耗蓝牙设备的特征值变化事件的回调函数
BleAutoRunner.onBLECharacteristicValueChange = function() {
  console.log('1---------------------------------------')
  const that = BleAutoRunner;
  wx.onBLECharacteristicValueChange(res => {
    console.log("---------------------onBLECharacteristicValueChange",res);
    that.listenBlue(BleAutoRunner.ab2hex(res.value)); //监听的数据同步到后台
  });
}

/**
 * 监听
 */
BleAutoRunner.listenBlue = (val) => {
  console.log("监听的值:", val);
  if (BleAutoRunner.lockCurrentState == false) {
    BleAutoRunner.lockCurrentState = true;
    BleAutoRunner.currentTestLog = {
      ...BleAutoRunner.currentTestLog,
      open_lock: 2,
      end_open_lock: new Date().getTime()
    };
    AutoTestApi.testLog_update(BleAutoRunner.currentTestLog, null, null, function(res) {
      BleAutoRunner.writeClose();
    });
  }else {
    BleAutoRunner.lockCurrentState = false;
  }
  //如果是开锁指令,就写入开锁完成时间
  //如果是关锁指令,就陷入关锁指令完成时间
}
/**
 * 开锁指令
 */
BleAutoRunner.writeOpen = () => {
  let config = wx.getStorageSync("config");
  config = JSON.parse(config);
  console.log(config.openTime);
  console.log("发送开锁命令");
  //写入开锁指令之前 ,记录一下
  BleAutoRunner.currentTestLog = {
    ...BleAutoRunner.currentTestLog,
    open_lock: 1,
    start_open_lock: new Date().getTime()
  };
  const that = BleAutoRunner;
  AutoTestApi.testLog_update(BleAutoRunner.currentTestLog, null, null, function(res) {
    //获取蓝牙开锁指令
    let arr = BleAutoRunner.bleDev.open_cmd.split(',');
    console.log("开锁指令:", arr);
    const openCMD = BleAutoRunner.cmd(arr);
    console.log("写入开锁指令");
    BleAutoRunner.writeBLECharacteristicValue(BleAutoRunner.deviceId, BleAutoRunner.serviceId, openCMD,function(){
      console.log("写入完成,开启监听");
      wx.showToast({
        title: '开锁成功',
        icon: 'none'
      })
      setTimeout(function(){
        BleAutoRunner.writeClose(); //
      }, config.openTime);
      
    });
    
    // intensity: Number.parseInt(config.openPwm),
    //   openTime: Number.parseInt(config.openTime),
    //     closeTime: Number.parseInt(config.closeTime)

  });
}

/**
 * 关锁指令
 */
BleAutoRunner.writeClose = () => {
  let config = wx.getStorageSync("config");
  config = JSON.parse(config);

  const that = BleAutoRunner;
  //写入开锁指令之前 ,记录一下
  BleAutoRunner.currentTestLog = {
    ...BleAutoRunner.currentTestLog,
    close_lock: 1,
    start_close_lock: new Date().getTime()
  };
  AutoTestApi.testLog_update(BleAutoRunner.currentTestLog, null, null, function(res) {
    //获取蓝牙关锁指令
    let arr = BleAutoRunner.bleDev.close_cmd.split(',');
    console.log("关锁指令:", arr);
    const closeCMD = BleAutoRunner.cmd(arr);
    BleAutoRunner.writeBLECharacteristicValue(BleAutoRunner.deviceId, BleAutoRunner.serviceId, closeCMD,function(){
      console.log(`关锁指令:${res}`)
      wx.showToast({
        title: '关锁成功',
        icon: 'none'
      })
      setTimeout(function(){
        //开启下一轮测试
        BleAutoRunner.closeBLEConnection()
        }, config.closeTime);
    });
  });
}

/**
 * 往蓝牙中写入一个命令
 */
BleAutoRunner.writeBLECharacteristicValue = function(deviceId, serviceId, cmd, success, fail, complete) {
  wx.writeBLECharacteristicValue({
    deviceId, //设备的 id 
    serviceId, //0000FFF0-0000-1000-8000-00805F9B34FB
    characteristicId: BleAutoRunner.characteristicId, //0000FFF6-0000-1000-8000-00805F9B34FB
    value: cmd, //蓝牙设备特征值对应的二进制值
    success: success || function(res) {
      console.log("命令写入成功", res);
    },
    fail: fail || function(err) {
      console.log("命令写入失败", err);
    },
    complete: complete || function(res) {
      console.log("指令发送完成：", res);
    }
  })
}

/**
 * 关闭连接
 */
BleAutoRunner.closeBLEConnection = (success) => {
  wx.closeBLEConnection({
    deviceId: wx.getStorageSync('device'),
    success(res) {
      console.log("关闭蓝牙连接成功", res);
      wx.closeBluetoothAdapter({
        success: success || function(res) {
          console.log("1-----关闭蓝牙模块成功", res);
         
          console.log("1-----关闭---索引", BleAutoRunner.currentIndex);

          BleAutoRunner.start(BleAutoRunner.totalTestCount, BleAutoRunner.selectNums, BleAutoRunner.deviceList, BleAutoRunner.currentTestCount, BleAutoRunner.currentIndex, BleAutoRunner.finishCallBack)

        // wx.showLoading({
        //   title: '测试重连接中...',
        //   mask:true
        // })

        wx.showToast({
          title: '测试重连接中...',
          icon:'none',
          duration:3000
        })

        },
        fail: function(err) {
          console.log("1关闭蓝牙模块失败", err)
        },
        complete: function(res) {
          console.log("1关闭蓝牙模块完成", res);
        }
      })
    },
    fail(err) {
      console.log("关闭蓝牙连接失败", err);
      wx.closeBluetoothAdapter({
        success: success || function(res) {
          console.log("2关闭蓝牙模块成功", res);
          BleAutoRunner.start(BleAutoRunner.totalTestCount, BleAutoRunner.selectNums, BleAutoRunner.deviceList, BleAutoRunner.currentTestCount+1, BleAutoRunner.currentIndex , BleAutoRunner.finishCallBack)
        },
        fail: function(err) {
          console.log("2关闭蓝牙模块失败", err)
        },
        complete: function(res){
          console.log("2关闭蓝牙模块完成", res);
        }
      })
    },
    complete: function(res) {
      console.log('关闭蓝夜连接完成', res)
    }
  })
}

/**
 * 开锁指令
 */
BleAutoRunner.cmd = (arr) => {
  let buffer = new ArrayBuffer(16)
  let view = new DataView(buffer, 0, 16);

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
  return buffer;
}


export default BleAutoRunner;