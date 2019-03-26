const Api = Api || {};
// Api.host = 'https://bed.leagoohealth.com'; //正式
Api.host = 'https://testbed.leagoohealth.com'; //测试


/**
 * 获取地址栏参数
 * @param 参数名称
 * @url 地址栏
 */
Api.getQueryString = (name, url) => {
  if (url && url.indexOf('?') == -1) return null
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)")
  let startIndex = url.indexOf('?') + 1
  var r = url.substr(startIndex).match(reg)
  if (r != null) {
    return unescape(r[2])
  }
  return null
}
/**
 * 后台登录
 */
Api.login = (code, success, fail, complete) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/login/loginWx',
    data: {
      code: code
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: success || function(res) {
      console.log("login success");
    },
    fail: fail || function(err) {
      console.log("login fail");
    },
    complete: complete || function(res) {
      console.log('login complete', res);
    }
  })
}
/**
 * 检查当前用是否有未完成的订单
 */
Api.checkOrder = (token, success, fail, complete) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/v2/queryUserUnpaidOrder',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: success || function(res) {
      console.log("检查订单成功", res);
    },
    fail: fail || function(err) {
      console.log('检查订单出现异常', err)
    },
    complete: complete || function(res) {
      console.log('成功执行', res)
    }
  })
}
/**
 * 根据设备号，到后台获取设备信息
 */
Api.getDeviceInfo = (token, deviceNum, success, fail, complete) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/queryBedByDeviceNum',
    data: {
      deviceNum: deviceNum
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: success || function(res) {
      console.log("根据设备获取信息成功", res);
    },
    fail: fail || function(err) {
      console.log('根据设备获取信息失败', err)
    },
    complete: complete || function(res) {
      console.log("根据设备获取信息完成", res);
    }
  })
}
/**
 * 检查是否要退押金
 */
Api.chekcDeposit = (token, success, fail, complete) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/queryDepositByUserId',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: function(res) {
      wx.hideLoading()
      if (res.data.resultCode != 200) {
        wx.showToast({
          title: res.data.resultMsg,
          icon: 'none'
        })
        return;
      }
      success && success(res);
    },
    fail: fail || function(err) {
      console.log("获取押金失败", err);
    },
    complete: complete || function(res) {
      console.log("获取押金完成", res);
    }
  })
}
//退定金
Api.backDeposit = (token, success, fail, complete) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/refundPayDeposit',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: function(res) {
      wx.hideLoading();
      if (res.data.resultCode != 200) {
        wx.showToast({
          title: res.data.resultMsg,
          icon: 'none'
        })
        return;
      }
      wx.showToast({
        title: "退款成功",
        icon: 'none'
      })
      success && success(res);
    },
    fail: function(err) {
      console.log('退款接口调用失败', err)
    },
    complete: (res) => {
      console.log('退款接口执行完成', res);
    }
  })
}
/**
 * 向后端同步蓝牙状态
 */
Api.listenBlue = (token, deviceNum, val, success) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/blueTooth/listenBlue',
    data: {
      deviceNum: deviceNum,
      blueMsg: val
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: success || function(res) {
      console.log("同步蓝牙状态成功", res);
    },
    fail(err) {
      
      wx.hideLoading();
        wx.showToast({
          title:'请求网络超时,请重试',
          icon:'none'
        })
      console.log('同步蓝牙状态失败', err)
    },
    complete: (res) => {
      console.log('同步蓝牙状态执行完成', res)
    }
  })
}
/**
 * 支付押金
 */
Api.payDeposit = (token, orderNo, success, fail, complete) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/wxPayDeposit',
    data: {
      orderNo: orderNo
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: success || function(res) {
      console.log("pay deposit is success");
    },
    fail: fail || function(err) {
      console.log("pay deposit is fail");
    },
    complete: complete || function(res) {
      console.log("pay deposit is complete");
    }
  })
}
/**
 * 开锁
 */
Api.openLock = (token, deviceNum, success, fail, complete) => {
  console.log("device---", deviceNum);
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/openLock',
    data: {
      deviceNum: deviceNum //设备号
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: success || function(res) {
      console.log("开锁后台Api成功");
    },
    fail: fail || function(err) {
      console.log('开锁后台api失败:', err)
    },
    complete: complete || function(res) {
      console.log('开锁后台api完成', res)
    }
  })
}
/**
 * 支付订单
 */
Api.payOrder = (token, orderNo) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/wxPayOrder',
    data: {
      orderNo: orderNo,
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: function(res) {
      console.log('支付成功', res)
      wx.hideLoading()
      if (res.data.resultCode == 200) {
        console.log("支付成功：code 200");
        wx.requestPayment({
          timeStamp: res.data.resultData.timeStamp.toString(),
          nonceStr: res.data.resultData.nonceStr,
          package: res.data.resultData.package,
          signType: 'MD5',
          paySign: res.data.resultData.sign,
          success(res) {
            wx.redirectTo({
              url: '/pages/index/index?orderIsId=Close'
            })
          },
          fail(err) {
            console.log("支付失败", err);
            wx.showToast({
              title: '支付取消',
              icon: 'none'
            })
          },
          complete: function(res) {
            console.log('支付完成执行', res);
          }
        })
      } else if (res.data.resultCode == 200013) {
        console.log("支付成功：code 200013");
        wx.showToast({
          title: '该订单为5分钟以内,不需要支付',
          icon: 'none',
          duration: 2500
        })

        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/index/index?orderIsId=Close'
          })
        }, 3000)

      } else {
        wx.showToast({
          title: res.data.resultMsg || "系统错误",
          icon: 'none'
        })
      }
    }
  })
}
/**
 * 结束订单
 */
