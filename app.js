//app.js
App({
    onLaunch: function () {
        const userType = wx.getStorageSync('userType');
        if (userType == '2') {
            wx.redirectTo({
                url: '/pages/MyRecord/MyRecord?userType=' + userType
            })
        } else if (userType =='1') {
            wx.redirectTo({
                url: '/pages/MedicalCare/index/index'
            })
        }
        var _self = this
        // 展示本地存储能力
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 登录
        wx.login({
            success: res => {
                _self.globalData.code = res.code;
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            _self.globalData.userInfo = res.userInfo
                            _self.globalData.iv = res.iv;
                            _self.globalData.rawData = res.rawData;
                            _self.globalData.encryptedData = res.encryptedData;
                            _self.globalData.signature = res.signature;

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (_self.userInfoReadyCallback) {
                                _self.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })
    },

    globalData: {
        code: null,
        iv: null,
        rawData: null,
        encryptedData: null,
        signature: null,
        userInfo: null,
        userType: null,
        playIndex: 0, //当前播放列表的index
        exeQueue: true,
        needBeginLogin: true,
        promiseQueue: [],
    }
})