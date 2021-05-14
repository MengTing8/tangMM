const {
    promiseRequest,
    wxuploadURL
} = require("../../../utils/Requests")
var log = require('../../../utils/log.js')

const {
    getDates,
    deepCopy,
    sortFun
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
        dateObj: {
            StartDt: newDate,
            EndDt: date[0].time,
            DateSelect: newDate,
            title: "记录时间",
            value: date[0].time
        },
        rniList: {},
        enteringItems: [],
        categoryValues: [],
        dataTime: date[0].time,
        enteringArray: [],
        UploadShow: false,
        apiClicked: false,
    },
    DeleteByDate(e) {
        let date = e.detail.date
        let that = this
        let isValue
        that.data.enteringItems.forEach(item => {
            if (item.id) {
                isValue = true
            }
        })
        if (isValue) {
            wx.showModal({
                title: '提示',
                content: "确定删除当日数据？",
                success(res) {
                    if (res.confirm) {
                        promiseRequest({
                            method: "POST",
                            url: '/wxrequest',
                            data: {
                                "token": wx.getStorageSync('token'),
                                "function": "deleteByDate",
                                "data": [{
                                    "entity": "diet",
                                    "date": date
                                }]
                            }
                        }).then((res) => {
                            if (res.data.code === '0') {
                                wx.showToast({
                                    title: res.data.message,
                                    icon: 'none',
                                    duration: 3000
                                })
                                that.getDiet()
                            } else {
                                wx.showToast({
                                    title: res.data.message,
                                    icon: 'none',
                                    duration: 3000
                                })
                            }
                        })
                    } else if (res.cancel) {}
                }
            })
        } else {
            wx.showToast({
                title: '无数据可删！',
                icon: 'none',
                duration: 2000
            })
        }
    },
    UploadCourseware(e) {
        var that = this
        let {
            index,
        } = e.currentTarget.dataset
        let enteringItems = this.data.enteringItems
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
                    url: wxuploadURL,
                    // url: 'https://gy3y.astraia.com.cn//wxupload',
                    filePath: tempFilePaths[0],
                    name: 'upload',
                    formData: {
                        "token": wx.getStorageSync('token'),
                        "category": "dietPhoto"
                    },
                    success(res) {
                        let ResData = JSON.parse(res.data)
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
                            that.setData({
                                enteringItems,
                                // enteringArray: enteringItems
                            })
                        } else {
                             wx.showToast({
                                 title: ResData.message,
                                 icon: 'none',
                                 duration: 2000
                             })
                        }
                    }
                })

            },

        })
    },
    getDiet() {
        let self = this
        let eArray = self.data.enteringItems
        console.log(eArray);
        wx.removeStorageSync('FoodDataList')
        promiseRequest({
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
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                eArray =ResData.items
                ResData.items.sort(sortFun(`sequence`))
                for (const key in ResData.items) {
                    eArray[key].rowMd5 = ResData.items[key].rowMd5
                    eArray[key].id = ResData.items[key].id
                }
                self.setData({
                    enteringArray: ResData.items,
                    categoryValues: ResData.categoryValues,
                    rniList: ResData.rni,
                    enteringItems: eArray,
                    DeleteFoodList: [],
                    DeletePhotoList: [],
                })
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
              setTimeout(() => {
                  self.setData({
                      apiClicked: false
                  })
              }, 5000);
        })
    },
    DelFoodTag(e) {
        let {
            index,
            id,
            rowmd5,
            ins,
            code,
            periodcode
        } = e.currentTarget.dataset
        let Items = this.data.enteringItems
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
        } else {

        }
        let FoodDataList = wx.getStorageSync('FoodDataList')
        let foodId
        for (const F in FoodDataList) {
            foodId = FoodDataList[F].codeArr.indexOf(code)
            if (periodcode == FoodDataList[F].periodCode) {
                if (FoodDataList[F].codeArr.includes(code)) {
                    FoodDataList[F].codeArr.splice(foodId, 1)
                    FoodDataList[F].foodArr.splice(foodId, 1)
                }
            }
        }
        wx.setStorageSync('FoodDataList', FoodDataList)

        Items[index].food.splice(ins, 1)
        if (Items[index].food.length == 0) {
            Items[index].food = null
        }
        this.setData({
            enteringItems: Items,
            // enteringArray: Items
        })
    },
    DelFoodList() {
        let self = this
        promiseRequest({
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
            ins,
        } = e.currentTarget.dataset
        let self = this
        let Items = self.data.enteringItems
        let NewList = self.data.DeletePhotoList
        NewList.push({
            category: "dietPhoto",
            fileName: filename
        })
        Items[index].photo.splice(ins, 1)
        if (Items[index].photo.length == 0) {
            Items[index].photo = null
        }
        self.setData({
            enteringItems: Items,
            // enteringArray: Items,
            DeletePhotoList: NewList
        })
    },
    deleteFile() {
        let self = this
        promiseRequest({
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
            index
        } = e.currentTarget.dataset
        let enteringItems = self.data.enteringItems
        let val = e.detail.value
        enteringItems[index].categoryValue = self.data.categoryValues[val].value
        enteringItems[index].categoryCode = self.data.categoryValues[val].code
        this.setData({
            enteringItems,
            // enteringArray: enteringItems
        })
    },
    bindTimeChange: function (e) {
        let self = this
        let {
            index,
        } = e.currentTarget.dataset
        let enteringItems = self.data.enteringItems
        let timeData = e.detail.value;
        enteringItems[index].time = timeData
        self.setData({
            enteringItems,
            // enteringArray: enteringItems
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
        }
        //  else {
        //     wx.setStorageSync('FoodDataList', null)
        // }
        wx.setStorageSync('FoodDataList', FoodData)

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
        NewData.value = e.detail.date;
        this.setData({
            dateObj: NewData,
            dataTime: dateSelect
        })
        this.getDiet()

    },
    onSaveBtn() {
        let self = this
        let params = deepCopy(self.data.enteringItems)
        let initialArr = self.data.enteringArray
       for (const ins in initialArr) {
           if (params[ins].periodCode == initialArr[ins].periodCode) {
               params[ins].id = initialArr[ins].id
           }
       }
        let judgeArr = []
        for (let i = 0; i < params.length; i++) {
            params[i].date = self.data.dataTime
            delete params[i].categoryValue
            delete params[i].sequence
            delete params[i].periodValue
            if (!params[i].time && params[i].categoryCode == '0' && !params[i].food && !params[i].photo) {
                params.splice(i, 1)
                i = i - 1
            }
        }
        for (const key in params) {
            if (!params[key].time) {
                judgeArr.push('time')
            } else if (!params[key].categoryCode || params[key].categoryCode == '0') {
                judgeArr.push('categoryCode')
            } else if (params[key].categoryCode && params[key].categoryCode && params[key].photo) {
                if (!params[key].food) {
                    judgeArr.push('food')
                }
            }
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
            return;
        }
    },
    saveDiet(params) {
        let self = this
        if (params.length == 0) {
            wx.showToast({
                title: '请输入数据',
                icon: 'none',
                duration: 3000
            })
            return false;
        } else {
            self.setData({
                apiClicked: true
            })
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
            promiseRequest({
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
                      setTimeout(() => {
                          self.setData({
                              apiClicked: false
                          })
                      }, 5000);
                }
              
            })
        }
    },
    historyRecordBtn(e) {
        wx.navigateTo({
            url: '../historyDietRecords/historyDietRecords'
        })
    },
    getStorageFoodArr() {
        let that = this
        let foodIndex
        var enteringItems = that.data.enteringItems
        let arrs = that.data.DeleteFoodList
        let oldCode = []
        let newCode = []

        if (enteringItems.length > 0) {
            let FoodDataList = wx.getStorageSync('FoodDataList')
            for (const key in enteringItems) {
                let items = enteringItems[key]
                if (enteringItems[key].food) {
                    enteringItems[key].food.forEach(e => {
                        oldCode.push(e.code)
                    })
                }
                for (const i in FoodDataList) {
                    if (items.periodCode === FoodDataList[i].periodCode) {
                        for (const f in FoodDataList[i].foodArr) {
                            let foodId = oldCode.indexOf(FoodDataList[i].foodArr[f].code)
                            newCode.push(FoodDataList[i].foodArr[f].code)
                            if (enteringItems[key].food) {
                                if (enteringItems[key].food[foodId]) {
                                    if (oldCode.includes(FoodDataList[i].foodArr[f].code)) {
                                        if (FoodDataList[i].foodArr[f].code == enteringItems[key].food[foodId].code) {
                                            FoodDataList[i].foodArr[f].id = enteringItems[key].food[foodId].id
                                            FoodDataList[i].foodArr[f].rowMd5 = enteringItems[key].food[foodId].rowMd5
                                        }
                                    }
                                }

                            }

                        }
                        for (const c in enteringItems[key].food) {
                            if (!newCode.includes(enteringItems[key].food[c].code)) {
                                arrs.push({
                                    entity: "dietFood",
                                    id: enteringItems[key].food[c].id,
                                    rowMd5: enteringItems[key].food[c].rowMd5,
                                })
                            }

                        }
                        foodIndex = key
                        if (enteringItems[foodIndex]) {
                            enteringItems[foodIndex].food = FoodDataList[i].foodArr
                        }

                    }
                }
            }
            that.setData({
                enteringItems,
                // enteringArray: enteringItems,
                DeleteFoodList: arrs
            })
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


        log.info('hello test hahaha') // 日志会和当前打开的页面关联，建议在页面的onHide、onShow等生命周期里面打
        log.warn('warn')
        log.error('error')
        log.setFilterMsg('filterkeyword')
        log.addFilterMsg('addfilterkeyword')

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