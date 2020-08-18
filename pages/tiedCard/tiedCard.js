const {
    promiseRequest, login
} = require("../../utils/Requests")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentTabsIndex: 0,
        mobile: '',
        sms: '',
        patientName: '',
        cardNumber: '',
        buttonText: '获取验证码',
        sendSmsDisable: false,
        second: 60,
    },
    // 发送验证码
    sendSms() {
        if (this.data.sendSmsDisable) return false;
        var _that = this
        let phone = _that.data.mobile
        let phoneRes = /^1(3|4|5|6|7|8|9)\d{9}$/
        if (phone == '' || phone == undefined) {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none',
                duration: 2000
            })
            return
        } else if (!phoneRes.test(phone)) {
            wx.showToast({
                title: '手机号码格式不正确',
                icon: 'none',
                duration: 2000
            })
            return
            // } else if (this.data.sms == '' || this.data.sms == undefined) {
            //     Toast.fail('请输入验证码');
        } else {
            promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "sendSms",
                    "data": [{
                        "mobile": _that.data.mobile
                    }]
                }
            }).then(res => {
                if (res.data.code === '0') {
                    // 发送成功
                    _that.countDown(_that, _that.data.second);
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
    countDown(that, count) {
        var that = this
        if (count == 0) {
            that.setData({
                buttonText: '获取验证码',
                sendSmsDisable: false,
                second: 60
            })
            return;
        }

        that.setData({
            sendSmsDisable: true,
            buttonText: count + '秒后重新获取',
            second: count
        })
        setTimeout(function () {
            count--;
            that.countDown(that, count);
        }, 1000);
    },
    bindMobileInput(e) {
        this.setData({
            mobile: e.detail.value
        })
    },
    bindSmsInput(e) {
        this.setData({
            sms: e.detail.value
        })
    },
    bindNameInput(e) {
        this.setData({
            patientName: e.detail.value
        })
    },
    bindNumberInput(e) {
        this.setData({
            cardNumber: e.detail.value
        })
    },
    // 绑定手机号
    bindMobile() {
        var _that = this
        if (_that.data.sms == '' || _that.data.sms == undefined) {
            wx.showToast({
                title: '请输入验证码',
                icon: 'none',
                duration: 2000
            })
            return
        } else {
            promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "bindMobile",
                    "data": [{
                        "mobile": _that.data.mobile,
                        "sms": _that.data.sms
                    }]
                }
            }).then(res => {
                console.log(res);
                if (res.data.code === '0') {
                     let userType = res.data.data[0].userType
                     wx.setStorageSync('userType', userType)
                     if (userType == '-2') {
                         // -2 ：未绑定手机用户
                          setTimeout(() => {
                              _that.setData({
                                  currentTabsIndex: 0
                              })
                          }, 3000);
                     } else if (userType == '-1') {
                         // -1 = 未绑定诊疗卡用户
                         setTimeout(() => {
                             _that.setData({
                                 currentTabsIndex: 1
                             })
                         }, 3000);
                     } else if (userType == '2') {
                         wx.reLaunch({
                             url: '../MyRecord/MyRecord'
                         })
                     } else if (userType == '1') {
                         wx.reLaunch({
                             url: '../MedicalCare/index/index'
                         })
                     }
                    // 发送成功ses
                    wx.showToast({
                        title: '绑定成功',
                        icon: 'success',
                        duration: 3000
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
    //绑定就诊卡
    bindPatient() {
        var _that = this
        if (_that.data.patientName == '' || _that.data.patientName == undefined) {
            wx.showToast({
                title: '请输入就诊人姓名',
                icon: 'none',
                duration: 2000
            })
            return
        } else if (_that.data.cardNumber == '' || _that.data.cardNumber == undefined) {
            wx.showToast({
                title: '请输入就诊人卡号',
                icon: 'none',
                duration: 2000
            })
            return
        } else {
            promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "bindPatient",
                    "data": [{
                        "name": _that.data.patientName,
                        "cardNumber": _that.data.cardNumber
                    }]
                }
            }).then(res => {
                if (res.data.code === '0') {
                    // 发送成功ses
                    wx.showToast({
                        title: '绑定成功',
                        icon: 'success',
                        duration: 3000
                    })
                    setTimeout(() => {
                        wx.reLaunch({
                            url: '../MyRecord/MyRecord'
                        })
                    }, 3000);

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
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _that = this
        if (options.tabsItem == '0') {
            _that.setData({
                currentTabsIndex: 0
            })
        } else if (options.tabsItem == '1') {
            _that.setData({
                currentTabsIndex: 1
            })
        }
        login()
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
       wx.hideHomeButton()
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