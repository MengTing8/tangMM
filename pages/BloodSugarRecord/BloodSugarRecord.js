const {
    request
} = require("../../utils/request")
const {
    getDates
} = require("../../utils/util")
const moment = require('../../utils/moment.min.js');
let date = getDates(1, new Date());
let newDate = moment(date[0].time).format('YYYY年MM月DD日')
moment.locale();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        BloodData: {},
        periodSubvalue: "",
        periodValue: '',
        periodIndex: 0,
        periodValues: [],
        categoryValues: [],
        otherInput: false,
        dateObj: {
            StartDt: newDate,
            EndDt: '2029年01月01',
            EXDATE: newDate,
            DateSelect: newDate,
            title: "记录时间"
        },
        dataTime: date[0].time,
    },
    getBloodGlucose() {
        let self = this
         let BloodData = self.data.BloodData
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getBloodGlucose",
                "data": [{
                    "date": self.data.dataTime,
                    "periodCode": BloodData.periodCode|| "",
                    "periodSubcode": BloodData.periodSubcode || "",
                    "categoryCode": BloodData.categoryCode || "1"
                }]
            }
        }).then(res => {
            console.log(res, "血糖");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                self.setData({
                     BloodData: ResData,
                    categoryValues: ResData.categoryValues,
                    periodValues: ResData.periodValues
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
    onSaveBtn(e) {
        console.log('onSaveBtn');
        let self = this
           let BloodData = self.data.BloodData
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "save",
                "data": [{
                    "entity": "bloodGlucose",
                    "patientId": wx.getStorageSync('patientId'),
                    "date": self.data.dataTime,
                    "id": BloodData.id,
                    "rowMd5": BloodData.rowMd5,
                    "periodCode": BloodData.periodCode,
                    "periodSubcode": BloodData.periodSubcode,
                    "periodExtraValue": BloodData.periodExtraValue,
                    "categoryCode": BloodData.categoryCode,
                    "value": BloodData.value,
                    "status": "1"
                }]
            }
        }).then(res => {
            console.log(res, "保存");
            if (res.data.code === '0') {
                  var ResData = res.data.data[0]
                  self.setData({
                      categoryValues: ResData.categoryValues,
                      periodValues: ResData.periodValues
                  })
                   wx.showToast({
                       title: res.data.message,
                       icon: 'none',
                       duration: 2000
                   })
                this.getBloodGlucose()
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    historyRecordBtn(e) {
          wx.navigateTo({
              url: '../historyBloodSugar/historyBloodSugar'
          })

    },
    bindValueInput(e) {
        let BloodData = this.data.BloodData
        BloodData.value = e.detail.value
        this.setData({
            BloodData
        })
    },
    bindExtraValueInput: function (e) {
        let BloodData = this.data.BloodData
        BloodData.periodExtraValue = e.detail.value
        this.setData({
            BloodData
        })
    },
    bindDateChange(e) {
        console.log(e);
        var NewData = this.data.dateObj;
        let val = e.detail.value
        let dateSelect = e.detail.date
        NewData.DateSelect = val;
        this.setData({
            dateObj: NewData,
            dataTime: dateSelect
        })
        this.getBloodGlucose()
    },
    bindPeriodChange(e) {
        let BloodData = this.data.BloodData
        let val = e.detail.value
        if (this.data.BloodData.periodSubvalue == "其它") {
            this.setData({
                otherInput: true,
            })
        } else {
            this.setData({
                otherInput: false,
            })
        }
        BloodData.periodValue = this.data.periodValues[val].value,
            BloodData.periodCode = this.data.periodValues[val].code
        this.setData({
            periodIndex: val,
            BloodData
        })
    },
    bindPerChildrenChange(e) {
        let BloodData = this.data.BloodData
        let val = e.detail.value
        if (this.data.periodValues[this.data.periodIndex].children[val].value == '其它') {
            this.setData({
                otherInput: true,
            })
        } else {
            this.setData({
                otherInput: false,
            })
        }
        BloodData.periodSubvalue = this.data.periodValues[this.data.periodIndex].children[val].value
        BloodData.periodSubcode = this.data.periodValues[this.data.periodIndex].children[val].code
        this.setData({
            BloodData
        })
    },
    bindCategoryChange(e) {
        let BloodData = this.data.BloodData
        let val = e.detail.value
        BloodData.categoryValue = this.data.categoryValues[val].value
        BloodData.categoryCode = this.data.categoryValues[val].code
        this.setData({
            BloodData
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getBloodGlucose()
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