const {
  promiseRequest
} = require("../../../utils/Requests")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    SuggestionSrc: '',
  },
  getDietSuggestion() {
    var that = this
    promiseRequest({
      method: "POST",
      url: '/wxrequest',
      data: {
        "token": wx.getStorageSync('token'),
        "function": "getDietSuggestion",
        "data": [{
          "patientId": wx.getStorageSync('patientId'),
        }]
      }
    }).then(res => {
      console.log(res);
      if (res.data.code === '0') {
        var ResData = res.data.data[0]

        that.setData({
          SuggestionSrc: ResData.url
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getDietSuggestion()
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