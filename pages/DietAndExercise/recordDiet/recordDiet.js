const {
    promiseRequest
} = require("../../../utils/Requests")
const {
    deepCopy
} = require("../../../utils/util")
import regeneratorRuntime from '../../../lib/runtime/runtime';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        btnnum: 0,
        ShowTab: true,
        SearchFoodList: [],
        SearchIndex: '',
        SearchItem: [],
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
        SearchShow: true,
    },
    Tabchange(event) {
        var singleNavWidth = this.data.windowWidth / 5;
        let {
            index
        } = event.currentTarget.dataset
        let TabList = this.data.TabList
        this.setData({
            navScrollLeft: (index - 2) * singleNavWidth
        })
        if (this.data.btnnum == index) {
            return false;
        } else {
            this.setData({
                btnnum: index,
            })
        }
        if (this.data.SearchShow) {
            if (this.data.btnnum !== this.data.SearchIndex) {
                if (this.data.SearchIndex) {
                    TabList[this.data.SearchIndex].foodValues = this.data.SearchItem
                    this.setData({
                        TabList,
                        SearchShow: false,

                    })
                }

            }
        }
        console.log(TabList);

    },
    bindSearchFood(e) {
        let that = this
        let {
            groupcode,
            groupvalue,
            item
        } = e.currentTarget.dataset
        let newTabList = that.data.TabList
        let index = ''
        for (const key in newTabList) {
            let items = newTabList[key]
            if (items.groupCode.indexOf('99') !== -1) {
                index = key
            }
        }
        let Arrs = deepCopy(newTabList[index].foodValues)
        newTabList[index].foodValues = [item]
        // newTabList[index].groupValue = groupvalue
        // newTabList[index].groupCode = groupcode
        if (index !== '') {
            var singleNavWidth = that.data.windowWidth / 5;
            that.setData({
                navScrollLeft: (index - 2) * singleNavWidth,
                btnnum: Number(index),
                ShowTab: true,
                SearchShow: true,
                SearchValue: "",
                TabList: newTabList,
                SearchIndex: index,
                SearchItem: Arrs
            })
        }
    },
    getFood() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getDefaultFood",
                "data": []
            }
        }).then(res => {
            if (res.data.code === '0') {
                console.log(res);
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
            index2
        } = e.target.dataset
        let that = this
        var newArr = that.data.foodArr
        var dataObj = e.detail.value;
        let codeArr = that.data.codeArr
        let tabArr = that.data.TabList
        tabArr[index1].foodValues[index2].value = dataObj
        let newFoodDataList = that.data.FoodDataList

        if (that.data.SearchItem.length > 0) {
            that.data.SearchItem.forEach(s => {
                if (s.code == tabArr[index1].foodValues[index2].code) {
                    s.value = dataObj
                }
            });
            that.setData({
                SearchItem: that.data.SearchItem
            })
        }
        if (newArr.length > 0) {
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
        let self = this
        self.setData({
            SearchValue: e.detail
        })
        if (e.detail == '') {
            self.setData({
                ShowTab: true,
                SearchFoodList: []
            })
        } else {
            promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "getFood",
                    "data": [{
                        "searchValue": e.detail
                    }]
                }
            }).then(res => {
                console.log(res);
                if (res.data.code === '0') {
                    var ResData = res.data.data[0]
                    var afterData = []
                    if (ResData) {
                        ResData.forEach(item => {
                            let flag = afterData.find(item1 => item1.groupValue === item.groupValue)
                            if (!flag) {
                                afterData.push({
                                    groupValue: item.groupValue,
                                    foodValues: [item]
                                })
                            } else {
                                flag.foodValues.push(item)
                            }
                        })
                        self.setData({
                            ShowTab: false,
                            SearchFoodList: afterData
                        })
                    } else {
                        self.setData({
                            ShowTab: false,
                            SearchFoodList: []
                        })
                    }
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        }
    },
    sendMessage() {
        var that = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "sendMessage",
                "data": [{
                    "type": "1",
                    "patientId": wx.getStorageSync('patientId'),
                    "message": that.data.SearchValue
                }]
            }
        }).then(res => {
            console.log(res);
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                wx.showToast({
                    title: '留言成功',
                    icon: 'none',
                    duration: 2000
                })
                setTimeout(() => {
                    that.setData({
                        SearchValue: '',
                        ShowTab: true
                    })
                }, 2000);
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
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
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                wx.downloadFile({
                    url: ResData.url,
                    success: function (res) {
                        const filePath = res.tempFilePath
                        wx.openDocument({
                            filePath: filePath,
                            success: function (res) {
                                //成功
                                setTimeout(() => {
                                    that.setData({
                                        SearchValue: '',
                                        ShowTab: true
                                    })
                                }, 2500);
                            }
                        })
                    }
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
    // bindSearch(e) {
    //     let that = this
    //     that.setData({
    //         SearchValue: e.detail
    //     })
    //     let item = that.data.TabList
    //     let NewList = []
    //     for (const key in item) {
    //         let items = item[key]
    //         for (const Index in items.foodValues) {
    //             let foodArr = items.foodValues[Index]
    //             if (foodArr.name.indexOf(that.data.SearchValue) !== -1) {
    //                 let obj = {}
    //                 obj.foodChildren = [foodArr]
    //                 obj.groupValue = items.groupValue
    //                 obj.groupCode = items.groupCode

    //                 NewList.push(obj)
    //             }
    //         }
    //     }
    //     let foodTypeArr = []
    //     let arr = []
    //     NewList.forEach(val => {
    //         let obj = {}
    //         if (foodTypeArr.indexOf(val.groupValue) !== -1) {
    //             arr[foodTypeArr.indexOf(val.groupValue)].foodValues = arr[foodTypeArr.indexOf(val.groupValue)].foodValues.concat(val.foodChildren)
    //         } else {
    //             foodTypeArr.push(val.groupValue)
    //             obj.groupValue = val.groupValue
    //             obj.groupCode = val.groupCode
    //             obj.foodValues = val.foodChildren
    //             arr.push(obj)
    //         }

    //     });
    //     that.setData({
    //         ShowTab: false,
    //         SearchFoodList: arr
    //     })
    //     if (that.data.SearchValue == '') {
    //         that.setData({
    //             ShowTab: true,
    //             //  SearchFoodList: arr
    //         })
    //     }
    // },
    TapSearch() {
        var model = JSON.stringify(this.data.TabList);
        wx.navigateTo({
            url: '../recordDietSearch/recordDietSearch?TabList=' + model
        })
    },
    getFoodDataList() {
        var that = this
        return new Promise((resolve, reject) => {
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
            that.setData({
                FoodDataList: newFoodDataList,
                codeArr: newCode,
                foodArr: newFood,
            })
            resolve(newCode)
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {
            periodCode
        } = options
        var that = this
        // that.getFood()
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
    onShow: async function () {
        var that = this
        this.setData({
            FoodDataList: wx.getStorageSync('FoodDataList') || [],
        })
        let res = await that.getFoodDataList()
        that.getFood()
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