Api.overOrder = (token, orderNo, checkOrder, closeBle, errPay) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/overOrder',
    data: {
      orderNo: orderNo,
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: function(res) {
      console.log("结束订单成功", res);
      wx.hideLoading()
      if (res.data.resultCode == 200) {
        console.log("结束订单成功 code : 200");
        checkOrder();
      } else if (res.data.resultCode == 200013) {
        console.log("结束订单成功 code : 200013");
        //五分钟之内，不需要支付的
        closeBle();
      } else {
        wx.showToast({
          title: res.data.resultMsg || "系统错误",
          icon: 'none'
        })
      }
    },
    fail: err => {
      console.log('支付回调处理' + err);
      errPay()
    }
  })
}
/**
 * 关锁后台操作
 */
Api.closeLock = (token, deviceNum, success) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/closeLock',
    data: {
      deviceNum: deviceNum,
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: success || function(res) {
      console.log('关锁成功', res);
    },
    fail: (err) => {
      console.log('关锁失败', err)
    },
    complete: function(res) {
      console.log('关锁执行完成', res)
    }

  })
}
/**
 * 发送短信验证
 */
Api.getSmsCodeForUser = (phone) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/login/getSmsCodeForUser',
    data: {
      phone: phone,
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function(res) {
      if (res.data.resultCode == 200) {
        wx.showToast({
          title: '获取成功',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: res.data.resultMsg,
          icon: 'none'
        })
      }
    },
    fail: function(err) {
      console.log('获取验证码失败:' + err)
      wx.showToast({
        title: '获取失败',
        icon: 'none'
      })
    },
    complete: function(res) {
      console.log('获取验证码执行', res)
    }
  })
}
/**
 * 提意见反馈
 */
Api.addFaultBack = (token, deviceNum, faultTypes, des, image, success, fail, complete) => {
  wx.showLoading({
    title: '提交中',
    mask: true
  })

  wx.request({
    method: 'POST',
    url: Api.host + '/handle/addFaultBack',
    data: {
      deviceNum: deviceNum,
      faultTypes: faultTypes,
      des: des,
      image: image,
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: success || function(res) {
      if (res.data.resultCode == 200) {
        wx.hideLoading()
        wx.showToast({
          title: '谢谢您的反馈',
          duration: 1500,
        })

        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        }, 1800)

      } else {
        wx.hideLoading()
        wx.showToast({
          title: res.data.resultMsg || '服务器错误',
          icon: 'none'
        })
      }
    },
    fail: fail || function(err) {
      wx.hideLoading()
      console.log('提交失败:' + err)
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      })
    },
    complete: complete || function(res) {
      console.log('提交失败执行完成', res)
    }
  })

}
/**
 * 绑定手机号
 */
Api.bindPhone = (phone, code, nickName, token) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/login/bindingPhone',
    data: {
      phone: phone,
      code: code,
      nickName: nickName
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: function(res) {
      if (res.data.resultCode == 200) {

        wx.hideLoading();
        wx.showToast({
          title: '绑定成功',
          icon: 'none',
          duration: 2800
        })

        wx.redirectTo({
          url: '/pages/index/index',
        })
      } else {
        wx.showToast({
          title: res.data.resultMsg || "系统错误",
          icon: 'none'
        })
      }
    },
    fail: function(err) {
      console.log('绑定执行失败:', err)
    },
    complete: function(res) {
      console.log('绑定执行成功', res)
    }
  })
}
/**
 * 解除绑定
 */
Api.unbind = (token, success) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/unBindingPhone',
    data: {},
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: success || function(res) {
      console.log("解除绑定成功", res);
    },
    fail(err) {
      console.log("解除绑定 失败", err);
    },
    complete(res) {
      console.log("解除绑定 完成", res);
    }
  })
}
/**
 * 分页查询订单
 */
Api.orderQueryPage = (page, token, success) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/queryOrdersByUserId',
    data: {
      page: page,
      size: 20
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: success || function(res) {
      console.log("分页获取订单成功", res);
    },
    fail(err) {
      console.log("分页获取订单 失败", err);
    },
    complete(res) {
      console.log("分页获取订单 完成", res);
      wx.hideLoading();
    }
  })
}
/**
 * 根据用户信息查Id
 */
Api.queryOrderByUserId = (page, token, success) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/queryOrdersByUserId',
    data: {
      page: self.data.page,
      size: 20
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': wx.getStorageSync('token')
    },
    success: success || function(res) {
      console.log("queryOrdersByUserId 成功", res);
    },
    fail(err) {
      console.log("queryOrdersByUserId 失败", err);
    },
    complete(res) {
      console.log("queryOrdersByUserId 完成", res);
    }
  })
}
/**
 * 根据用户查询押金
 */
Api.queryDepositByUserId = (token, success) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/queryDepositByUserId',
    data: {},
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: success || function(res) {
      console.log("queryDepositByUserId 成功", res);
    },
    fail(err) {
      console.log("queryDepositByUserId 失败", err);
    },
    complete(res) {
      console.log("queryDepositByUserId 完成", res);
    }
  })
}
/**
 * 退押金
 */
Api.backDeposit = (token, success) => {
  wx.request({
    method: 'POST',
    url: Api.host + '/handle/refundPayDeposit',
    data: {},
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Token': token
    },
    success: success || function(res) {
      console.log("refundPayDeposit 成功", res);
    },
    fail(err) {
      console.log("refundPayDeposit 失败", err);
    },
    complete(res) {
      console.log("refundPayDeposit 完成", res);
    }
  })
}

export default Api;