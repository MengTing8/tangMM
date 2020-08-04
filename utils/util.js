const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [hour, minute, second].map(formatNumber).join(':')
}

// const formatTime = date => {
//     const year = date.getFullYear()
//     const month = date.getMonth() + 1
//     const day = date.getDate()
//     const hour = date.getHours()
//     const minute = date.getMinutes()
//     const second = date.getSeconds()

//     return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
// }
const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

//得到时间格式2018-10-02
const formatDate = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return [year, month, day].map(formatNumber).join('-')

}
//todate默认参数是当前日期，可以传入对应时间 todate格式为2018-10-05
function getDates(days, todate) {
    var dateArry = [];
    for (var i = 0; i < days; i++) {
        var dateObj = dateLater(todate, i);
        dateArry.push(dateObj)
    }
    return dateArry;
    //返回日期和星期
}

function checkTime(startTime, endTime) {

    if (startTime.length > 0 && endTime.length > 0) {

        var startTmp = startTime.split("-");

        var endTmp = endTime.split("-");

        var sd = new Date(startTmp[0], startTmp[1], startTmp[2]);

        var ed = new Date(endTmp[0], endTmp[1], endTmp[2]);

        if (sd.getTime() > ed.getTime()) {
            wx.showToast({
                title: "开始日期不能大于结束日期",
                icon: 'none',
                duration: 2000
            })
            return false;
        }
    }
    return true;
}

function dateLater(dates, later) {
    let dateObj = {};
    let show_day = new Array('星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六');
    let date = new Date(dates);
    date.setDate(date.getDate() + later);
    let day = date.getDay();
    let yearDate = date.getFullYear();
    let month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : date.getMonth() + 1);
    let dayFormate = (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate());
    dateObj.time = yearDate + '-' + month + '-' + dayFormate;
    dateObj.week = show_day[day];
    return dateObj;
}

//获取最近7天日期
getDay(0); //当天日期
getDay(-7); //7天前日期
getDay(0); //当天日期
getDay(-3); //3天前日期

//获取最近7天日期
function getDay(day) {
    var today = new Date();

    var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
    today.setTime(targetday_milliseconds); //注意，这行是关键代码

    var tYear = today.getFullYear();
    var tMonth = today.getMonth();
    var tDate = today.getDate();
    tMonth = doHandleMonth(tMonth + 1);
    tDate = doHandleMonth(tDate);
    return tYear + "-" + tMonth + "-" + tDate;
}

function doHandleMonth(month) {
    var m = month;
    if (month.toString().length == 1) {
        m = "0" + month;

    }
    return m;
}
function sortFun(attr, rev) {
    if (rev == undefined) {
        rev = 1;
    } else {
        rev = (rev) ? 1 : -1;
    }

    return function (a, b) {
        a = a[attr];
        b = b[attr];
        if (a < b) {
            return rev * -1;
        }
        if (a > b) {
            return rev * 1;
        }
        return 0;
    }
}
function getPickerValue(arr,val) {
 return arr.findIndex(function (x, i) {
        if (x == Number(val)) {
            return i
        }
    })
}
  // 根据出生日期计算年龄周岁
function getAge(strBirthday) {
      var returnAge = '';
      var mouthAge = '';
      var strBirthdayArr = strBirthday.split("-");
      var birthYear = strBirthdayArr[0];
      var birthMonth = strBirthdayArr[1];
      var birthDay = strBirthdayArr[2];
      var d = new Date();
      var nowYear = d.getFullYear();
      var nowMonth = d.getMonth() + 1;
      var nowDay = d.getDate();
      if (nowYear == birthYear) {
          // returnAge = 0; //同年 则为0岁
          var monthDiff = nowMonth - birthMonth; //月之差 
          if (monthDiff < 0) {} else {
              mouthAge = monthDiff + '个月';
          }
      } else {
          var ageDiff = nowYear - birthYear; //年之差
          if (ageDiff > 0) {
              if (nowMonth == birthMonth) {
                  var dayDiff = nowDay - birthDay; //日之差 
                  if (dayDiff < 0) {
                      returnAge = ageDiff - 1;
                  } else {
                      returnAge = ageDiff;
                  }
              } else {
                  var monthDiff = nowMonth - birthMonth; //月之差 
                  if (monthDiff < 0) {
                      returnAge = ageDiff - 1;
                  } else {
                      mouthAge = monthDiff + '个月';
                      returnAge = ageDiff;
                  }
              }
          } else {
              returnAge = -1; //返回-1 表示出生日期输入错误 晚于今天
          }
      }
      return returnAge; //返回周岁年龄+月份
  }
module.exports = {
    formatTime: formatTime,
    formatDate: formatDate,
    getDates: getDates,
    checkTime: checkTime,
    getDay: getDay,
    sortFun:sortFun,
    getPickerValue: getPickerValue,
    getAge: getAge
}