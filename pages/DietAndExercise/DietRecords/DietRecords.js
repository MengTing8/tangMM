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
        enteringArray: [{
            date: date[0].time,
            periodCode: "",
            id: "",
            rowMd5: "",
            time: "",
            categoryCode: "",
            food: [],
            photo: []
        }], //保存接口的参数
        dataList: [{
            date: "2020-06-16",
            periodCode: "1",
            id: "",
            rowMd5: "",
            time: "09:30",
            categoryCode: "1",
            food: [{
                    id: "",
                    rowMd5: "",
                    code: "",
                    value: ""
                },
                {
                    id: "",
                    rowMd5: "",
                    code: "",
                    value: ""
                }
            ],
            photo: [{
                    id: "",
                    rowMd5: "",
                    fileName: ""
                },
                {
                    id: "",
                    rowMd5: "",
                    fileName: ""
                }
            ]
        }, ],
        UploadShow: false,
    },
    UploadCourseware(e) {
        console.log(e);
        var that = this
        let {
            index,
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
                console.log(res)
                console.log(that.data.UploadShow);
                var tempFilePaths = res.tempFilePaths;
                // console.log(tempFilePaths)
                wx.uploadFile({
                    url: 'https://aaron.astraia.com.cn//wxupload',
                    filePath: tempFilePaths[0],
                    name: 'upload',
                    formData: {
                        "token": wx.getStorageSync('token'),
                        "category": "dietPhoto"
                    },
                    success(res) {
                        console.log(res);
                        const data = res.data
                        let ResData = JSON.parse(data)
                        console.log(ResData);
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
                                    periodCode: "",
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
                            console.log(enteringItems);
                            console.log(newArr);
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
                    NewEnteringArray = [{
                        date: self.data.dataTime,
                        periodCode: "",
                        id: "",
                        rowMd5: "",
                        time: "",
                        categoryCode: "",
                        food: [],
                        photo: []
                    }]
                    for (const key in ResData.items) {
                        if (ResData.items[key].id && ResData.items[key].rowMd5) {
                            if (!NewEnteringArray[key]) {
                                NewEnteringArray.push({
                                    date: self.data.dataTime,
                                    periodCode: "",
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
                    NewEnteringArray = [{
                        date: self.data.dataTime,
                        periodCode: "",
                        id: "",
                        rowMd5: "",
                        time: "",
                        categoryCode: "",
                        food: [],
                        photo: []
                    }]
                    self.setData({
                        enteringArray: NewEnteringArray,
                        DeleteList: []
                    })
                }
                self.setData({
                    enteringArray: NewEnteringArray,
                    categoryValues: ResData.categoryValues,
                    rniList: ResData.rni,
                    enteringItems: ResData.items
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
    DelFoodTag(e) {
        console.log(e);
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
            console.log(res, "删除食物");
            if (res.data.code === '0') {
                //   wx.showToast({
                //       title: res.data.message,
                //       icon: 'none',
                //       duration: 2000
                //   })
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
            console.log(res, "删除");
            if (res.data.code === '0') {
                console.log('删除成功');

            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    bindCategoryChange(e) {
        console.log(e);
        let self = this
        let {
            periodcode,
            index,
            categorycode,
        } = e.currentTarget.dataset
        let enteringItems = self.data.enteringItems
        let val = e.detail.value
        enteringItems[index].categoryValue = self.data.categoryValues[val].value
        enteringItems[index].categoryCode = self.data.categoryValues[val].code
        var newArr = self.data.enteringArray
        if (!newArr[index]) {
            newArr.push({
                date: self.data.dataTime,
                periodCode: periodcode,
                id: "",
                rowMd5: "",
                time: self.data.enteringItems[index].time,
                categoryCode: self.data.categoryValues[val].code,
                food: self.data.enteringItems[index].food,
                photo: self.data.enteringItems[index].photo
            })
        } else {
            newArr[index].periodCode = periodcode
            newArr[index].date = self.data.dataTime
            newArr[index].categoryCode = self.data.categoryValues[val].code
            newArr[index].food = self.data.enteringItems[index].food
            newArr[index].time = self.data.enteringItems[index].time
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
        if (!newArr[index]) {
            newArr.push({
                date: self.data.dataTime,
                periodCode: periodcode,
                id: "",
                rowMd5: "",
                time: dataObj,
                categoryCode: "",
                food: self.data.enteringItems[index].food,
                photo: self.data.enteringItems[index].photo
            })
        } else {
            newArr[index].periodCode = periodcode
            newArr[index].date = self.data.dataTime
            newArr[index].time = dataObj
        }
        this.setData({
            enteringItems,
            enteringArray: newArr
        })
    },
    tapFoodAdd(e) {
        let index = Number(e.currentTarget.dataset.index)
        console.log(index);
        this.setData({
            foodIndex: index,
            UploadShow: false
        })
        wx.navigateTo({
            url: '../recordDiet/recordDiet'
        })
    },
    bindDateChange(e) {
        console.log(e);
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
        if (self.data.DeleteFoodList.length > 0) {
            self.DelFoodList()
        }
        if (self.data.DeletePhotoList.length > 0) {
            self.deleteFile()
        }
        let params = this.data.enteringArray;
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
            console.log(res, "保存");
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
        console.log(e);
        wx.navigateTo({
            url: '../historyDietRecords/historyDietRecords'
        })
    },
    duplicates(arr) {
        return arr.sort().filter((v, k) => {
            console.log(arr[k]);

            return arr[k].code === arr[k + 1] && arr[k].code !== arr[k - 1];
        })
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
        console.log("show");
        let that = this
        if (that.data.UploadShow) {
            console.log('上传触发的onshow');
            that.setData({
                UploadShow: false
            })
            return
        } else {
            console.log("不上传onshow");
            var pages = getCurrentPages();
            var currPage = pages[pages.length - 1];
            var enteringItems = this.data.enteringItems
            var enteringArray = this.data.enteringArray
            let Eitems = enteringItems[this.data.foodIndex].food
            let newEitems = currPage.data.foodArr
            if (newEitems.length > 0) {
                if (Eitems) {
                    let Arrs = []
                    // Eitems = Eitems.concat(newEitems);
                    console.log(Eitems);
                    console.log(newEitems);
                    Eitems.forEach(val => {
                        let obj = {}
                        obj.code = val.code
                        obj.name = val.name
                        let arr = []
                        newEitems.forEach(function (val2, k) {
                            console.log(val.code + '---' + val2.code);
                            if (val.code == val2.code) {
                                val.value = val2.value
                                newEitems.splice(k, 1)
                            } else {
                                arr.push(val2)
                                console.log(arr);
                                Arrs = arr
                            }
                        })
                    });
                    Eitems = Eitems.concat(Arrs);
                    enteringItems[this.data.foodIndex].food = Eitems
                    this.setData({
                        enteringItems,
                    })
                } else {
                    console.log('else1',enteringItems);

                    enteringItems[this.data.foodIndex].food = currPage.data.foodArr
                    // enteringArray[this.data.foodIndex].food = enteringItems[this.data.foodIndex].food

                }
                if (!enteringArray[this.data.foodIndex]) {
                    enteringArray.push({
                        date: that.data.dataTime,
                        periodCode: "",
                        id: "",
                        rowMd5: "",
                        time: "",
                        categoryCode: "",
                        food: currPage.data.foodArr,
                        photo: []
                    })
                } else {
                    console.log('else', Eitems, currPage.data.foodArr);
                    if (Eitems) {
                        enteringArray[this.data.foodIndex].food = Eitems
                    } else {
                        enteringArray[this.data.foodIndex].food = currPage.data.foodArr

                    }
                }
                // enteringItems[this.data.foodIndex].food = Eitems
                this.setData({
                    enteringItems,
                    enteringArray
                })
            }
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