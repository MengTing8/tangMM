const {
    request
} = require("../../../utils/request")
const {
    formatDate,
    getDates
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
let date = getDates(1, new Date());
Page({

    /**
     * 页面的初始数据
     */
    data: {
        weight: '',
        dateRecord: date[0].time,
        WeightDate: moment(date[0].time).format('YYYY年MM月DD日'),
        rowMd5: "",
        id: "",
    },
    SaveWeight() {
        let self = this
        request({
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
        request({
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
        let valDate = e.detail.value
        this.setData({
            WeightDate: moment(valDate).format('YYYY年MM月DD日'),
            dateRecord: valDate
        })
        this.getWeight()
    },
    HistoryWeightMa() {
        wx.navigateTo({
            url: '../historyWeightMa/historyWeightMa'
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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