const {
    request
} = require("../../../utils/request")
const {
    getDates
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
let date = getDates(1, new Date());
let newDate = moment(date[0].time).format('YYYY年MM月DD日')
Page({
    /**
     * 页面的初始数据
     */
    data: {
        DeleteFoodList: [],
        DeletePhotoList: [],
        foodIndex: 0,
        foodArr: [],
        fileList: [],
        dateObj: {
            StartDt: newDate,
            EndDt: '2029年01月01',
            EXDATE: '2019年12月01日',
            DateSelect: newDate,
            title: "记录时间"
        },
        rniList: {},
        enteringItems: [],
        categoryValues: [],
        dataTime: date[0].time,
        enteringArray: [],
        UploadShow: false,
    },
    UploadCourseware(e) {
        var that = this
        let {
            index,
            periodcode
        } = e.currentTarget.dataset
        let enteringItems = this.data.enteringItems
        var newArr = this.data.enteringArray
        that.setData({
            UploadShow: true,
        })
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                var tempFilePaths = res.tempFilePaths;
                wx.uploadFile({
                    url: 'https://aaron.astraia.com.cn//wxupload',
                    filePath: tempFilePaths[0],
                    name: 'upload',
                    formData: {
                        "token": wx.getStorageSync('token'),
                        "category": "dietPhoto"
                    },
                    success(res) {
                        const data = res.data
                        let ResData = JSON.parse(data)
                        if (ResData.code == '0') {
                            wx.showToast({
                                title: '上传成功',
                                duration: 3000
                            })
                            if (enteringItems[index].photo) {
                                enteringItems[index].photo = enteringItems[index].photo.concat(ResData.data);
                            } else {
                                enteringItems[index].photo = ResData.data
                            }
                            if (!newArr[index]) {
                                newArr.push({
                                    date: that.data.dataTime,
                                    periodCode: periodcode,
                                    id: "",
                                    rowMd5: "",
                                    time: "",
                                    categoryCode: "",
                                    food: [],
                                    photo: []
                                })
                            } else {
                                newArr[index].date = that.data.dataTime
                                newArr[index].photo = ResData.data
                            }
                            // newArr[index].date = that.data.dataTime
                            // newArr[index].photo = ResData.data
                            that.setData({
                                enteringItems,
                                // fileList: tempFilePaths,
                                fileList: ResData.data,
                                enteringArray: newArr
                            })
                        }
                    }
                })

            }
        })
    },
    getDiet() {
        let self = this
        self.setData({
            DeleteFoodList: [],
            DeletePhotoList: [],
        })
        wx.removeStorageSync('FoodDataList')
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getDiet",
                "data": [{
                    "date": self.data.dataTime
                }]
            }
        }).then(res => {
            console.log(res, "取饮食记录");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                let NewEnteringArray = self.data.enteringArray
                if (ResData.items[0].id) {
                    NewEnteringArray = []
                    for (const key in ResData.items) {
                        if (ResData.items[key].id && ResData.items[key].rowMd5) {
                            if (!NewEnteringArray[key]) {
                                NewEnteringArray.push({
                                    date: self.data.dataTime,
                                    periodCode: ResData.items[key].periodCode,
                                    id: "",
                                    rowMd5: "",
                                    time: "",
                                    categoryCode: "",
                                    food: [],
                                    photo: []
                                })
                            }
                            NewEnteringArray[key].periodCode = ResData.items[key].periodCode
                            NewEnteringArray[key].photo = ResData.items[key].photo
                            NewEnteringArray[key].food = ResData.items[key].food
                            NewEnteringArray[key].time = ResData.items[key].time
                            NewEnteringArray[key].categoryCode = ResData.items[key].categoryCode
                            NewEnteringArray[key].rowMd5 = ResData.items[key].rowMd5
                            NewEnteringArray[key].id = ResData.items[key].id
                        }
                    }
                } else {
                    NewEnteringArray = []
                    self.setData({
                        enteringArray: NewEnteringArray,
                    })
                }
                self.setData({
                    enteringArray: NewEnteringArray,
                    categoryValues: ResData.categoryValues,
                    rniList: ResData.rni,
                    enteringItems: ResData.items,
                })
                // self.getStorageFoodArr()
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    DelFoodTag(e) {
        let {
            index,
            id,
            rowmd5,
            ins
        } = e.currentTarget.dataset
        if (id && rowmd5) {
            let arrs = this.data.DeleteFoodList
            arrs.push({
                entity: "dietFood",
                id: id,
                rowMd5: rowmd5,
            })
            this.setData({
                DeleteFoodList: arrs
            })
        }
        this.data.enteringItems[index].food.splice(ins, 1)
        this.setData({
            enteringItems: this.data.enteringItems
        })
    },
    DelFoodList() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "delete",
                "data": self.data.DeleteFoodList
            }
        }).then(res => {
            if (res.data.code === '0') {

            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    delPhoto(e) {
        let {
            index,
            filename,
            ins
        } = e.currentTarget.dataset
        let self = this
        let NewList = self.data.DeletePhotoList
        NewList.push({
            category: "dietPhoto",
            fileName: filename
        })
        self.data.enteringItems[index].photo.splice(ins, 1)
        self.setData({
            enteringItems: self.data.enteringItems,
            DeletePhotoList: NewList
        })
    },
    deleteFile() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "deleteFile",
                "data": self.data.DeletePhotoList
            }
        }).then(res => {
            if (res.data.code === '0') {} else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    bindCategoryChange(e) {

        let self = this
        let {
            periodcode,
            index,
        } = e.currentTarget.dataset
        let enteringItems = self.data.enteringItems
        let val = e.detail.value
        enteringItems[index].categoryValue = self.data.categoryValues[val].value
        enteringItems[index].categoryCode = self.data.categoryValues[val].code
        var newArr = self.data.enteringArray
        let codeArr = []
        newArr.forEach(item => {
            codeArr.push(item.periodCode)
        })
        if (codeArr.includes(periodcode)) {
            newArr[codeArr.indexOf(periodcode)].periodCode = periodcode
            newArr[codeArr.indexOf(periodcode)].date = self.data.dataTime
            newArr[codeArr.indexOf(periodcode)].categoryCode = self.data.categoryValues[val].code
            newArr[codeArr.indexOf(periodcode)].food = self.data.enteringItems[index].food
            newArr[codeArr.indexOf(periodcode)].time = self.data.enteringItems[index].time

        } else {
            newArr.push({
                date: self.data.dataTime,
                periodCode: periodcode,
                id: "",
                rowMd5: "",
                time: self.data.enteringItems[index].time,
                categoryCode: self.data.categoryValues[val].code,
                food: [],
                photo: self.data.enteringItems[index].photo
            })
        }
        this.setData({
            enteringItems,
            enteringArray: newArr
        })
    },
    bindTimeChange: function (e) {
        let self = this
        let {
            periodcode,
            index,
        } = e.currentTarget.dataset
        let enteringItems = this.data.enteringItems
        let dataObj = e.detail.value;
        enteringItems[index].time = dataObj
        var newArr = this.data.enteringArray
        let codeArr = []
        newArr.forEach(item => {
            codeArr.push(item.periodCode)
        })
        if (codeArr.includes(periodcode)) {
            newArr[codeArr.indexOf(periodcode)].periodCode = periodcode
            newArr[codeArr.indexOf(periodcode)].date = self.data.dataTime
            newArr[codeArr.indexOf(periodcode)].time = dataObj

        } else {
            newArr.push({
                date: self.data.dataTime,
                periodCode: periodcode,
                id: "",
                rowMd5: "",
                time: dataObj,
                categoryCode: "",
                food: [],
                photo: self.data.enteringItems[index].photo
            })
        }
        this.setData({
            enteringItems,
            enteringArray: newArr
        })
    },
    tapFoodAdd(e) {
        let {
            index,
            periodcode,
            food
        } = e.currentTarget.dataset
        let FoodData = wx.getStorageSync('FoodDataList') || []
        let periodCodeArr = []
        if (food) {
            FoodData.forEach(item => {
                periodCodeArr.push(item.periodCode)
            })
            var code = food.map(c => {
                return c.code
            })
            if (periodCodeArr.includes(periodcode)) {
                FoodData[periodCodeArr.indexOf(periodcode)].periodCode = periodcode
                FoodData[periodCodeArr.indexOf(periodcode)].foodArr = food
                FoodData[periodCodeArr.indexOf(periodcode)].codeArr = code
            } else {
                FoodData.push({
                    periodCode: periodcode,
                    foodArr: food,
                    codeArr: code
                })
                periodCodeArr.push(periodcode)
            }
            wx.setStorageSync('FoodDataList', FoodData)
        }

        this.setData({
            foodIndex: index,
            UploadShow: false
        })
        wx.navigateTo({
            url: `../recordDiet/recordDiet?periodCode=${periodcode}`
        })
    },
    bindDateChange(e) {
        var NewData = this.data.dateObj;
        let val = e.detail.value
        let dateSelect = e.detail.date
        NewData.DateSelect = val;
        this.setData({
            dateObj: NewData,
            dataTime: dateSelect
        })
        this.getDiet()

    },
    onSaveBtn() {
        let self = this
        let params = this.data.enteringArray;
        let judgeArr = []
        for (const key in params) {
            if (!params[key].time) {
                judgeArr.push('time')
            } else if (!params[key].categoryCode) {
                judgeArr.push('categoryCode')
            } else if (params[key].categoryCode && params[key].categoryCode && params[key].photo) {
                if (!params[key].food) {
                    judgeArr.push('food')
                }
            } else {}

        }
        if (judgeArr.includes('time')) {
            wx.showToast({
                title: '请选择时间',
                icon: 'none',
                duration: 3000
            })
            return false;
        } else if (judgeArr.includes('categoryCode')) {
            wx.showToast({
                title: '请选择类型',
                icon: 'none',
                duration: 3000
            })
            return false;
        } else if (judgeArr.includes('food')) {
            wx.showToast({
                title: '请录入食物',
                icon: 'none',
                duration: 3000
            })
            return false;
        } else {
            self.saveDiet(params)
        }


    },
    saveDiet(params) {
        let self = this
        if (self.data.DeleteFoodList.length > 0) {
            self.DelFoodList()
        }
        if (self.data.DeletePhotoList.length > 0) {
            self.deleteFile()
        }
        for (const key in params) {
            for (const fod in params[key].food) {
                let foodItem = params[key].food
                delete foodItem[fod].name
            }
            for (const photo in params[key].photo) {
                let photoItem = params[key].photo
                delete photoItem[photo].category
                delete photoItem[photo].url
            }
        }

        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "saveDiet",
                "data": params
            }
        }).then(res => {
            if (res.data.code === '0') {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
                self.getDiet()
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    historyRecordBtn(e) {
        wx.navigateTo({
            url: '../historyDietRecords/historyDietRecords'
        })
    },
    getStorageFoodArr() {
        let that = this
        let foodIndex
        var enteringItems = this.data.enteringItems
        var enteringArray = this.data.enteringArray
        if (enteringItems.length > 0) {
            let FoodDataList = wx.getStorageSync('FoodDataList')
            for (const key in enteringItems) {
                let items = enteringItems[key]
                for (const i in FoodDataList) {
                    if (items.periodCode === FoodDataList[i].periodCode) {
                        foodIndex = key
                        if (enteringItems[foodIndex]) {
                            enteringItems[foodIndex].food = FoodDataList[i].foodArr
                        }
                        let codeArr = []
                        enteringArray.forEach(item => {
                            codeArr.push(item.periodCode)
                        })
                        if (codeArr.includes(FoodDataList[i].periodCode)) {
                            if (FoodDataList[i].foodArr) {
                                enteringArray[codeArr.indexOf(FoodDataList[i].periodCode)].food = FoodDataList[i].foodArr
                            } else {
                                enteringArray[codeArr.indexOf(FoodDataList[i].periodCode)].food = FoodDataList[i].foodArr
                                enteringArray[codeArr.indexOf(FoodDataList[i].periodCode)].periodCode = FoodDataList[i].periodCode
                            }

                        } else {
                            enteringArray.push({
                                date: that.data.dataTime,
                                periodCode: FoodDataList[i].periodCode,
                                id: '',
                                rowMd5: '',
                                time: '',
                                categoryCode: '',
                                food: FoodDataList[i].foodArr,
                                photo: []
                            })
                        }

                        // if (!enteringArray[foodIndex]) {
                        //     enteringArray.push({
                        //         date: that.data.dataTime,
                        //         periodCode: FoodDataList[i].periodCode,
                        //         id: '',
                        //         rowMd5: '',
                        //         time: '',
                        //         categoryCode: '',
                        //         food: FoodDataList[i].foodArr,
                        //         photo: []
                        //     })
                        // } else {
                        //     if (FoodDataList[i].foodArr) {
                        //         enteringArray[foodIndex].food = FoodDataList[i].foodArr
                        //     } else {
                        //         enteringArray[foodIndex].food = FoodDataList[i].foodArr
                        //         enteringArray[foodIndex].periodCode = FoodDataList[i].periodCode
                        //     }
                        // }
                        this.setData({
                            enteringItems,
                            enteringArray
                        })
                    }
                }
            }

        }

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getDiet()
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
        let that = this
        if (that.data.UploadShow) {
            that.setData({
                UploadShow: false
            })
            return
        } else {
            that.getStorageFoodArr()
        }



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