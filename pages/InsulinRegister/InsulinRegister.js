const {
    request
} = require("../../utils/request")
const {
    getDates
} = require("../../utils/util")
const moment = require('../../utils/moment.min.js');
let date = getDates(1, new Date());
let newDate = moment(date[0].time).format('YYYY年MM月DD日')
moment.locale();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        mealItem: [],
        InsulinData: {},
        dateObj: {
            StartDt: newDate,
            EndDt: '2029年01月01',
            EXDATE: newDate,
            DateSelect: newDate,
            title: "日期"
        },
        dataTime: date[0].time,
        TabsIndex: 1,
        dosageArray: [{
            entity: "insulinPump",
           patientId: wx.getStorageSync('patientId'),
            date: date[0].time,
            type: 2,
            status: 1,
            id: '',
            rowMd5: '',
            timeStart: '',
            timeEnd: '',
            value: ''
        }],
        MealArray: [{
            entity: "insulin",
           patientId: wx.getStorageSync('patientId'),
            date: date[0].time,
            type: 2,
            status: 1,
            id: '',
            rowMd5: '',
            periodCode: '',
            value: ''
        }],
        DeleteList: [],

    },
    SaveInsulin() {
        let self = this
        let InsulinData = self.data.InsulinData
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "save",
                "data": [{
                    "entity": "insulin",
                    "patientId": wx.getStorageSync('patientId'),
                    "date": self.data.dataTime,
                    "id": InsulinData.id,
                    "rowMd5": InsulinData.rowMd5,
                    "type": 1,
                    "periodCode": InsulinData.periodCode,
                    "categoryCode": InsulinData.categoryCode,
                    "value": InsulinData.value,
                    "status": "1"
                }]
            }
        }).then(res => {
            console.log(res, "保存");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                self.setData({
                    categoryValues: ResData.categoryValues,
                    periodValues: ResData.periodValues
                })
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
                this.getInsulin()
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    getInsulin() {
        let self = this
        let InsulinData = self.data.InsulinData
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getInsulin",
                "data": [{
                    "date": self.data.dataTime,
                    "periodCode": InsulinData.periodCode || "1",
                    "categoryCode": InsulinData.categoryCode || "1"
                }]
            }
        }).then(res => {
            console.log(res, "普通");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                self.setData({
                    InsulinData: ResData,
                    categoryValues: ResData.categoryValues,
                    periodValues: ResData.periodValues
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
    SaveInsulinPump() {
        let self = this
        if (self.data.DeleteList.length>0) {
        self.DeleteInsulinPump()
        }
        let params = self.data.MealArray.concat(self.data.dosageArray);
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "save",
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
                self.getInsulinPump()
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    getInsulinPump() {
        let self = this
        // let InsulinData = self.data.InsulinData
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getInsulinPump",
                "data": [{
                    "date": self.data.dataTime,
                }]
            }
        }).then(res => {
            console.log(res, "胰岛素泵");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                let NewMealArray = self.data.MealArray
                let NewDosageArray = self.data.dosageArray
                if (ResData.items1[0].id) {
                    NewMealArray = [{
                        entity: "insulin",
                       patientId: wx.getStorageSync('patientId'),
                        date: self.data.dataTime,
                        type: 2,
                        status: 1,
                        id: '',
                        rowMd5: '',
                        periodCode: '',
                        value: ''
                    }]
                    for (const key in ResData.items1) {
                        if (ResData.items1[key].id && ResData.items1[key].rowMd5) {
                            if (!NewMealArray[key]) {
                                NewMealArray.push({
                                    entity: "insulin",
                                   patientId: wx.getStorageSync('patientId'),
                                    date: self.data.dataTime,
                                    type: 2,
                                    status: 1,
                                    id: ResData.items1[key].id,
                                    rowMd5: ResData.items1[key].rowMd5,
                                    periodCode: ResData.items1[key].periodCode,
                                    value: ResData.items1[key].value
                                })
                            }
                            NewMealArray[key].periodCode = ResData.items1[key].periodCode
                            NewMealArray[key].value = ResData.items1[key].value
                            NewMealArray[key].rowMd5 = ResData.items1[key].rowMd5
                            NewMealArray[key].id = ResData.items1[key].id
                        }
                    }
                } else {
                    NewMealArray = [{
                        entity: "insulin",
                       patientId: wx.getStorageSync('patientId'),
                        date: self.data.dataTime,
                        type: 2,
                        status: 1,
                        id: '',
                        rowMd5: '',
                        periodCode: '',
                        value: ''
                    }]
                    self.setData({
                        MealArray: NewMealArray,
                        DeleteList: []
                    })
                }

                if (ResData.items2.length > 0) {
                    NewDosageArray = [{
                        entity: "insulinPump",
                       patientId: wx.getStorageSync('patientId'),
                        date: self.data.dataTime,
                        type: 2,
                        status: 1,
                        id: '',
                        rowMd5: '',
                        timeStart: '',
                        timeEnd: '',
                        value: ''
                    }]
                    for (const key in ResData.items2) {
                        if (ResData.items2[key].id && ResData.items2[key].rowMd5) {

                            if (!NewDosageArray[key]) {
                                NewDosageArray.push({
                                    entity: "insulinPump",
                                   patientId: wx.getStorageSync('patientId'),
                                    date: self.data.dataTime,
                                    type: 2,
                                    status: 1,
                                    timeStart: ResData.items2[key].timeStart,
                                    timeEnd: ResData.items2[key].timeEnd,
                                    id: ResData.items2[key].id,
                                    rowMd5: ResData.items2[key].rowMd5,
                                    value: ResData.items2[key].value
                                })
                            }
                            NewDosageArray[key].timeStart = ResData.items2[key].timeStart
                            NewDosageArray[key].timeEnd = ResData.items2[key].timeEnd
                            NewDosageArray[key].value = ResData.items2[key].value
                            NewDosageArray[key].rowMd5 = ResData.items2[key].rowMd5
                            NewDosageArray[key].id = ResData.items2[key].id
                        }
                    }
                    self.setData({
                        MealArray: NewMealArray,
                        dosageArray: NewDosageArray,
                        mealItem: ResData.items1,
                        DeleteList: []

                    })
                } else {
                    NewDosageArray = [{
                        entity: "insulinPump",
                       patientId: wx.getStorageSync('patientId'),
                        date: self.data.dataTime,
                        type: 2,
                        status: 1,
                        id: '',
                        rowMd5: '',
                        timeStart: '',
                        timeEnd: '',
                        value: ''
                    }]
                    NewMealArray = [{
                        entity: "insulin",
                       patientId: wx.getStorageSync('patientId'),
                        date: self.data.dataTime,
                        type: 2,
                        status: 1,
                        id: '',
                        rowMd5: '',
                        periodCode: '',
                        value: ''
                    }]
                    self.setData({
                        MealArray: NewMealArray,
                        dosageArray: NewDosageArray,
                        DeleteList: []

                    })
                }

                self.setData({
                    mealItem: ResData.items1,
                    DeleteList: []

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
    DeleteInsulinPump() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "delete",
                "data": self.data.DeleteList
            }
        }).then(res => {
            console.log(res, "删除");
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
    bindDateChange(e) {
        var NewData = this.data.dateObj;
        let val = e.detail.value
        let dateSelect = e.detail.date
        NewData.DateSelect = val;
        this.setData({
            dateObj: NewData,
            dataTime: dateSelect
        })
        if (this.data.TabsIndex == 0) {
            this.getInsulin()
        } else if (this.data.TabsIndex == 1) {
            this.getInsulinPump()
        }
    },
    bindValueInput(e) {
        let InsulinData = this.data.InsulinData
        InsulinData.value = e.detail.value
        this.setData({
            InsulinData
        })
    },
    bindServiceTimeChange(e) {
        let InsulinData = this.data.InsulinData
        let val = e.detail.value
        InsulinData.periodValue = this.data.periodValues[val].value
        InsulinData.periodCode = this.data.periodValues[val].code
        this.setData({
            InsulinData
        })
    },
    bindTypeChange(e) {
        let InsulinData = this.data.InsulinData
        let val = e.detail.value
        InsulinData.categoryValue = this.data.categoryValues[val].value
        InsulinData.categoryCode = this.data.categoryValues[val].code
        this.setData({
            InsulinData
        })
    },
    //删除
    delDosage: function (e) {
        let {
            index,
            id,
            rowmd5
        } = e.currentTarget.dataset
        if (id && rowmd5) {
            let NewList = this.data.DeleteList
            NewList.push({
                entity: "insulinPump",
                id: id,
                rowMd5: rowmd5,
            })
            console.log(NewList);
             this.setData({
                 DeleteList: NewList
             })
        }
        this.data.dosageArray.splice(index, 1)
        this.setData({
            dosageArray: this.data.dosageArray
        })
    },
    //添加记录列表
    addDosageList() {
        let self = this
        var arr = this.data.dosageArray
        arr.push({
            entity: "insulinPump",
           patientId: wx.getStorageSync('patientId'),
            date: self.data.dataTime,
            type: 2,
            status: 1,
            id: '',
            rowMd5: '',
            timeStart: '',
            timeEnd: '',
            value: ''
        })
        this.setData({
            dosageArray: arr,
        })
    },
    bindMealValueInput(e) {
        console.log(e);
        let self = this

        let {
            code,
            index,
            rowmd5,
            id
        } = e.target.dataset
        var newArr = this.data.MealArray
        var dataObj = e.detail.value;
        if (!newArr[index]) {
            newArr.push({
                entity: "insulin",
               patientId: wx.getStorageSync('patientId'),
                date: self.data.dataTime,
                type: 2,
                status: 1,
                id: '',
                rowMd5: '',
                periodCode: '',
                value: ''
            })
        }
        newArr[index].value = dataObj
        newArr[index].periodCode = code
        newArr[index].rowMd5 = rowmd5
        newArr[index].id = id
        this.setData({
            MealArray: newArr
        })
    },
    //时间选择器
    bindStartTimeChange: function (e) {
        console.log(e)
        let index = Number(e.target.dataset.index)
        let newArray = this.data.dosageArray
        let dataObj = e.detail.value;
        newArray[index].timeStart = dataObj
        this.setData({
            dosageArray: newArray
        })
    },
    //时间选择器
    bindEndTimeChange: function (e) {
        console.log(e)
        let index = Number(e.target.dataset.index)
        let newArray = this.data.dosageArray
        let dataObj = e.detail.value;
        newArray[index].timeEnd = dataObj
        this.setData({
            dosageArray: newArray
        })
    },
    //输入框绑定
    bindDosageInput(e) {
        var index = Number(e.target.dataset.index)
        var newArr = this.data.dosageArray
        var dataObj = e.detail.value;
        newArr[index].value = dataObj
        this.setData({
            dosageArray: newArr
        })
    },
    handleTitleChange(e) {
        let index = e.currentTarget.dataset.index
        this.setData({
            TabsIndex: index
        })
        if (index == 0) {
            this.getInsulin()
        } else if (index == 1) {
            this.getInsulinPump()
        }

    },
    historyRecordBtn() {
        wx.navigateTo({
            url: '../historyInsulin/historyInsulin'
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getInsulin()
        this.getInsulinPump()
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