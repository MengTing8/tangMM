const {
    request
} = require("../../../utils/request")
const {
    getDates,
    checkTime
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
let date = getDates(1, new Date());
let newDate = moment(date[0].time).format('YYYY年MM月DD日')
var StarDATE = "2020年06日01日"
var EndDATE = newDate
Page({
    /**
     * 页面的初始数据
     */
    data: {
        ExerciseList: [],
        dateStart: "2020-06-01",
        dateEnd: date[0].time,
        TimeObj: {
            StartDt: newDate,
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
        },
    },
    getExerciseList() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getExerciseList",
                "data": [{
                    "dateStart": self.data.dateStart,
                    "dateEnd": self.data.dateEnd
                }]
            }
        }).then(res => {
            console.log(res);
            if (res.data.code === '0') {
                var ResData = res.data.data
                // for (let key in ResData.items) {
                //     ResData.items[key].date = moment(ResData.items[key].date).format('YYYY年MM月DD日')

                // }
                self.setData({
                    ExerciseList: ResData
                })


            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    bindStartTimeChange(e) {
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let dateStart = e.detail.date
        NewData.StarDATE = val;
         let timeCheck = checkTime(dateStart, this.data.dateEnd)
         if (timeCheck) {
              this.setData({
                  dateStart,
                  TimeObj: NewData
              })
             this.getExerciseList()
         }
    },
    bindEndTimeChange(e) {
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let dateEnd = e.detail.date
        NewData.EndDATE = val;
         let timeCheck = checkTime(this.data.dateStart,dateEnd)
         if (timeCheck) {
             this.setData({
                 dateEnd,
                 TimeObj: NewData
             })
             this.getExerciseList()
         }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getExerciseList()

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