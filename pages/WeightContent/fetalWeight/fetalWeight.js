const {
    request
} = require("../../../utils/request")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        FetusWeightList: []
    },
    getFetusWeightList() {
        let self = this 
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getFetusWeightList",
                "data": []
            }
        }).then(res => {
            console.log(res, "列表");
            if (res.data.code === '0') {
                self.setData({
                    FetusWeightList: res.data.data
                })
                //  if (res.data.data.length > 0) {
                //      var ResData = res.data.data[0]
                //      let newObj = self.data.dateObj
                //      newObj.DateSelect = moment(ResData.date).format('YYYY年MM月DD日')
                //      self.setData({
                //          dateObj: newObj,
                //          rowMd5: ResData.rowMd5,
                //          id: ResData.id,
                //          BPD: ResData.biparietalDiametger,
                //          HC: ResData.headCircumference,
                //          AC: ResData.abdorminalCircumference,
                //          FL: ResData.femurLength,
                //      })
                //  } else {
                //      self.setData({
                //          // dateObj: newObj,
                //          rowMd5: '',
                //          id: '',
                //          BPD: '',
                //          HC: '',
                //          AC: '',
                //          FL: '',
                //      })
                //  }

            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getFetusWeightList()
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