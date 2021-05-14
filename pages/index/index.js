let {
    promiseRequest
} = require("../../utils/Requests")
const {
    wxlogin,
} = require("../../utils/util")
import regeneratorRuntime from '../../lib/runtime/runtime';
const app = getApp()
Page({
    data: {
        isEdit: true,
        apiClicked: false,
    },
    unhide() {
        wx.showToast({
            title: "请先授权!",
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
                        url: '../medicalcare/index/index'
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
    async getUserInfo(e) {
            wx.clearStorageSync()
            let _this = this
            app.globalData.userInfo = e.detail.userInfo
            let code = await wxlogin()
             _this.setData({
                 apiClicked: true
             })
          let param = {
                     code: code,
                     iv: e.detail.iv,
                     rawData: e.detail.rawData,
                     encryptedData: e.detail.encryptedData,
                     signature: e.detail.signature,
                 }
            if (code) {
                _this.mpLogin(param)
            }
        },
    getUserProfile() {
        wx.clearStorageSync()
        let _this = this
        let param = {
            code: '',
            iv: '',
            rawData: '',
            encryptedData: '',
            signature: '',
        }
        _this.setData({
            apiClicked:true
        })
          wx.login({
              success: function (resCode) {
                  if (resCode.code) {
                      param.code = resCode.code
                  }
              }
          })
        wx.getUserProfile({
            desc: '获取您的头像、昵称等信息', 
            success: (res) => {
                param.rawData = res.rawData
                app.globalData.userInfo = res.userInfo
                param.iv = res.iv,
                param.encryptedData = res.encryptedData,
                param.signature = res.signature
                // wx.getUserInfo({
                    // success: function (UserInfoRes) {
                            //  param.iv = UserInfoRes.iv,
                            //  param.encryptedData = UserInfoRes.encryptedData,
                            //  param.signature = UserInfoRes.signature
                      _this.mpLogin(param)
                    // }
                // })

            },
            fail: (res) => {
                 _this.setData({
                     apiClicked: false
                 })
            }
        })
    },
    mpLogin(param) {
        let _this = this
        let RequestObjs = {
            method: "POST",
            url: '/wxrequest',
            data: {
                'function': 'mpLogin',
                'data':[{
                    'code': param.code,
                    'iv': param.iv,
                    'rawData': param.rawData,
                    'encryptedData': param.encryptedData,
                    'signature': param.signature,
                }]
            },
        }
        promiseRequest(RequestObjs).then(res => {
            if (res.data.code === '0') {
                let userType = res.data.data[0].userType
                let DataArr = res.data.data[0]
                wx.setStorageSync('token', DataArr.token)
                wx.setStorageSync('userType', userType)
                let URL = ''
                 switch (userType) {
                     case '-2':
                         // -2 ：未绑定手机用户
                         URL = '../tiedCard/tiedCard?tabsItem=' + 0
                         break
                     case '-1':
                         // -1 = 未绑定诊疗卡用户
                         URL = '../tiedCard/tiedCard?tabsItem=' + 1
                         break
                     case '2':
                         URL = '../MyRecord/MyRecord'
                         break
                     case '1':
                         URL = '../medicalcare/index/index'
                         break
                 }
                  if (URL) {
                      wx.reLaunch({
                          url: URL
                      })
                  }
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
            setTimeout(() => {
                _this.setData({
                    apiClicked: false
                })
            }, 5000);
        }).catch(err => {
            console.log(err);
        })
    }
})