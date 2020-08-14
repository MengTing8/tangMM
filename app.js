//app.js
App({
    onLaunch: function () {
        const userType = wx.getStorageSync('userType');
        if (wx.getStorageSync('token') && userType) {
            setTimeout(() => {
                if (userType == '2') {
                    wx.reLaunch({
                        url: '/pages/MyRecord/MyRecord'
                    })
                } else if (userType == '1') {
                    wx.reLaunch({
                        url: '/pages/MedicalCare/index/index'
                    })
                } else if (userType == -2) {
                    // -2 ：未绑定手机用户
                    wx.reLaunch({
                        url: '/pages/tiedCard/tiedCard?tabsItem=' + 0
                    })
                } else if (userType == -1) {
                    // -1 = 未绑定诊疗卡用户
                    wx.reLaunch({
                        url: '/pages/tiedCard/tiedCard?tabsItem=' + 1
                    })
                }
            }, 0);
        }
    },

    globalData: {
        // userInfo: null,
        playIndex: 0, //当前播放列表的index
        exeQueue: true,
        needBeginLogin: true,
        promiseQueue: [],
    }
})