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
    goRecordInfo(e) {
        let index = e.currentTarget.dataset.index
        let {
            avatarUrl,
            name,
            description,
            id,
            gestationalWeek
        } = this.data.MyRecordData
        let URL = ''
        if (index == 0) {
            // 胎动监测
            URL = `../fetalMovement/fetalMovement?avatarUrl=${avatarUrl}&name=${name}&description=${description}&patientId=${id}&gestationalWeek=${gestationalWeek}`
        } else if (index == 1) {
            // 基础数据
            URL = '../basicdata/basicdata'
        } else if (index == 2) {
            // 妈妈空腹体重
            // URL = '../weightMa/weightMa'
            URL = '../WeightContent/weightMa/weightMa?gestationalWeek=' + gestationalWeek
        } else if (index == 3) {
            // 胎儿体重
            URL = '../WeightContent/fetalWeightAdd/fetalWeightAdd'
        } else if (index == 4) {
            // 饮食记录
            URL = '../DietAndExercise/DietRecords/DietRecords'
        } else if (index == 5) {
            // 运动记录
            URL = '../DietAndExercise/sportsRecord/sportsRecord'
        } else if (index == 6) {
            // 血糖
            URL = '../BloodSugarRecord/BloodSugarRecord'
        } else if (index == 7) {
            // 胰岛素
            URL = '../InsulinRegister/InsulinRegister'
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
        let requestObj = {
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getMyRecord",
                "data": []
            }
        };
        promiseRequest(requestObj).then((res) => {
            if (res.data.code === '0') {
                let date = getDates(1, res.data.data[0].currentDate);
                let str = res.data.data[0].currentDate
                let newStr = str.split("-").reverse().join("/")
                let searchStr = newStr.substring(0, 2);
                let srtEndIndex = newStr.indexOf(searchStr) + searchStr.length;
                let newStrs = newStr.substring(srtEndIndex);
                wx.setStorageSync('patientId', res.data.data[0].id)
                self.setData({
                    MyRecordData: res.data.data[0],
                    CurrentWeek: date[0].week,
                    CurrentDate: newStrs,
                    CurrentDay: searchStr,
                    patientId: res.data.data[0].id
                })

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

        this.setData({
            userType: options.userType
        })
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
        this.getMyRecord()
        const token = wx.getStorageSync('token');
        const userType = wx.getStorageSync('userType')
        if (!token) {
            wx.redirectTo({
                url: '/pages/index/index',
            });
        }
        if (userType == -2) {
            // -2 ：未绑定手机用户
            wx.redirectTo({
                url: '/pages/tiedCard/tiedCard?tabsItem=' + 0
            })
        } else if (userType == -1) {
            // -1 = 未绑定诊疗卡用户
            wx.redirectTo({
                url: '/pages/tiedCard/tiedCard?tabsItem=' + 1
            })
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