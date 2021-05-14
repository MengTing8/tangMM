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
        gestationalWeek: "",
        isNone: false
    },
    analysisReport(){
      wx.navigateTo({
          url: '../analysisReport/analysisReport'
      })
    },
    RecordInfo(e) {
        let {
            avatarUrl,
            name,
            description,
            id,
            gestationalWeek,
            numberOfFetus
        } = this.data.MyRecordData
        let URL = ''
        switch (e.detail.code) {
            case '1':
                URL = `../fetalMovement/fetalMovement?avatarUrl=${avatarUrl}&name=${name}&description=${description}&patientId=${id}&gestationalWeek=${gestationalWeek}`
                break
            case '2':
                URL = '../recordcenter/basicdata/basicdata'
                break
            case '3':
                URL = '../weightcenter/weightMa/weightMa?gestationalWeek=' + gestationalWeek
                break
            case '4':
                URL = `../weightcenter/fetalWeightAdd/fetalWeightAdd?numberOfFetus=${numberOfFetus}&gestationalWeek=${gestationalWeek}`
                break
            case '5':
                URL = '../dietcenter/DietRecords/DietRecords'
                break
            case '6':
                URL = '../dietcenter/sportsRecord/sportsRecord'
                break
            case '7':
                URL = '../recordcenter/BloodSugarRecord/BloodSugarRecord'
                break
            case '8':
                URL = '../recordcenter/InsulinRegister/InsulinRegister?gestationalWeek=' + gestationalWeek
                break
        }
        if (URL) {
            wx.navigateTo({
                url: URL
            })
        }


    },
    modifiedInfo() {
        wx.navigateTo({
            url: '../messagecenter/myinfo/myinfo'
        })
    },
    getMessage() {
        var that = this
        wx.navigateTo({
            url: '../messagecenter/LeaveMessage/LeaveMessage?patientId=' + that.data.patientId
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
                    let isNone = false;
                    if (res.data.data[0].items.length === 0) {
                        isNone = true;
                    }
                    self.setData({
                        MyRecordData: res.data.data[0],
                        CurrentWeek: date[0].week,
                        CurrentDate: newStrs,
                        CurrentDay: searchStr,
                        patientId: res.data.data[0].id,
                        isNone
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
        this.getMyRecord();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        // this.getMyRecord();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})