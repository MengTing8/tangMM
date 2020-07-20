const {
    request
} = require("../../utils/request")
let windowHeight = ''
wx.getSystemInfo({
    success: function (res) {
        console.log(res.windowHeight);
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
        talkContent: [{
            text: '护长，请问资料这样录入有问题吗？',
            isMine: true,
            satrtTime: '2020-02-10  20:20:51',
            headImg: '../../img/user.png'
        }, {
            text: '可以的',
            isMine: false,
            satrtTime: '2020-02-10  20:20:51',
            headImg: '../../img/user.png'

        }, {
            text: '好的',
            isMine: true,
            satrtTime: '2020-02-10  20:20:51',
            headImg: '../../img/user.png'

        }],
        MessageList: [],
        scrollToView: '',

    },
    getMessage() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getMessage",
                "data": [{
                    patientId: wx.getStorageSync('patientId')
                }]
            }
        }).then(res => {
            console.log(res);
            if (res.data.code === '0') {
                let ResData = res.data.data[0]
                for (const key in ResData) {
                    ResData[key].createdDateTime = ResData[key].createdDateTime.substring(0, 19)
                }
                self.setData({
                    MessageList: ResData,
                    // scrollHeight: ((windowHeight - 175) * 2) + 'rpx',
                    // scrollToView: "msg" + (self.data.MessageList.length - 1),

                })
                if (self.data.MessageList.length > 0) {
                    self.setData({
                        // MessageList: ResData[0],
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
        if (self.data.userInputConten == '') {
            wx.showToast({
                title: '请输入信息',
                icon: 'none',
                duration: 2000
            })
            return false;

        } else {
            request({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "save",
                    "data": [{
                        "entity": "message",
                        "patientId": wx.getStorageSync('patientId'),
                        "text": self.data.userInputConten,
                        "writtenBy": wx.getStorageSync('patientId'),
                        "status": "1"
                    }]
                }
            }).then(res => {
                console.log(res);
                if (res.data.code === '0') {
                    // wx.showToast({
                    //     title: res.data.message,
                    //     duration: 2000
                    // })
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
        console.log(e);
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