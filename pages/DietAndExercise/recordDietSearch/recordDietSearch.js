// pages/recordDietSearch/recordDietSearch.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        TabList: [],
         SearchVal: "",
    },
    onSearchChange(e) {
        let that = this
        that.setData({
            SearchVal: e.detail
        })
        let item = that.data.TabList

        let NewList = []
        for (const key in item) {
            let items = item[key]
            for (const Index in items.foodValues) {
                let foodArr = items.foodValues[Index]
                if (foodArr.name.indexOf(that.data.SearchVal) !== -1) {
                    let obj = {}
                    obj.foodChildren = [foodArr]
                    obj.foodType = items.groupValue
                    NewList.push(obj)
                }
            }
        }
        let foodTypeArr = []
        let arr = []
        NewList.forEach(val => {
            let obj = {}
            // 如果该品类已经存在数组中
            if (foodTypeArr.indexOf(val.foodType) !== -1) {
                arr[foodTypeArr.indexOf(val.foodType)].nafoodChildrenme = arr[foodTypeArr.indexOf(val.foodType)].nafoodChildrenme.concat(val.foodChildren)
            } else {
                foodTypeArr.push(val.foodType)
                obj.foodType = val.foodType
                obj.nafoodChildrenme = val.foodChildren
                arr.push(obj)
            }

        });
        console.log(arr)
        that.setData({
            TabList:arr
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        // 先将字符串转化为数组
        var TabList = JSON.parse(options.TabList)
        console.log(TabList)
        this.setData({
       TabList
        })
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