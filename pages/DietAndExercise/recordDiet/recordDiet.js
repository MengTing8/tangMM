const {
    request
} = require("../../../utils/request")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        btnnum: 1,
        ShowTab: true,
        SearchFoodList: [],
        SearchValue: "",
        active: 1,
        inputCode1: true,
        TabList: [],
        foodArr: [],
        codeArr: [],
        navScrollLeft: 0,
        windowHeight: 0,
        windowWidth: 0,
        periodCode: '',
        FoodDataList: [],
    },
    Tabchange(event) {
        var singleNavWidth = this.data.windowWidth / 5;
        let {
            index
        } = event.currentTarget.dataset
        this.setData({
            navScrollLeft: (index - 2) * singleNavWidth
        })
        if (this.data.btnnum == index) {
            return false;
        } else {
            this.setData({
                btnnum: index
            })
        }
    },
    bindSearchFood(e) {
        let that = this
        let {
            foodcode,
            id
        } = e.currentTarget.dataset
        let item = that.data.TabList
        let index = ''
        for (const key in item) {
            let items = item[key]
            if (items.groupCode.indexOf(foodcode) !== -1) {
                index = key
            }
        }
        if (index !== '') {
            that.setData({
                btnnum: Number(index),
                ShowTab: true,
                SearchValue: ""
            })
        }
        let query = wx.createSelectorQuery()
        query.select('#point' + (id)).boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function (res) {
            if (res[0] && res[1]) {
                wx.pageScrollTo({
                    scrollTop: res[0].top + res[1].scrollTop,
                    duration: 300
                })
            }
        })
    },
    getFood() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getFood",
                "data": []
            }
        }).then(res => {
            console.log(res, "食物");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                let foodArr = []

                let FoodData = self.data.FoodDataList
                let codeArr = []
                FoodData.forEach(item => {
                    codeArr.push(item.periodCode)
                })
                if (codeArr.includes(self.data.periodCode)) {
                    FoodData[codeArr.indexOf(self.data.periodCode)].periodCode = self.data.periodCode
                    foodArr = FoodData[codeArr.indexOf(self.data.periodCode)].foodArr
                } else {
                }
                for (const key in ResData) {
                    let items = ResData[key]
                    for (const Index in items.foodValues) {
                        let arr = items.foodValues[Index]
                        for (const i in foodArr) {
                            if (arr.code === foodArr[i].code) {
                                arr.value = foodArr[i].value
                            }
                        }
                    }
                }
                self.setData({
                    TabList: ResData,
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
    bindFoodValueInput(e) {
        let {
            code,
            name,
            index1,
            index
        } = e.target.dataset
        let that = this
        var newArr = that.data.foodArr
        var dataObj = e.detail.value;
        let codeArr = that.data.codeArr
        let tabArr = that.data.TabList
        tabArr[index1].foodValues[index].value = dataObj
        let newFoodDataList = that.data.FoodDataList
        if (newArr.length !== 0) {
            for (let i = 0; i < newArr.length; i++) {
                if (codeArr.indexOf(code) !== -1) {
                    newArr[codeArr.indexOf(code)].value = dataObj
                    newArr[codeArr.indexOf(code)].code = code;
                    newArr[codeArr.indexOf(code)].name = name;
                    break;
                } else {
                    if (codeArr.indexOf(code) === -1) {
                        newArr.push({
                            name: name,
                            code: code,
                            value: dataObj
                        })
                        codeArr.push(code)
                        break;
                    } else {
                        newArr[i].name = name,
                            newArr[i].value = dataObj
                        newArr[i].code = code;
                        break;
                    }
                }
            }
            if (!newArr[codeArr.indexOf(code)].value) {
                newArr.splice(codeArr.indexOf(code), 1)
                codeArr.splice(codeArr.indexOf(code), 1)
            }
            for (const key in newFoodDataList) {
                if (newFoodDataList[key].periodCode == that.data.periodCode) {
                    newFoodDataList[key].foodArr = newArr
                    newFoodDataList[key].codeArr = codeArr
                }
            }
        } else {
            newArr.push({
                name: name,
                code: code,
                value: dataObj
            })
            codeArr.push(code)
            for (const key in newFoodDataList) {
                if (newFoodDataList[key].periodCode == that.data.periodCode) {
                    newFoodDataList[key].foodArr = newArr
                    newFoodDataList[key].codeArr = codeArr
                }
            }
        }

        that.setData({
            foodArr: newArr,
            TabList: tabArr,
            FoodDataList: newFoodDataList
        })
        wx.setStorageSync('FoodDataList', newFoodDataList)
        // wx.setStorageSync('codeArr', codeArr)
        // wx.setStorageSync('foodArr', newArr)
    },
    saveFood() {
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        prevPage.setData({
            foodArr: this.data.foodArr
        })
        setTimeout(() => {
            wx.navigateBack({
                delta: 1
            })
        }, 1000)
    },
    bindSearch(e) {
        let that = this
        that.setData({
            SearchValue: e.detail
        })
        let item = that.data.TabList
        let NewList = []
        for (const key in item) {
            let items = item[key]
            for (const Index in items.foodValues) {
                let foodArr = items.foodValues[Index]
                if (foodArr.name.indexOf(that.data.SearchValue) !== -1) {
                    let obj = {}
                    obj.foodChildren = [foodArr]
                    obj.foodType = items.groupValue
                    obj.foodCode = items.groupCode

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
                obj.foodCode = val.foodCode
                obj.nafoodChildrenme = val.foodChildren
                arr.push(obj)
            }

        });
        that.setData({
            ShowTab: false,
            SearchFoodList: arr
        })
        if (that.data.SearchValue == '') {
            that.setData({
                ShowTab: true,
                //  SearchFoodList: arr
            })
        }
    },
    TapSearch() {
        var model = JSON.stringify(this.data.TabList);
        wx.navigateTo({
            url: '../recordDietSearch/recordDietSearch?TabList=' + model
        })
    },
    getFoodDataList() {
        var that = this
        let newFoodDataList = that.data.FoodDataList
        let newFood = that.data.foodArr
        let newCode = that.data.codeArr
        let codeList = []
        if (newFoodDataList.length !== 0) {
            newFoodDataList.forEach(item => {
                codeList.push(item.periodCode)
            })
        }
        if (codeList.includes(that.data.periodCode)) {
            newFoodDataList[codeList.indexOf(that.data.periodCode)].periodCode = that.data.periodCode
            newFood = newFoodDataList[codeList.indexOf(that.data.periodCode)].foodArr
            newCode = newFoodDataList[codeList.indexOf(that.data.periodCode)].codeArr
        } else {
            newFoodDataList.push({
                periodCode: that.data.periodCode,
            })
            codeList.push(that.data.periodCode)
        }
        console.log(newFoodDataList);
        that.setData({
            FoodDataList: newFoodDataList,
            codeArr: newCode,
            foodArr: newFood,
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {
            periodCode
        } = options
        //   var food = JSON.parse(options.food);
        var that = this
        that.getFood()
        wx.getSystemInfo({
            success: (res) => {
                that.setData({
                    windowHeight: res.windowHeight,
                    windowWidth: res.windowWidth
                })
            },
        })

        that.setData({
            periodCode,
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
        console.log('show');
        this.setData({
            FoodDataList: wx.getStorageSync('FoodDataList') || [],
        })
        this.getFoodDataList()
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