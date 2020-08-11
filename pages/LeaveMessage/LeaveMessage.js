const {
    promiseRequest
} = require("../../utils/Requests")
let windowHeight = ''
wx.getSystemInfo({
    success: function (res) {
        windowHeight = res.windowHeight
    }
})
Page({

    /**
     * 页面的初始数据
     */
    data: {
        scrollHeight: ((windowHeight - 160) * 2) + 'rpx',
        userInputConten: '',
        MessageList: [],
        scrollToView: '',
        patientId: wx.getStorageSync('patientId')

    },
    getMessage() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getMessage",
                "data": [{
                    patientId: self.data.patientId
            }]}
        }).then(res => {
            if (res.data.code === '0') {
                let ResData = res.data.data[0]
                for (const key in ResData) {
                    if (ResData[key].createdDateTime) {
                    ResData[key].createdDateTime = ResData[key].createdDateTime.substring(0, 19)
                    }
                }
                self.setData({
                    MessageList: ResData,
                })
                if (self.data.MessageList.length > 0) {
                    self.setData({
                        scrollHeight: ((windowHeight - 160) * 2) + 'rpx',
                        scrollToView: "msg" + (self.data.MessageList.length - 1),

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
    //
    saveMessage() {
        let self = this
        if (!self.data.userInputConten) {
            wx.showToast({
                title: '请输入信息',
                icon: 'none',
                duration: 2000
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
                        "entity": "message",
                        "patientId": self.data.patientId,
                        "text": self.data.userInputConten,
                        "writtenBy": self.data.patientId,
                        "status": "1"
                    }]
                }
            }).then(res => {
                console.log(res);
                if (res.data.code === '0') {
                    
                    self.getMessage()
                    self.setData({
                        userInputConten: '',
                        scrollHeight: ((windowHeight - 186) * 2) + 'rpx',
                        // scrollToView: "msg" + (self.data.MessageList.length - 1)
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
    InputMessage(e) {
        let val = e.detail.value
        this.setData({
            userInputConten: val
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getMessage()
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