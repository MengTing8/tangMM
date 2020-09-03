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
                } else if (userType == '-2') {
                    // -2 ：未绑定手机用户
                    wx.reLaunch({
                        url: '/pages/tiedCard/tiedCard?tabsItem=' + 0
                    })
                } else if (userType == '-1') {
                    // -1 = 未绑定诊疗卡用户
                    wx.reLaunch({
                        url: '/pages/tiedCard/tiedCard?tabsItem=' + 1
                    })
                }
            }, 0);
        }
    },
    onShow: function () {},


    globalData: {
        // userInfo: null,
        playIndex: 0, //当前播放列表的index
        exeQueue: true,
        needBeginLogin: true,
        promiseQueue: [],
        patientId: null,
        // ---
        refreshClock: false,
        timeStart: '',
        clock: "00:00",
        total_econd: "",
        quantity: 10, //原始胎动次数
        validQuantity: 0, //有效胎动次数
    }
})