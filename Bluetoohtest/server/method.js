/*
  方法的封装
*/

module.exports = class method{

/**
 * 日期格式化
 * @param {String} date 日期
 */
  formatTime(date){   
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }

/**
 * 验证手机号码
 * @param {number} num 手机号码
 */
  isPoneAvailable(num){ 
    const reg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (!reg.test(num)) {
      return false;
    } else {
      return true;
    }
  }



/**
 * 切除 emoji表情
 * @param {String} str 
 */
  filterEmoji(str){ 
    return str.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
  }


/**
 * 对像数组去重
 * @param {Array} arr HTML
 */
  unique(arr, key){ 
    var res = [];
    var json = {};
    for (var i = 0; i < arr.length; i++) {
      if (!json[arr[i][key]]) {
        res.push(arr[i]);
        json[arr[i][key]] = 1;
      }
    }
    return res;
  }



}