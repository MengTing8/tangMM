const {
    request
} = require("../../utils/request")
const app = getApp()

Page({
    data: {
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        isEdit: true,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    unhide() {
         wx.showToast({
             title:"请先授权!",
             icon: 'none',
             duration: 2000
         })
        // this.setData({
        //     // isEdit: false,
        // })
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function () {
          this.setData({
              isEdit: true,
          })
        console.log("index")
        const userType = wx.getStorageSync('userType');
        if (userType == 2) {
            wx.navigateTo({
                url: '../MyRecord/MyRecord?userType=' + userType
            })
        }
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        }
    },
    getUserInfo: function (e) {
        console.log('getUserInfo', e)
        app.globalData.iv = e.detail.iv
        app.globalData.rawData = e.detail.rawData
        app.globalData.encryptedData = e.detail.encryptedData;
        app.globalData.signature = e.detail.signature
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            iv: e.detail.iv,
            rawData: e.detail.rawData,
            signature: e.detail.signature,
            hasUserInfo: true
        })
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                'function': 'mpLogin',
                'data': [{
                    'code': app.globalData.code,
                    'iv': app.globalData.iv,
                    'rawData': app.globalData.rawData,
                    'encryptedData': app.globalData.encryptedData,
                    'signature': app.globalData.signature,
                }]
            },
        }).then(res => {
            console.log(res);
            if (res.data.code === '0') {
                console.log('data.data=', res.data.data);
                let userType = res.data.data[0].userType
                let DataArr = res.data.data[0]
                wx.setStorageSync('token', DataArr.token)
                wx.setStorageSync('userType', userType)
                app.globalData.userType = userType
                console.log(app.globalData.userType, userType);

                // -2 = 未绑定手机用户
                // -1 = 未绑定诊疗卡用户
                // 1 = 医务人员
                // 2 = 孕产妇
                if (userType == -2) {
                    console.log("：未绑定手机用户");
                    
                    // -2 ：未绑定手机用户
                    wx.redirectTo ({

                        url: '../tiedCard/tiedCard?tabsItem=' + 0
                    })
                } else if (userType == -1) {
                    console.log("未绑定诊疗卡用户");

                    // -1 = 未绑定诊疗卡用户
                    wx.redirectTo ({
                        url: '../tiedCard/tiedCard?tabsItem=' + 1
                    })
                } else if (userType == 2) {
                    wx.redirectTo ({
                        url: '../MyRecord/MyRecord'
                    })
                } else if (userType == 1) {
                    wx.redirectTo ({
                        // url: '../MyRecord/MyRecord'
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
        // wx.request({

        //     url: 'http://219.137.170.140:19080/wxrequest',
        //     method: 'post',
        //     data: {
        //         'function': 'mpLogin',
        //         'data': [{
        //             'code': app.globalData.code,
        //             'iv': app.globalData.iv,
        //             'rawData': app.globalData.rawData,
        //             'encryptedData': app.globalData.encryptedData,
        //             'signature': app.globalData.signature,
        //         }]
        //     },
        //     header: {
        //         'content-type': 'application/json' // 默认值
        //     },
        //     success: (res) => {
        //         console.log('wx.res', res);
        //         if (res.statusCode === 200) {

        //             if (res.data.code === '0') {
        //                 console.log('data.data=', res.data.data);
        //                 let userType = res.data.data[0][0].userType
        //                 let DataArr = res.data.data[0][0]
        //                 wx.setStorageSync('token', DataArr.token)
        //                 app.globalData.userType = userType
        //                 // -2 = 未绑定手机用户
        //                 // -1 = 未绑定诊疗卡用户
        //                 // 1 = 医务人员
        //                 // 2 = 孕产妇
        //                 if (userType == -2) {
        //                     // -2 ：未绑定手机用户
        //                     wx.navigateTo({
        //                         url: '../tiedCard/tiedCard'
        //                     })
        //                 }
        //             } else {
        //                 console.log('data.message=', res.data.message);
        //             }
        //         } else {
        //             console.log('statusCode=', res.statusCode, 'errMsg=', res.errMsg);
        //         }
        //     },
        //     fail: (res) => {
        //         wx.hideLoading();
        //         wx.showModal({
        //             title: '提示',
        //             content: '请求后台时，发生错误！',
        //         })
        //     }
        // })

    }
})