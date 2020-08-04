const {
    promiseRequest
} = require("../../../utils/Requests")
const {
    checkTime,
    getDay
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
let newDate = moment(getDay(0)).format('YYYY年MM月DD日')
var StarDATE = moment(getDay(-7)).format('YYYY年MM月DD日');
var EndDATE = newDate
Page({
    /**
     * 页面的初始数据
     */
    data: {
        ExerciseList: [],

        TimeObj: {
            StartDt: newDate,
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
            dateStart: getDay(-7),
            dateEnd: getDay(0),
        },
    },
    getExerciseList() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getExerciseList",
                "data": [{
                    "dateStart": self.data.TimeObj.dateStart,
                    "dateEnd": self.data.TimeObj.dateEnd
                }]
            }
        }).then(res => {
            if (res.data.code === '0') {
                var ResData = res.data.data
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
        let date = e.detail.date
        if (checkTime(date, NewData.dateEnd)) {
             NewData.StarDATE = val;
             NewData.dateStart = date;
            this.setData({
                TimeObj: NewData
            })
            this.getExerciseList()
        }
    },
    bindEndTimeChange(e) {
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let dateEnd = e.detail.date
        if (checkTime(NewData.dateStart, dateEnd)) {
             NewData.EndDATE = val;
             NewData.dateEnd = dateEnd;
            this.setData({
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