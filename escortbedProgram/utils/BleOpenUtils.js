/**
 * 微信蓝牙接口封装
 */
import Cmd from './Cmd.js';
import Api from './api.js';

const BleOpenUtils = BleOpenUtils || {}

BleOpenUtils.openFlag = false;
BleOpenUtils.closeFlag = false;
BleOpenUtils.serviceId = '0000FFF0-0000-1000-8000-00805F9B34FB';
BleOpenUtils.characteristicId = '0000FFF6-0000-1000-8000-00805F9B34FB';
BleOpenUtils.callBackSetState = null;
BleOpenUtils.token = null;
BleOpenUtils.advertisData = null;
BleOpenUtils.lockStatus = 'close'; //只为在开锁的时候，不能重复的点击
BleOpenUtils.deviceNum = null;
BleOpenUtils.deviceId = null;
BleOpenUtils.deviceInfo = null;
BleOpenUtils.closeCallBack = null;
BleOpenUtils.openSuccess = null;
/**
 * 判断蓝牙是否开启 
 */
BleOpenUtils.checkBluetooth = (setStateCallBack) => {
    wx.openBluetoothAdapter({
      success(res) {
        setStateCallBack(true);
        console.log("蓝牙已经开启", res);
      },
      fail(res) {
        setStateCallBack(false);
        console.log("蓝牙未开启", res);
      },
      complete(res) {
        console.log("判断蓝牙是否开启完成", res);
      }
    })
  },

  /**
   * 开锁界面开始连接蓝牙
   * @param openFlag 重新卸载模块然后重连的标识
   * @param callBack 页面回调函数
   * @param token 用户标志
   * @param advertisData 输入设备号 得到后台人驻设备的 mac地址
   */
  BleOpenUtils.openBleStartConnect = (openFlag, callBackSetState, token, advertisData, deviceInfo, deviceNum, openSuccess) => {
    if (!openFlag) {
      wx.showLoading({
        title: '蓝牙连接中',
        mask: true
      })
    }
    BleOpenUtils.openFlag = openFlag || false;
    BleOpenUtils.callBackSetState = callBackSetState;
    BleOpenUtils.token = token;
    BleOpenUtils.advertisData = advertisData;
    BleOpenUtils.deviceInfo = deviceInfo;
    BleOpenUtils.deviceNum = deviceNum;
    BleOpenUtils.openSuccess = openSuccess;
    console.log("device info", BleOpenUtils.deviceInfo);
    //
    const that = BleOpenUtils;
    //关闭当前的蓝牙模块
    wx.closeBluetoothAdapter({
      success: (res) => {
        console.log("关闭蓝牙模块成功", res);
        //重新打开蓝牙模块
        wx.openBluetoothAdapter({ //初始化 蓝牙模块  成功 和 失败的回调
          success: res => {
            console.log('初始化蓝牙成功', res)
            callBackSetState(true)
            that.getBluetoothAdapterState()
          },
          fail: err => {
            console.log('初始化蓝牙是否开启:', err);
            callBackSetState(false);
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
BleOpenUtils.getBluetoothAdapterState = function() {
  const that = BleOpenUtils;
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
    },
    complete: (res) => {
      console.log('检测蓝牙是否开启完成:', res)
    }
  })

}
/**
 * 这个函数的作用就是只搜索和蓝牙锁相关的mac地址数据
 */
BleOpenUtils.startBluetoothDevicesDiscovery = function() {
  const that = BleOpenUtils;
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
      that.stopBluetoothDevicesDiscovery()
    },
    complete: function(res) {
      console.log('搜索蓝牙信息成功', res)
    }
  })
}


//安卓 是通过 deviceId 与mac 地址配对 然后ios是通过advertisData 通过建立  
// 这里的操作 安卓和ios建立蓝牙多是通过advertisData 转换成二进制来判断连接的
BleOpenUtils.onBluetoothDeviceFound = function() { //搜索相对应的设备
  const that = BleOpenUtils;
  wx.onBluetoothDeviceFound((res) => {
    console.log('搜索到的设备没配对成功', res)
    res.devices.forEach(device => {
      let _advertisData = Cmd.ab2hex(device.advertisData) //得到设备的mac地址
      console.log("设备mac", _advertisData);
      if (_advertisData == that.advertisData) {
        that.deviceId = device.deviceId;
        that.stopBluetoothDevicesDiscovery() //设备已经搜索到，停止搜索
        console.log('设备已经搜索到，停止搜索')
        that.openlock(0); //创建连接，并多次尝试
      }
    })
  })
}

/**
 * 往蓝牙中写入一个命令
 */
BleOpenUtils.writeBLECharacteristicValue = function(deviceId, serviceId, cmd, success, fail, complete) {
  wx.writeBLECharacteristicValue({
    deviceId, //设备的 id 
    serviceId, //0000FFF0-0000-1000-8000-00805F9B34FB
    characteristicId: BleOpenUtils.characteristicId, //0000FFF6-0000-1000-8000-00805F9B34FB
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
 * 停止蓝牙搜索
 */
BleOpenUtils.stopBluetoothDevicesDiscovery = function() {
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
 * 尝试多次连接
 */
BleOpenUtils.openlock = function(count) {
  //连接蓝牙之后，就一直是true·
  if (count == 6 && BleOpenUtils.openFlag == false) {
    //五次没有连接上，重新卸载蓝牙模块，重新连接
    BleOpenUtils.openBleStartConnect(true, BleOpenUtils.callBackSetState,
      BleOpenUtils.token, BleOpenUtils.advertisData, BleOpenUtils.deviceInfo,
      BleOpenUtils.deviceNum, BleOpenUtils.openSuccess);
    return;
  }

  //成立 
  if (count == 6 && BleOpenUtils.openFlag == true) {
    //执行到这一步 一定是deviceId值错误
    wx.showToast({
      title: '连接中断,请重试',
      icon: 'none'
    })

    wx.closeBluetoothAdapter({
      success(res) {
        console.log('关闭模块成功', res)

        wx.navigateBack({
          data: 1,
        })

        return;
      },
      fail: function(err) {
        console.log('关闭模块失败', err)
      },
      complete(res) {
        console.log('关闭模块完成', res)
      }
    })
  }

  const that = BleOpenUtils;
  //500毫秒连接一次，连接一次失败，继续连接，直到10次连接失败，就让他跳转首页
  setTimeout(() => {
    wx.createBLEConnection({
      deviceId: that.deviceId,
      success: res => {
        console.log('连接蓝牙', res)
        if (res.errCode == 0) {
          //wx.hideLoading() //连接成功  关闭提示狂
          // wx.showToast({
          //   title: '蓝牙连接设备成功',
          //   icon: 'none'
          // })
          setTimeout(() => {
            wx.showLoading({
              title: '加载中',
              mask: true
            })
          }, 300)

          that.getBLEDeviceServices(that.deviceId)
        }
      },
      fail: err => {
        console.log('连接失败:', err)
        console.log(count);
        that.openlock(count + 1);
      },
      complete: function(res) {
        console.log('连接蓝牙执行', res)
      }
    })
  }, 500)
}

/**
 * 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  获取蓝牙所有的服务 主要的是蓝牙的uuid
 */
BleOpenUtils.getBLEDeviceServices = function(deviceId) {
  const that = BleOpenUtils;
  wx.getBLEDeviceServices({
    deviceId,
    success: (res) => {
      console.log('获取蓝牙所有的服务 主要的是蓝牙的uuid成功', res)
      that.getBLEDeviceCharacteristics(that.deviceId, that.serviceId);
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
BleOpenUtils.getBLEDeviceCharacteristics = function(deviceId, serviceId) {
  const that = BleOpenUtils;
  wx.getBLEDeviceCharacteristics({
    deviceId,
    serviceId,
    success: (res) => {
      console.log('特征值', res.characteristics)
      for (let i = 0; i < res.characteristics.length; i++) {
        let item = res.characteristics[i]
        if (item.uuid == that.characteristicId) {
          that.notifyBLECharacteristicValueChange(that.deviceId, that.serviceId, that.characteristicId);
          setTimeout(function() {
            //写入一系列的命令
            that.writeCmd();
          }, 500);
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

//监听蓝牙 特征值变化 
//启用低功耗蓝牙设备特征值变化时的 notify 功能，必须先启用，才能够监听到事件
BleOpenUtils.notifyBLECharacteristicValueChange = function(deviceId, serviceId, characteristicId) {
  const that = BleOpenUtils;
  wx.notifyBLECharacteristicValueChange({
    state: true,
    deviceId,
    serviceId,
    characteristicId,
    success: res => {
      console.log('启用监听成功：', res)
      that.onBLECharacteristicValueChange();
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
BleOpenUtils.onBLECharacteristicValueChange = function() {
  const that = BleOpenUtils;
  wx.onBLECharacteristicValueChange(res => {
    that.listenBlue(Cmd.ab2hex(res.value)); //监听的数据同步到后台
  });
}

//停止蓝牙搜索
BleOpenUtils.stopBluetoothDevicesDiscovery = function() {
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
 * 写入各种操作
 */
BleOpenUtils.writeCmd = () => {


    new Promise(function(resolve, reject) {
      BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, Cmd.cell(), function(res) {
        console.log('电量', res);
        resolve("电量");
      });
    }).then(res => {

      return new Promise(function(resolve, reject) {
        BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, Cmd.lockState(), function(res) {
          console.log('锁状态', res);
          resolve("锁状态");
        });
      });
      // }).then(res => {
      //   return new Promise(function(resolve, reject) {
      //     BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, Cmd.machineState(), function(res) {
      //       console.log('柜机状态', res);
      //       resolve("柜机状态");
      //     });
      //   });
    }).then(res => {
      return new Promise(function(resolve, reject) {
        BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, Cmd.versions(), function(res) {
          console.log('版本号', res);
          resolve("版本号");
        });
      });
    }).then(res => {
      return new Promise(function(resolve, reject) {
        let ntp = BleOpenUtils.deviceInfo.tmOrder.split(',')
        BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, Cmd.ntp(ntp), function(res) {
          console.log('校准时间', res);
          resolve("校准时间");
        });
      });

    }).then(res => {
      return new Promise(function(resolve, reject) {
        let disinfection = BleOpenUtils.deviceInfo.xdOrder.split(',')
        BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, Cmd.disinfection(disinfection), function(res) {
          console.log("消毒指令", res);
          resolve("消毒指令");
        });
      });

      // }).then(res => {
      //   return new Promise(function(resolve, reject) {
      //     BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, Cmd.previousOrderA(), function(res) {
      //       console.log('上一个订单a', res);
      //       resolve("上一个订单a");
      //     });
      //   });
      // }).then(res => {
      //   return new Promise(function(resolve, reject) {
      //     BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, Cmd.previousOrderB(), function(res) {
      //       console.log('上一个订单b', res);
      //       resolve("上一个订单b");
      //     });
      //   });
      // }).then(res => {
      //   return new Promise(function(resolve, reject) {
      //     BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, Cmd.getTime(), function(res) {
      //       console.log('获取时间', res);
      //       resolve("获取时间");
      //     });
      //   });
      // }).then(res => {
      //   console.log("执行完成");
      //   setTimeout(function() {
      //     wx.hideLoading();
      //   }, 500);

    });

  },
  /**
   * 关闭连接
   */
  BleOpenUtils.closeBLEConnection = (success) => {
    wx.closeBLEConnection({
      deviceId: wx.getStorageSync('device'),
      success(res) {
        console.log("关闭蓝牙连接成功", res);
        wx.closeBluetoothAdapter({
          success: success || function(res) {
            console.log("1关闭蓝牙模块成功", res);
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
            console.log("1关闭蓝牙模块成功", res);
          },
          fail: function(err) {
            console.log("1关闭蓝牙模块失败", err)
          },
          complete: function(res) {
            console.log("1关闭蓝牙模块完成", res);
          }
        })
      },
      complete: function(res) {
        console.log('关闭蓝夜连接完成', res)
      }
    })
  }

/**
 * 监听
 */
BleOpenUtils.listenBlue = (val) => {
  const that = BleOpenUtils;
  Api.listenBlue(that.token, that.deviceNum, val, function(res) {
    console.log("listenBlue ------- ", res.data.resultCode);
    //res.data.resultCode == 200017 ||
    if (res.data.resultCode == 200040) { //兼容之前版本
      //向蓝牙写订入单号
      console.log("向蓝牙写订入单号", res.data, val);
      if (!res.data.resultData) {
        //开锁状态
        return;
      }
      let arr = res.data.resultData.split(',');
      that.writeBLECharacteristicValue(that.deviceId, that.serviceId, Cmd.order(arr), function(res) {
        console.log('蓝牙设备写入订单成功', res);

        setTimeout(function() {
          BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, Cmd.lockState(), function(res) {
            console.log('开锁后的锁状态', res);
          }, null, function(res) {
            console.log("开锁状态写入完成,无论成功和失败,都会走", res);
            setTimeout(function() {
              that.closeBLEConnection(function() {
                //查询到订单，保存到全局，然后到支付页面
                BleOpenUtils.openSuccess();
              });
            }, 500);
          });
        }, 500);

      })
    } else if (res.data.resultCode == 200020) {
      console.log("失败的信息");
      wx.showToast({
        title: res.data.resultMsg,
        icon: 'none'
      })
    } else if (res.data.resultCode == 200037) {
      wx.showToast({
        title: '设备正在被别人使用',
        icon: 'none',
      })
    } else if (res.data.resultCode == 200028) { //核对蓝牙时间成功
      // COLLATE_TIME(200028, "核对蓝牙时间成功！"),
      // COLLATE_TIME_FAIL(200029, "核对蓝牙时间失败！"),
      console.log("核对蓝牙时间成功");
      //等待200 毫秒,开锁获取蓝牙里面的时间
      setTimeout(function() {
        BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, Cmd.getTime(), function(res) {
          console.log('获取时间', res);
        });
      }, 200);
    } else if (res.data.resultCode == 200029) {
      console.log("核对蓝牙时间失败！");
      wx.showToast({
        title: res.data.resultMsg,
        icon: 'none',
        duration: 2000,
        success: () => {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        }
      })
    } else if (res.data.resultCode == 200033) { //写入订单失败 200032写入订单成功
      wx.showToast({
        title: "网络错误,请重新操作",
        icon: 'none',
        duration: 2000,
        success: function() {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        }
      });
    } else if (res.data.resultCode == 200034) {
      if (res.data.resultData.power < 5) {
        wx.showToast({
          title: "电量过低",
          icon: 'none',
          duration: 2000
        })
      }
    } else if (res.data.resultCode == 200042) {
      wx.showToast({
        title: res.data.resultMsg,
        icon: 'none',
        duration: 2000,
        success: () => {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        }
      })
    } else if (res.data.resultCode == 200043) {
      //200042, "蓝牙校验时间超出有效范围！"
      //200043, "蓝牙校验时间成功！"
      //如果获取时间成功,并且获取时间的验证是正确的
      //发送上一个订单的开始时间
      BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, Cmd.previousOrderA(), function(res) {
        console.log('上一个订单a', res);
      });
    } else if (res.data.resultCode == 200035) {
      //如果订单开始时间成功
      //发送上一个订单的结束时间
      BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, Cmd.previousOrderB(), function(res) {
        console.log('上一个订单b', res);
      });
    } else if (res.data.resultCode == 200036) { //上一个订单的结束时间发送也成功
      wx.hideLoading();
      wx.showToast({
        title: '连接设备成功',
      })
    } else {
      console.log(res.data.resultMsg);
    }
  });
}

/**
 * 重试开锁
 */
BleOpenUtils.tryOpenLock = (tryCount, deviceNum, buffer) => {
  console.log("tryopenlock", deviceNum);
  BleOpenUtils.tryCount = tryCount;
  BleOpenUtils.deviceNum = deviceNum;

  BleOpenUtils.notifyBLECharacteristicValueChange(BleOpenUtils.deviceId, BleOpenUtils.serviceId, BleOpenUtils.characteristicId);
  BleOpenUtils.writeBLECharacteristicValue(BleOpenUtils.deviceId, BleOpenUtils.serviceId, buffer, function(res) {
    console.log("写入开锁成功", res);
  }, function(err) {
    wx.hideLoading();
    wx.showModal({
      title: '系统提示',
      content: '已发送开锁指令,如果锁没有开,请重新点击开锁',
      showCancel: false,
      confirmText: "我知道了",
      success: (res) => {
        if (res.confirm) {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        }
      }
    })
  });
}
/**
 * 关锁入口
 */
BleOpenUtils.startCloseConnect = (token, advertisData, closeFlag, callBackSetState, closeCallBack) => {
  const that = BleOpenUtils;
  that.closeFlag = closeFlag || false;
  that.token = token;
  that.advertisData = advertisData;
  that.callBackSetState = callBackSetState;
  that.closeCallBack = closeCallBack;

  wx.closeBluetoothAdapter({
    success: res => {
      wx.openBluetoothAdapter({ //初始化 蓝牙模块  成功 和 失败的回调
        success: res => {
          console.log('初始化蓝牙成功', res)
          callBackSetState(true);
          that.getCloseBluetoothAdapterState()
        },
        fail: err => {
          console.log('初始化蓝牙失败:', err);
          wx.hideLoading();
          callBackSetState(false);
        },
        complete: function(res) {
          console.log('初始化蓝牙成功失败返回:', res)
        }
      })

    },
    fail: (err) => {
      console.log('关闭蓝牙失败：', err)
    },
    complete: function(res) {
      console.log('关闭蓝牙模块成功失败返回：', res)
    }
  })
}
/**
 * 关锁状态处理
 */
BleOpenUtils.getCloseBluetoothAdapterState = () => {
  const that = BleOpenUtils;
  wx.getBluetoothAdapterState({ //获取本机蓝牙适配器状态 
    success: res => {
      console.log('蓝牙状态', res)
      //discovering 是否正在搜索设备   available 蓝牙适配器是否可用 
      if (!res.available) {
        wx.showToast({
          title: '设备无法开启蓝牙连接',
          icon: 'none'
        })
      } else {
        that.startCloseBluetoothDevicesDiscovery();
      }
    },
    fail: function(err) {
      console.log('蓝牙状态失败', err)
    },
    complete: function(res) {
      console.log('蓝牙适配器状态成功失败返回:', res)
    }
  })
}

/**
 * 开始搜寻附近的蓝牙外围设备
 */
BleOpenUtils.startCloseBluetoothDevicesDiscovery = function() {
  wx.startBluetoothDevicesDiscovery({
    //搜索对应设备的id   以微信硬件平台的蓝牙智能灯为例，
    //主服务的 UUID 是 FEE7。传入这个参数，只搜索主服务 UUID 为 FEE7 的设备
    services: [BleOpenUtils.serviceId],
    allowDuplicatesKey: false,
    success: res => {
      console.log('关锁搜索蓝牙成功:', res)
      if (!res.isDiscovering) {
        BleOpenUtils.getCloseBluetoothAdapterState()
      } else {
        BleOpenUtils.onCloseBluetoothDeviceFound() //设备参数返回成功 就去执行搜索到设备
      }
    },
    fail: err => {
      console.log('主服务失败:', err)
      BleOpenUtils.stopBluetoothDevicesDiscovery()
    },
    complete: function(res) {
      console.log('主服务成功失败返回:', res)
    }
  })
}
//搜索相对应的设备
BleOpenUtils.onCloseBluetoothDeviceFound = function() {
  const that = BleOpenUtils;
  wx.onBluetoothDeviceFound((res) => {
    //console.log('设备已搜索到', res)
    res.devices.forEach(device => {
      let _advertisData = Cmd.ab2hex(device.advertisData) //得到设备的mac地址    
      if (_advertisData == that.advertisData) {
        that.deviceId = device.deviceId;
        that.stopBluetoothDevicesDiscovery();
        that.tryClose(0)
      }
    })
  })
}

/**
 * 尝试多次关锁
 */
BleOpenUtils.tryClose = function(count) {
  if (count == 6 && BleOpenUtils.closeFlag == false) {
    console.log('启动第二次尝试关锁')
    BleOpenUtils.startCloseConnect(BleOpenUtils.token, BleOpenUtils.advertisData, true, BleOpenUtils.callBackSetState)
    return;
  }
  console.log('重新连接', BleOpenUtils.deviceId)
  if (count == 6 && BleOpenUtils.closeFlag == true) {
    wx.hideLoading();
    wx.showLoading({
      title: '连接失败,重试中',
      mask: true
    })
    BleOpenUtils.closeFlag == false;
    wx.showToast({
      title: '关锁失败,请重试',
      icon: 'none'
    })
    return;
  }

  const that = BleOpenUtils;
  setTimeout(() => {
    wx.createBLEConnection({
      deviceId: BleOpenUtils.deviceId,
      success: res => {
        console.log('关锁连接成功', res)
        if (res.errCode == 0) {
          BleOpenUtils.getCloseBLEDeviceServices(BleOpenUtils.deviceId)
        }
      },
      fail: err => {
        console.log('关锁连接失败', err)
        that.tryClose(count + 1);
      },
      complete: function(res) {
        console.log('关锁连接执行完成:', res)
      }
    })
  }, 200)
}
//获取蓝牙服务
BleOpenUtils.getCloseBLEDeviceServices = function(deviceId) {
  const that = BleOpenUtils;
  wx.getBLEDeviceServices({
    deviceId,
    success: (res) => {
      console.log('获取蓝牙服务成功', res)
      that.getCloseBLEDeviceCharacteristics(deviceId, that.serviceId)
    },
    fail: (err) => {
      console.log('获取蓝牙服务失败', err)
    },
    complete: function(res) {
      console.log('获取蓝牙服务执行完成:', res)
    }
  })
}
/**
 * 根据特征值监控
 */
BleOpenUtils.getCloseBLEDeviceCharacteristics = function(deviceId, serviceId) {
  const that = BleOpenUtils;
  wx.getBLEDeviceCharacteristics({
    deviceId,
    serviceId,
    success: (res) => {
      console.log('特征值', res.characteristics)
      for (let i = 0; i < res.characteristics.length; i++) {
        let item = res.characteristics[i]
        if (item.uuid == that.characteristicId) {
          that.notifyCloseBLECharacteristicValueChange(that.deviceId, that.serviceId, that.characteristicId);
          setTimeout(function() {
            that.writeClose();
          }, 500);
          break;
        }
      }
    },
    fail(res) {
      console.error('特征值失败', res)
    },
    complete: function(res) {
      console.log('特征值成功失败返回:', res)
    }
  })
}

//监听蓝牙 特征值变化 
//启用低功耗蓝牙设备特征值变化时的 notify 功能，必须先启用，才能够监听到事件
BleOpenUtils.notifyCloseBLECharacteristicValueChange = function(deviceId, serviceId, characteristicId) {
  const that = BleOpenUtils;
  wx.notifyBLECharacteristicValueChange({
    state: true,
    deviceId,
    serviceId,
    characteristicId,
    success: res => {
      console.log('启用监听成功：', res)
      that.onCloseBLECharacteristicValueChange()
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
BleOpenUtils.onCloseBLECharacteristicValueChange = function() {
  const that = BleOpenUtils;
  wx.onBLECharacteristicValueChange(res => {
    that.closeListenBlue(Cmd.ab2hex(res.value)); //监听的数据同步到后台
  });
}
/**
 *
 *  
 */
BleOpenUtils.closeListenBlue = (val) => {
  const that = BleOpenUtils;
  //关锁的状态监听
  that.closeBLEConnection(function() {
    BleOpenUtils.closeCallBack(val); //use.js closeCallBack
  });
}


/**
 * 写入关锁指令
 */
BleOpenUtils.writeClose = () => {
  const that = BleOpenUtils;
  BleOpenUtils.writeBLECharacteristicValue(that.deviceId, that.serviceId, Cmd.lockState(), function(res) {
    console.log("写入关锁指令");
  })
}

export default BleOpenUtils;