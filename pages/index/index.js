const {
    promiseRequest
} = require("../../utils/Requests")
const app = getApp()
Page({
    data: {
        isEdit: true,
    },
    unhide() {
         wx.showToast({
             title:"请先授权!",
             icon: 'none',
             duration: 2000
         })
    },
    onLoad: function () {
          this.setData({
              isEdit: true,
          })
        const userType = wx.getStorageSync('userType');
        if (wx.getStorageSync('token') && userType) {
            setTimeout(() => {
                if (userType == '2') {
                    wx.reLaunch({
                        url: '../MyRecord/MyRecord'
                    })
                } else if (userType == '1') {
                    wx.reLaunch({
                        url: '../MedicalCare/index/index'
                    })
                } else if (userType == '-2') {
                    // -2 ：未绑定手机用户
                    wx.reLaunch({
                        url: '../tiedCard/tiedCard?tabsItem=' + 0
                    })
                } else if (userType == '-1') {
                    // -1 = 未绑定诊疗卡用户
                    wx.reLaunch({
                        url: '../tiedCard/tiedCard?tabsItem=' + 1
                    })
                }
            }, 0);
        }
    },
    preventTouchMove(e){
        console.log("preventTouchMove");
    },
    getUserInfo: function (e) {
         wx.clearStorageSync()
        let code=''
        app.globalData.userInfo = e.detail.userInfo
         wx.login({
             success: res => {
                code = res.code;
                   promiseRequest({
                       method: "POST",
                       url: '/wxrequest',
                       data: {
                           'function': 'mpLogin',
                           'data': [{
                               'code': code,
                               'iv':e.detail.iv,
                               'rawData':e.detail.rawData,
                               'encryptedData':e.detail.encryptedData,
                               'signature':e.detail.signature,
                           }]
                       },
                   }).then(res => {
                       if (res.data.code === '0') {
                           let userType = res.data.data[0].userType
                           let DataArr = res.data.data[0]
                           wx.setStorageSync('token', DataArr.token)
                           wx.setStorageSync('userType', userType)
                           if (userType == '-2') {
                               // -2 ：未绑定手机用户
                               wx.reLaunch({
                                   url: '../tiedCard/tiedCard?tabsItem=' + 0
                               })
                           } else if (userType == '-1') {
                               // -1 = 未绑定诊疗卡用户
                               wx.reLaunch({
                                   url: '../tiedCard/tiedCard?tabsItem=' + 1
                               })
                           } else if (userType =='2') {
                               wx.reLaunch({
                                   url: '../MyRecord/MyRecord'
                               })
                           } else if (userType == '1') {
                               wx.reLaunch({
                                   url: '../MedicalCare/index/index'
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
             }
         })
    }
})