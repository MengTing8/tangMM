const {
    promiseRequest
} = require("../../../utils/Requests")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        activeIndex: null,
        TabsIndex: 0,
        NurseData: {},
        tabs: [],
        MenuTitle: ['胎数', "胰岛素类型", '特殊高危人群'],
        MenuItems: [],
        ids: 0,
    },
    bindShowMsg(e) {
        let index = e.currentTarget.dataset.index
        this.setData({
            activeIndex: this.data.activeIndex == index ? -1 : index,
            ids: index
        })
    },
    mySelect(e) {
        var name = e.currentTarget.dataset.value
        let arr = this.data.MenuTitle
        arr[this.data.activeIndex] = name
        this.setData({
            MenuTitle: arr,
            activeIndex: null
        })
    },
    changeDevelop(i) {
        console.log(i);
        //  this.title = this.developList[i - 1].text
    },
    getNurse() {
        let that = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getNurse",
                "data": []
            }
        }).then((res) => {
            console.log(res, "getNurse");
            if (res.data.code === '0') {
                // let items = res.data.data[0].items
                // let newItems = res.data.data[0].items
                // newItems.forEach(element => {
                //     element.combobox = JSON.parse(JSON.stringify(element.combobox).replace(/value/g, "text"));
                // });
                that.setData({
                    NurseData: res.data.data[0],
                    MenuItems: res.data.data[0].items
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
    getPatient() {
        let requestObj = {
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getPatient",
                "data": []
            }
        };
        promiseRequest(requestObj).then((res) => {
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
        this.getPatient()
        this.getNurse()
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