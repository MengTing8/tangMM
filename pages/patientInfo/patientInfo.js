const {
    promiseRequest
} = require("../../utils/Requests")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInputConten: '',
        talkContent: [{
            text: '护长，请问资料这样录入有问题吗？',
            isMine: true,
            satrtTime: '2020-02-10  20:20:51',
            headImg: '../../img/user.png'
        }, {
            text: '护长，请问资料这样录入有问题吗？',
            isMine: true,
            satrtTime: '2020-02-10  20:20:51',
            headImg: '../../img/user.png'
        }],
        tabs: ['项目', '留言', '基本信息'],
        TabsIndex: 0,
        ProjectsData: {}
    },
     getProjects() {
          let requestObj = {
              method: "POST",
              url: '/wxrequest',
              data: {
                  "token": wx.getStorageSync('token'),
                  "function": "getProjects",
                  "data": [{
                       "patientId": "1"
                  }]
              }
          };
          promiseRequest(requestObj).then((res) => {
              console.log(res);
              if (res.data.code === '0') {
                  this.setData({
                      ProjectsData: res.data.data[0]
                  })

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
        let index = e.detail.index
        this.setData({
            TabsIndex: index
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
this.getProjects()
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