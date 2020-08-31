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
        fetusWeightList:[],
        numberOfFetus:"1",//胎数
        fetus: '1', // '0'单胎，'1'双胎
        rowMd5: "",
        id: "",
        BPD: '',
        HC: '',
        AC: '',
        FL: '',
        dateObj: {
            StartDt: newDate,
            EndDt: date[0].time,
            DateSelect: newDate,
            title: "选择时间",
            value: date[0].time
        },
        dataTime: date[0].time
    },
    radioChange: function (e) {
        let fetus = e.detail.value || this.data.fetus
        this.setData({
            fetus: fetus
        })
        this.getFetusWeight()
    },
    DeleteByDate(e) {
        let date = e.detail.date
        let that = this
        if (that.data.rowMd5 || that.data.BPD) {
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
                                    "entity": "fetusWeight",
                                    "date": date
                                }]
                            }
                        }).then((res) => {
                            if (res.data.code === '0') {
                                wx.showToast({
                                    title: res.data.message,
                                    icon: 'none',
                                    duration: 3000
                                })
                                that.getFetusWeight()
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
    saveFetusWeight() {
        let self = this
        if (isNaN(parseFloat(self.data.BPD)) || self.data.BPD > 110 || self.data.BPD < 0) {
            wx.showToast({
                title: '双顶径(BPD):请输入0-110的值',
                icon: 'none',
                duration: 2000
            })
            return
        }
        if (isNaN(parseFloat(self.data.HC)) || self.data.HC > 400 || self.data.HC < 0) {
            wx.showToast({
                title: '头围(HC):请输入0-400的值',
                icon: 'none',
                duration: 2000
            })
            return
        }
        if (isNaN(parseFloat(self.data.AC)) || self.data.AC > 450 || self.data.AC < 0 || self.data.AC === '') {
            wx.showToast({
                title: '腹围(AC):请输入0-450的值',
                icon: 'none',
                duration: 2000
            })
            return
        }
        if (isNaN(parseFloat(self.data.FL)) || self.data.FL > 90 || self.data.FL < 0 || self.data.FL === '') {
            wx.showToast({
                title: '股骨长(FL):请输入0-90的值',
                icon: 'none',
                duration: 2000
            })
            return
        }

        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "save",
                "data": [{
                    "entity": "fetusWeight",
                    "patientId": wx.getStorageSync('patientId'),
                    "date": self.data.dataTime,
                    "gestationalWeek": '53',
                    "fetus": self.data.fetus,
                    "id": self.data.id,
                    "rowMd5": self.data.rowMd5,
                    "biparietalDiameter": self.data.BPD,
                    "headCircumference": self.data.HC,
                    "abdorminalCircumference": self.data.AC,
                    "femurLength": self.data.FL,
                    "status": "1"
                }]
            }
        }).then(res => {
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
                self.getFetusWeight()

            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    getFetusWeight() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getFetusWeight",
                "data": [{
                    "date": self.data.dataTime,
                    "fetus": self.data.fetus
                }]
            }
        }).then(res => {
            console.log(res, "获取胎儿体重");
            if (res.data.code === '0') {
                if (res.data.data.length > 0) {
                    var ResData = res.data.data[0]
                    let newObj = self.data.dateObj
                    newObj.DateSelect = moment(ResData.date).format('YYYY年MM月DD日')
                    self.setData({
                        dateObj: newObj,
                        rowMd5: ResData.rowMd5,
                        id: ResData.id,
                        BPD: ResData.biparietalDiametger,
                        HC: ResData.headCircumference,
                        AC: ResData.abdorminalCircumference,
                        FL: ResData.femurLength,
                    })
                } else {
                    self.setData({
                        // dateObj: newObj,
                        rowMd5: '',
                        id: '',
                        BPD: '',
                        HC: '',
                        AC: '',
                        FL: '',
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
    bindDateChange(e) {
        var NewData = this.data.dateObj;
        let val = e.detail.value
        let dateSelect = e.detail.date
        NewData.value = e.detail.date;
        NewData.DateSelect = val;
        this.setData({
            dateObj: NewData,
            dataTime: dateSelect
        })
        this.getFetusWeight()
    },
    bindBPDInput(e) {
        var data = e.detail.value;
        this.setData({
            BPD: data
        })
    },
    bindHCInput(e) {
        var data = e.detail.value;
        this.setData({
            HC: data
        })
    },
    bindACInput(e) {
        var data = e.detail.value;
        this.setData({
            AC: data
        })
    },
    bindFLInput(e) {
        var data = e.detail.value;
        this.setData({
            FL: data
        })
    },
    historyRecord() {
        wx.navigateTo({
            url: '../fetalWeight/fetalWeight?numberOfFetus=' + this.data.numberOfFetus
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            numberOfFetus: options.numberOfFetus
        })
        this.getFetusWeight()
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