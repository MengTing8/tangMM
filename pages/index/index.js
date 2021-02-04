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
        Clicked: false,
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
    preventTouchMove(e){
        console.log("preventTouchMove");
    },
    async getUserInfo(e) {
        console.log(e);
         wx.clearStorageSync()
        let _this = this
              app.globalData.userInfo = e.detail.userInfo
              let code = await wxlogin()
            //   wx.login({
            //       success: res => {
            //           console.log(res);
            //           code = res.code;
            //           _this.setData({
            //               Clicked:true,
            //           })
            //           console.log('11');
                 

            //       console.log('222');

            //       }
            //   })
            
        // setTimeout(() => {
             if (code) {
                 _this.mpLogin(code, e.detail.iv, e.detail.rawData, e.detail.encryptedData, e.detail.signature)
             }
        // }, 500);
      
    },
    mpLogin(code, iv, rawData, encryptedData, signature) {
         console.log(code);
          let _this = this
          let RequestObjs = {
              method: "POST",
              url: '/wxrequest',
              data: {
                  'function': 'mpLogin',
                  'data': [{
                      'code': code,
                      'iv': iv,
                      'rawData': rawData,
                      'encryptedData': encryptedData,
                      'signature': signature,
                  }]
              },
          }
          console.log(RequestObjs);
          promiseRequest(RequestObjs).then(res => {
              console.log(res);
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
                  } else if (userType == '2') {
                      wx.reLaunch({
                          url: '../MyRecord/MyRecord'
                      })
                  } else if (userType == '1') {
                      wx.reLaunch({
                          url: '../medicalcare/index/index'
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
              }, 3000);
          }).catch(err => {
              console.log(err);
          })
    }
})