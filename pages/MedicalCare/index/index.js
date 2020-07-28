const {
    promiseRequest
} = require("../../../utils/Requests")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        TabsIndex: 0,
        option1: [{
                text: '全部商品',
                value: 0,
                icon: null
            },
            {
                text: '新款商品',
                value: 1
            },
            {
                text: '活动商品',
                value: 2
            },
        ],
        option2: [{
                text: '默认排序',
                value: 'a'
            },
            {
                text: '好评排序',
                value: 'b'
            },
            {
                text: '销量排序',
                value: 'c'
            },
        ],
        option3: [{
                text: '默认排序',
                value: 'a'
            },
            {
                text: '好评排序',
                value: 'b'
            },
            {
                text: '销量排序',
                value: 'c'
            },
        ],
        value1: 0,
        value2: 'a',
        value3: 'a',
    },
    getMaternalDetailsProject() {
        let requestObj = {
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getMaternalDetailsProject",
                "data": []
            }
        };
        promiseRequest(requestObj).then((res) => {
            console.log(res);
            if (res.data.code === '0') {


            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        }).catch((errMsg) => {
            console.log(errMsg); //错误提示信息
        });
    },
    TabsChange(e) {
        let index = e.currentTarget.dataset.index
        this.setData({
            TabsIndex: index
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getMaternalDetailsProject()
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