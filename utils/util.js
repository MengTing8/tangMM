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
module.exports = {
    formatTime: formatTime,
    formatDate: formatDate,
    getDates: getDates,
    checkTime: checkTime,
    getDay: getDay,
}