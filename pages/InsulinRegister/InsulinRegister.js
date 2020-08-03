const {
    promiseRequest
} = require("../../utils/Requests")
const {
    getDates,
    getDay
} = require("../../utils/util")
const moment = require('../../utils/moment.min.js');
const tips = { periodCode: '请选择使用时间', categoryCode: '请选择胰岛素类型', value: '请输入使用量', periodOtherValue: '请输入使用时间' };
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
        TabsIndex: 0,
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
        userData: [{
            periodCode: '',
            periodOtherValue: '',
            categoryCode: '',
            value: ''
        }],
        delList:[],
        GA:''
    },
    SaveInsulin() {
        if (this.data.delList.length > 0) {
          this.delInsulin();
        }

        if (this.data.userData.length === 0) {
          return;
        }

        let userData = this.data.userData

        for (let i = 0; i < userData.length; i++) {
          for (const key in userData[i]) {
            const item = userData[i][key]
            if (key === 'periodOtherValue' && userData[i].periodCode !== "99") {
                continue;
            }
            if (!item || item.replace(/\s+/g,'').length === 0) {
              wx.showToast({
                title: tips[key],
                icon: 'none',
                duration: 2000
              })
              return false;
            }
          }
        }

        for (let i = 0; i < userData.length; i++) {
            userData[i].entity = 'insulin';
            userData[i].patientId = wx.getStorageSync('patientId');
            userData[i].date = this.data.dataTime;
            userData[i].type = '1';
            userData[i].status = '1';
        }

        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "save",
                "data": userData
            }
        }).then(res => {
            console.log(res, "保存");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                this.setData({
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
    delInsulin() {
        promiseRequest({
          method: "POST",
          url: '/wxrequest',
          data: {
            "token": wx.getStorageSync('token'),
            "function": "delete",
            "data": this.data.delList
          }
        }).then(res => {
          console.log(res, "删除");
          if (res.data.code === '0') {
            this.setData({
              delList: []
            })
            wx.showToast({
              title: '删除成功',
              icon: 'none',
              duration: 2000
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
    getPrevData() {
      const prevDate = getDay(-1)
      if(this.data.TabsIndex === 0) {
          this.getInsulin(prevDate)
      }else {
          this.getInsulinPump(prevDate)
      }
    },
    getInsulin(date) {
        let self = this
        let InsulinData = self.data.InsulinData
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getInsulin",
                "data": [{
                    "date": date ? date : self.data.dataTime 
                }]
            }
        }).then(res => {
            console.log(res, "普通");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                self.setData({
                    InsulinData: ResData,
                    categoryValues: ResData.categoryValues,
                    periodValues: ResData.periodValues,
                    userData: ResData.items ? ResData.items : [{
                        periodCode: '',
                        periodOtherValue: '',
                        categoryCode: '',
                        value: ''
                    }] 
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
        promiseRequest({
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
    getInsulinPump(date) {
        let self = this
        // let InsulinData = self.data.InsulinData
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getInsulinPump",
                "data": [{
                    "date": date ? date : self.data.dataTime,
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
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "delete",
                "data": self.data.DeleteList
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
            url: '../historyInsulin/historyInsulin?GA=' + this.data.GA 
        })
    },
    bindPeriodChange(e) {
        const index = e.target.dataset.index;
        let userData = this.data.userData
        const val = e.detail.value
        userData[index].periodCode = this.data.periodValues[val].code
        userData[index].periodValue = this.data.periodValues[val].value
        if(userData[index].periodCode !== "99") {
          userData[index].periodOtherValue = null
        }
        this.setData({
          userData,
        });
    },
    bindCategoryChange(e) {
        const index = e.target.dataset.index;
        let userData = this.data.userData
        const val = e.detail.value
        userData[index].categoryCode = this.data.categoryValues[val].code
        userData[index].categoryValue = this.data.categoryValues[val].value
        this.setData({
          userData,
        });
    },
    bindValueInput(e) {
        const {index,type} = e.target.dataset
        let userData = this.data.userData
        if(type == "other") {
          userData[index].periodOtherValue = e.detail.value
        }else {
          userData[index].value = e.detail.value
        }
        this.setData({
          userData
        })
    },
    addRecordList: function() {
        let userData = this.data.userData;
        userData.push({
          periodCode: '',
          periodOtherValue: '',
          categoryCode: '',
          value:''
        });
        this.setData({
          userData
        });
    },
    delRecordList(e) {
        const { index, id, rowmd5 } = e.currentTarget.dataset;
        let userData = this.data.userData;
        userData.splice(index, 1);
        if (id && rowmd5) {
          let delList = this.data.delList;
          delList.push({
            entity: 'insulin',
            id: id,
            rowMd5: rowmd5
          });
          this.setData({
            delList
          });
        }
        this.setData({
          userData
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {
            gestationalWeek
        } = options
        this.setData({
            GA: gestationalWeek
        }) 
        this.getInsulin()
        this.getInsulinPump()
    },
})