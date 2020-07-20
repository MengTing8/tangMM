const {
    request
} = require("../../../utils/request")
const {
    getDates
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
let date = getDates(1, new Date());
let newDate = moment(date[0].time).format('YYYY年MM月DD日')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        periodCode: "1",
        wayCode: '1',
        note: "",
        levelList: [],
        wayList: [],
        periodList: [],
        SportsData: {},
        dateObj: {
            StartDt: newDate,
            EndDt: '2029年01月01',
            EXDATE: newDate,
            DateSelect: newDate,
            title: "记录时间"
        },
        dataTime: date[0].time,
        ShowInfo: false,
    },
    saveExercise() {
        let self = this
        let SportsData = self.data.SportsData
        if (SportsData.periodCode == '') {
            wx.showToast({
                title: '请选择时段',
                icon: 'none',
                duration: 2000
            })
            return
        }
        if (SportsData.wayValue == '') {
            wx.showToast({
                title: '请选择方式',
                icon: 'none',
                duration: 2000
            })
            return
        }
        if (SportsData.levelValue == '') {
            wx.showToast({
                title: '请选择强度',
                icon: 'none',
                duration: 2000
            })
            return
        }
        if (SportsData.duration == '') {
            wx.showToast({
                title: '请输入运动时长',
                icon: 'none',
                duration: 2000
            })
            return
        }

        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "save",
                "data": [{
                    "entity": "exercise",
                    "patientId": wx.getStorageSync('patientId'),
                    "date": self.data.dataTime,
                    "id": SportsData.id,
                    "rowMd5": SportsData.rowMd5,
                    "periodCode": SportsData.periodCode,
                    "wayCode": SportsData.wayCode,
                    "levelCode": SportsData.levelCode,
                    "duration": SportsData.duration,
                    "status": "1"
                }]
            }
        }).then(res => {
            console.log(res, "保存");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
                self.getExercise()

            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    getExercise() {
        let SportsData = this.data.SportsData
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getExercise",
                "data": [{
                    "date": self.data.dataTime,
                    "periodCode": SportsData.periodCode || '1',
                    "wayCode": SportsData.wayCode || '1'
                }]
            }
        }).then(res => {
            console.log(res, "获取运动记录");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                self.setData({
                    SportsData: ResData,
                    wayList: ResData.wayValues,
                    levelList: ResData.levelValues,
                    periodList: ResData.periodValues,
                    wayCode: ResData.wayCode,
                    periodCode: ResData.periodCode
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
    getFieldHelp() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getFieldHelp",
                "data": [{
                    "entity": "exercise",
                    "field": "levelCode"
                }]
            }
        }).then(res => {
            console.log(res);
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                self.setData({
                    note: ResData.note,
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
    bindDurationInput: function (e) {
        let SportsData = this.data.SportsData
        SportsData.duration = e.detail.value
        this.setData({
            SportsData
        })
    },
    bindLevelChange(e) {
        let SportsData = this.data.SportsData
        var val = e.detail.value
        SportsData.levelValue = this.data.levelList[val].value
        SportsData.levelCode = this.data.levelList[val].code
        this.setData({
            SportsData,
        });
    },
    bindWayChange(e) {
        let SportsData = this.data.SportsData
        var val = e.detail.value
        SportsData.wayValue = this.data.wayList[val].value
        SportsData.wayCode = this.data.wayList[val].code
        this.setData({
            SportsData,
        });
    },
    bindPeriodChange(e) {
        let SportsData = this.data.SportsData
        var val = e.detail.value
        SportsData.periodValue = this.data.periodList[val].value
        SportsData.periodCode = this.data.periodList[val].code
        this.setData({
            SportsData,
        });
    },
    bindDateChange(e) {
        var NewData = this.data.dateObj;
        let val = e.detail.value
        let dateSelect = e.detail.date
        NewData.DateSelect = val;
        this.setData({
            dateObj: NewData,
            dataTime: dateSelect
        })
        this.getExercise()
    },
    tapHistory() {
        wx.navigateTo({
            url: '../historySports/historySports'
        })
    },
    strengthInfo() {
        this.getFieldHelp()
        this.setData({
            ShowInfo: true,

        })
    },
    HiedeInfo() {
        this.setData({
            ShowInfo: false,

        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getExercise()

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