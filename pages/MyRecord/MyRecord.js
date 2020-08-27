const {
    promiseRequest
} = require("../../utils/Requests")
const {
    formatDate,
    getDates
} = require("../../utils/util")
let app = getApp()
Page({
    data: {
        userType: '',
        MyRecordData: {},
        CurrentWeek: '',
        CurrentDate: "",
        CurrentDay: "",
        patientId: '',
        gestationalWeek: ""
    },
    RecordInfo(e) {
        let code = e.detail.code
        let {
            avatarUrl,
            name,
            description,
            id,
            gestationalWeek
        } = this.data.MyRecordData
        let URL = ''
        if (code == '1') {
            // 胎动监测
            URL = `../fetalMovement/fetalMovement?avatarUrl=${avatarUrl}&name=${name}&description=${description}&patientId=${id}&gestationalWeek=${gestationalWeek}`
        } else if (code == '2') {
            // 基础数据
            URL = '../basicdata/basicdata'
        } else if (code == '3') {
            // 妈妈空腹体重
            // URL = '../weightMa/weightMa'
            URL = '../WeightContent/weightMa/weightMa?gestationalWeek=' + gestationalWeek
        } else if (code == '4') {
            // 胎儿体重
            URL = '../WeightContent/fetalWeightAdd/fetalWeightAdd'
        } else if (code == '5') {
            // 饮食记录
            URL = '../DietAndExercise/DietRecords/DietRecords'
        } else if (code == '6') {
            // 运动记录
            URL = '../DietAndExercise/sportsRecord/sportsRecord'
        } else if (code == '7') {
            // 血糖
            URL = '../BloodSugarRecord/BloodSugarRecord'
        } else if (code == '8') {
            // 胰岛素
            URL = '../InsulinRegister/InsulinRegister?gestationalWeek=' + gestationalWeek
        }
        wx.navigateTo({
            url: URL
        })
    },
    modifiedInfo() {
        wx.navigateTo({
            url: '../myinfo/myinfo'
        })
    },
    getMessage() {
        wx.navigateTo({
            url: '../LeaveMessage/LeaveMessage'
        })
    },
    //获取我的记录
    getMyRecord() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getMyRecord",
                "data": []
            }
        }).then((res) => {
            console.log(res);
            if (res.data.code === '0') {
                if (res.data.data.length > 0) {
                    let date = getDates(1, res.data.data[0].currentDate);
                    let str = res.data.data[0].currentDate
                    let newStr = str.split("-").reverse().join("/")
                    let newStrs
                    let searchStr
                    let srtEndIndex
                    if (newStr) {
                        searchStr = newStr.substring(0, 2);
                        srtEndIndex = newStr.indexOf(searchStr) + searchStr.length;
                        newStrs = newStr.substring(srtEndIndex);
                    }
                    wx.setStorageSync('patientId', res.data.data[0].id)
                    app.globalData.patientId = res.data.data[0].id
                    self.setData({
                        MyRecordData: res.data.data[0],
                        CurrentWeek: date[0].week,
                        CurrentDate: newStrs,
                        CurrentDay: searchStr,
                        patientId: res.data.data[0].id
                    })
                }
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        }).catch((errMsg) => {
            console.log(errMsg); //错误提示信息
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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
        console.log('onShow--孕端');
        this.getMyRecord()
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton()
        }
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