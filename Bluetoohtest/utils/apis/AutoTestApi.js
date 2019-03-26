//蓝牙锁相关API
import {
  json2Form
} from '../util.js';

const AutoTestApi = AutoTestApi || {};
//
// AutoTestApi.host = "https://192.168.99.74:8091/";
AutoTestApi.host = "https://pressuretest.leagoohealth.com/";
/**
 *配置当前蓝牙测试参数 data { openPwm, openTime, closeTime}包含参数
 *@param openPwm 开锁力度
 *@param openTime 开锁时间
 *@param closeTime 关锁时间
 */
AutoTestApi.btLock_config = (data, success, fail, complete) => {
  wx.request({
    method: 'POST',
    url: AutoTestApi.host + "api/btLock/config",
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: json2Form(data),
    success: function(res) {
      wx.setStorage({
        key: 'sessionId',
        data: res.data,
        success: function() {
          success && success(res);
          console.log("配置参数成功", res);
        }
      })
    },
    fail: fail || function(err) {
      console.log("配置参数失败", err);
    },
    complete: complete || function(res) {
      console.log("配置参数完成", res);
    }
  })
}
/**
 * 获取蓝牙列表
 */
AutoTestApi.btLock_queryList = (data, success, fail, complete) => {
  wx.request({
    method: 'POST',
    url: AutoTestApi.host + "api/btLock/queryList",
    data: JSON.stringify(data),
    header: {
      "content-type": 'application/json',
      'Cookie': "JSESSIONID=" + wx.getStorageSync("sessionId"),
    },
    success: function(res) {
      console.log("获取蓝牙列表 成功", res);
      wx.setStorageSync("sessionId", res.sessionId);
      success && success(res);
    },
    fail: function(err) {
      console.log("获取蓝牙列表 失败", err);
      fail && fail(err);
    },
    complete: function(res) {
      console.log("获取蓝牙列表 完成", res);
      complete && complete(res);
    }
  })
}

/**
 * 创建测试日志
 */
AutoTestApi.testLog_save = (testLog, success, fail, complete) => {
  wx.request({
    method: 'POST',
    url: AutoTestApi.host + "api/testLog/save",
    data: JSON.stringify(testLog),
    header: {
      "content-type": 'application/json',
      'Cookie': "JSESSIONID=" + wx.getStorageSync("sessionId"),
    },
    success: function(res) {
      console.log("创建测试日志 成功", res);
      wx.setStorageSync("sessionId", res.sessionId);
      success && success(res);
    },
    fail: function(err) {
      console.log("创建测试日志 失败", err);
      fail && fail(err);
    },
    complete: function(res) {
      console.log("创建测试日志 完成", res);
      complete && complete(res);
    }
  })
}

/**
 * 更新测试日志
 */
AutoTestApi.testLog_update = (testLog, success, fail, complete) => {
  wx.request({
    method: 'POST',
    url: AutoTestApi.host + "api/testLog/update",
    data: JSON.stringify(testLog),
    header: {
      "content-type": 'application/json',
      'Cookie': "JSESSIONID=" + wx.getStorageSync("sessionId"),
    },
    success: function(res) {
      console.log("更新测试日志 成功", res);
      wx.setStorageSync("sessionId", res.sessionId);
      success && success(res);
    },
    fail: function(err) {
      console.log("更新测试日志 失败", err);
      fail && fail(err);
    },
    complete: function(res) {
      console.log("更新测试日志 完成", res);
      complete && complete(res);
    }
  })
}


export default AutoTestApi;