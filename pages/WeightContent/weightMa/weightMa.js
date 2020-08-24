const {
    promiseRequest
} = require("../../../utils/Requests")
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
        weight: '',
        dateRecord: date[0].time,
        WeightDate: newDate,
        rowMd5: "",
        id: "",
        GA: '',
        dateObj: {
            StartDt: newDate,
            EndDt: date[0].time,
            DateSelect: newDate,
            title: "记录时间",
            value: date[0].time
        },
    },
    DeleteByDate(e) {
        let date = e.detail.date
             let that = this
             if (that.data.weight || that.data.id) {
                 wx.showModal({
                     title: '提示',
                     content: "确定删除当日数据？",
                     success(res) {
                         if (res.confirm) {
                             promiseRequest({
                                 method: "POST",
                                 url: '/wxrequest',
                                 data: {
                                     "token": wx.getStorageSync('token'),
                                     "function": "deleteByDate",
                                     "data": [{
                                         "entity": "weight",
                                         "date": date
                                     }]
                                 }
                             }).then((res) => {
                                 console.log(res, "删除");
                                 if (res.data.code === '0') {
                                     wx.showToast({
                                         title: res.data.message,
                                         icon: 'none',
                                         duration: 3000
                                     })
                                     that.getWeight()
                                 } else {
                                     wx.showToast({
                                         title: res.data.message,
                                         icon: 'none',
                                         duration: 3000
                                     })
                                 }
                             })
                         } else if (res.cancel) {}
                     }
                 })
             } else {
                 wx.showToast({
                     title: '无数据可删！',
                     icon: 'none',
                     duration: 2000
                 })
             }
    },
    SaveWeight() {
        let self = this
        if (!self.data.weight) {
            wx.showToast({
                title: '请输入体重',
                icon: 'none',
                duration: 3000
            })
            return false;
        } else {
            promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "save",
                    "data": [{
                        "entity": "weight",
                        "patientId": wx.getStorageSync('patientId'),
                        "date": self.data.dateRecord,
                        "id": self.data.id,
                        "rowMd5": self.data.rowMd5,
                        "weight": self.data.weight,
                        "status": 1
                    }]
                }
            }).then(res => {
                console.log(res, "保存");
                if (res.data.code === '0') {
                    var ResData = res.data.data[0]
                    self.setData({
                        rowMd5: ResData.rowMd5,
                        id: ResData.id,
                    })
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })

                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        }
    },
    bindWeightInput(e) {
        var data = e.detail.value;
        this.setData({
            weight: data
        })
    },
    //获取宝妈空腹体重
    getWeight() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getWeight",
                "data": [{
                    "date": self.data.dateRecord
                }]
            }
        }).then(res => {
            console.log(res, "获取宝妈空腹体重");
            if (res.data.code === '0') {
                // var ResData = res.data.data
                if (res.data.data.length > 0) {
                    var ResData = res.data.data[0]
                    self.setData({
                        rowMd5: ResData.rowMd5,
                        id: ResData.id,
                        weight: ResData.weight,
                        WeightDate: moment(ResData.date).format('YYYY年MM月DD日'),

                    })
                } else {
                    self.setData({
                        rowMd5: '',
                        id: '',
                        weight: '',
                        //   WeightDate: moment(ResData.date).format('YYYY年MM月DD日'),

                    })
                }


            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    //选择记录时间
    bindDateChange(e) {
        var NewData = this.data.dateObj;
        let valDate = e.detail.value
        let dateSelect = e.detail.date
        NewData.DateSelect = valDate;
        NewData.value = e.detail.date;
        this.setData({
            dateObj: NewData,
            dateRecord: dateSelect
        })
        this.getWeight()
    },
    HistoryWeightMa() {
        wx.navigateTo({
            url: '../historyWeightMa/historyWeightMa?GA=' + this.data.GA
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {
            gestationalWeek
        } = options
        this.setData({
            GA: gestationalWeek
        })
        this.getWeight()
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