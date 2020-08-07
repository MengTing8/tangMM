    const gas = []
    const days = []
    for (let i = 0; i <= 40; i++) {
        gas.push(i + '周')
    }

    for (let i = 0; i <= 6; i++) {
        days.push(i + '天')
    }
    const {
        promiseRequest
    } = require("../../../utils/Requests")
    Page({

        /**
         * 页面的初始数据
         */
        data: {
            WeeksRecordList: [],
            FetalMovementList: [],
            multiIndex: [0, 0],
            gas,
            days,
            predays: [gas],
            GA: '',
            TabsIndex: 0,
        },
        //取胎动监测今日记录
        getFetalMovementList() {
            let self = this
            promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "getFetalMovementList",
                    "data": []
                }
            }).then(res => {
                if (res.data.code === '0') {
                    self.setData({
                        FetalMovementList: res.data.data
                    })
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        },
        //孕周记录
        getFetalMovementListW() {
            let self = this
            promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "getFetalMovementListByWeek",
                    "data": [{
                        "gestationalWeek": self.data.GA
                    }]
                }
            }).then(res => {
                if (res.data.code === '0') {
                    self.setData({
                        WeeksRecordList: res.data.data
                    })
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        },
          handleTitleChange(e) {
              let index = e.currentTarget.dataset.index
              this.setData({
                  TabsIndex: index
              })
              if (index == 0) {
                  this.getFetalMovementList()
              } else {
                  this.getFetalMovementListW()

              }
          },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function (options) {
            this.getFetalMovementList()
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