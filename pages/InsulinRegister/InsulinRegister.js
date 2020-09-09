const {
    promiseRequest
} = require("../../utils/Requests")
const {
    formatTime,
    getDates,
    getDay,
    sortFun,
    contrastTime,
    deepCopy
} = require("../../utils/util")
const moment = require('../../utils/moment.min.js');
const tips = {
    periodCode: '请选择使用时间',
    categoryCode: '请选择胰岛素类型',
    value: '请输入使用量',
    periodOtherValue: '请输入使用时间'
};
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
            EndDt: date[0].time,
            DateSelect: newDate,
            value: date[0].time,
            title: "日期"
        },
        dataTime: date[0].time,
        TabsIndex: 0,
        dosageArray: [],
        MealArray: [],
        DeleteList: [],
        userData: [{
            periodCode: '',
            periodOtherValue: '',
            categoryCode: '',
            value: ''
        }],
        delList: [],
        GA: ''
    },
    DeleteByDate(e) {
        let date = e.detail.date
        let that = this
        // if (that.data.userData[0].periodCode || that.data.MealArray.length > 0 || that.data.dosageArray[0].id) {
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
                                "entity": "insulin",
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
                            if (that.data.TabsIndex == 0) {
                                that.getInsulin()
                            } else {
                                that.getInsulinPump()

                            }
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
        // } else {
        //     wx.showToast({
        //         title: '无数据可删！',
        //         icon: 'none',
        //         duration: 2000
        //     })
        // }
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
                if (!item || item.replace(/\s+/g, '').length === 0) {
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
        let that = this
        wx.showModal({
            title: '提示',
            content: "确定取前一天数据吗？",
            success(res) {
                if (res.confirm) {
                    const prevDate = getDay(-1, that.data.dataTime)
                    if (that.data.TabsIndex == 0) {
                        that.getInsulin(prevDate)
                    } else {
                        that.getInsulinPump(prevDate)

                    }
                } else if (res.cancel) {}
            }
        })

    },
    getInsulin(date) {
        let self = this
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
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                let params
                if (date) {
                    params = deepCopy(self.data.userData)
                    let delList = self.data.delList;
                    for (const key in params) {
                        if (params[key].rowMd5 && params[key].id) {
                            delList.push({
                                entity: 'insulin',
                                id: params[key].id,
                                rowMd5: params[key].rowMd5
                            });
                        }
                    }
                    self.setData({
                        delList
                    });
                    for (const key in ResData.items) {
                        if (ResData.items[key].rowMd5) {
                            delete ResData.items[key].rowMd5
                        }
                        if (ResData.items[key].id) {
                            delete ResData.items[key].id
                        }
                    }
                }
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
    compareDate(begin, over) {
        // begin = begin.sort();
        // over = over.sort();
        // for (var i = 0; i < begin.length; i++) {
        //     if (begin[i] <= over[i - 1]) {
        //         wx.showToast({
        //             title: "时间段重复!",
        //             icon: 'none',
        //             duration: 2000
        //         })
        //         return false;
        //     }
        // }
        return true;
    },
    SaveInsulinPump() {
        let self = this
        let dosage = deepCopy(self.data.dosageArray)
        let paramsMeal = deepCopy(self.data.MealArray)
        for (let i = 0; i < dosage.length; i++) {
            dosage[i].entity = 'insulinPump';
            dosage[i].patientId = wx.getStorageSync('patientId');
            dosage[i].date = self.data.dataTime;
            dosage[i].type = '2';
            dosage[i].status = '1';
        }
        for (let i = 0; i < paramsMeal.length; i++) {
            if (!paramsMeal[i].value) {
                paramsMeal.splice(i, 1)
                i = i - 1
            } else {
                paramsMeal[i].entity = 'insulin';
                paramsMeal[i].patientId = wx.getStorageSync('patientId');
                paramsMeal[i].date = self.data.dataTime;
                paramsMeal[i].type = '2';
                paramsMeal[i].status = '1';
            }
        }
        if (self.data.DeleteList.length > 0) {
            self.DeleteInsulinPump()
        }
        var begin = [];
        var over = [];
        let params = []
        for (const t of dosage) {
            begin.push(t.timeStart)
            over.push(t.timeEnd)
            if (!t.timeStart && !t.timeEnd && !t.value) {
                params = paramsMeal
            } else {
                if (!t.timeStart) {
                    wx.showToast({
                        title: '请选择开始时间',
                        icon: 'none',
                        duration: 2000
                    })
                    return false;
                } else if (!t.timeEnd) {
                    wx.showToast({
                        title: '请选择结束时间',
                        icon: 'none',
                        duration: 2000
                    })
                    return false;
                } else if (!t.value) {
                    wx.showToast({
                        title: '请输入剂量',
                        icon: 'none',
                        duration: 2000
                    })
                    return false;
                }
                params = paramsMeal.concat(dosage);

            }
        }
        // return
        if (self.compareDate(begin, over)) {
            if (params.length == 0) {
                wx.showToast({
                    title: "请输入数据",
                    icon: 'none',
                    duration: 2000
                })
                return false;
            } else {
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
            }
        }


    },
    getInsulinPump(date) {
        let self = this
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
            console.log(res);
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                let NewMeal = self.data.MealArray
                let NewDosage = self.data.dosageArray
                let Meal = deepCopy(self.data.MealArray)
                let Dosage = deepCopy(self.data.dosageArray)
                let DelList = self.data.DeleteList;
                if (date) {
                    for (const k in Meal) {
                        if (Meal[k].rowMd5 && Meal[k].id) {
                            DelList.push({
                                entity: 'insulin',
                                id: Meal[k].id,
                                rowMd5: Meal[k].rowMd5
                            });
                        }
                    }
                    for (const s in Dosage) {
                        if (Dosage[s].rowMd5 && Dosage[s].id) {
                            DelList.push({
                                entity: 'insulinPump',
                                id: Dosage[s].id,
                                rowMd5: Dosage[s].rowMd5
                            });
                        }
                    }
                } else {
                    DelList = []
                }
                for (const key in ResData.items1) {
                    if (date) {

                        if (ResData.items1[key].rowMd5) {
                            delete ResData.items1[key].rowMd5
                        }
                        if (ResData.items1[key].id) {
                            delete ResData.items1[key].id
                        }
                    }
                }
                ResData.items1.sort(sortFun(`periodCode`))
                if (ResData.items2.length > 0) {
                    for (const key in ResData.items2) {
                        if (date) {
                            if (ResData.items2[key].rowMd5) {
                                delete ResData.items2[key].rowMd5
                            }
                            if (ResData.items2[key].id) {
                                delete ResData.items2[key].id
                            }
                        }
                    }
                    NewDosage = ResData.items2
                } else {
                    NewDosage = [{
                        entity: "insulinPump",
                        patientId: wx.getStorageSync('patientId'),
                        date: self.data.dataTime,
                        type: 2,
                        status: 1,
                        id: null,
                        rowMd5: null,
                        timeStart: '',
                        timeEnd: '',
                        value: ''
                    }]
                }
                self.setData({
                    MealArray: ResData.items1,
                    dosageArray: NewDosage,
                    DeleteList: DelList,
                    mealItem: ResData.items1,
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
            if (res.data.code === '0') {} else {
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
        NewData.value = e.detail.date;
        this.setData({
            dateObj: NewData,
            dataTime: dateSelect
        })
        this.getInsulin()
        this.getInsulinPump()
        // if (this.data.TabsIndex == 0) {
        //     this.getInsulin()
        // } else if (this.data.TabsIndex == 1) {
        //     this.getInsulinPump()
        // }
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
        let arr = this.data.dosageArray
        let flag = false;
        let times = ''
        const keys = ['timeStart', 'timeEnd', 'value']
        for (const data of arr) {
            for (const key of keys) {
                const value = data[key]
                if (value === undefined) {
                    flag = true;
                    break;
                } else if (value.trim() === "") {
                    flag = true;
                    break
                }
                times = data.timeEnd
            }
        }
        if (flag) {
            wx.showToast({
                icon: 'none',
                title: '上一组数据各项不能为空',
                duration: 2000
            })
            return
        }
        // let curTime = 0
        // let hour = times.split(":")[0]
        // let min = times.split(":")[1]
        // curTime = Number(hour * 3600000) + Number(min * 60000)
        // let timeStart = new Date(this.data.dataTime + " " + arr[arr.length - 1].timeEnd)
        // timeStart.setMinutes(timeStart.getMinutes() + 1);
        // timeStart = formatTime(timeStart).substr(0, 5)
        // let timeStart = this.secTotime(curTime)

        let timeStart = times;

        arr.push({
            entity: "insulinPump",
            patientId: wx.getStorageSync('patientId'),
            date: this.data.dataTime,
            type: 2,
            status: 1,
            id: '',
            rowMd5: '',
            timeStart: timeStart,
            timeEnd: '',
            value: ''
        })
        this.setData({
            dosageArray: arr,
        })
    },
    secTotime(s) {
        var t
        if (s > -1) {
            s = s + 60000
            var hour = Math.floor(s / 3600000)
            var min = Math.floor(s / 60000) % 60
            var sec = s % 6000
            if (hour < 10) {
                t = '0' + hour + ":"
            } else {
                t = hour + ":"
            }
            if (min < 10) {
                t += "0"
            }
            t += min
        }
        return t
    },
    bindMealValueInput(e) {
        let self = this
        let {
            code,
            rowmd5,
            id
        } = e.target.dataset
        let val = e.detail.value;

        var newArr = self.data.MealArray
        let codeArr = []
        newArr.forEach(item => {
            codeArr.push(item.periodCode)
        })
        let key = codeArr.indexOf(code)
        if (codeArr.includes(code)) {
            newArr[key].value = val
            newArr[key].periodCode = code
            newArr[key].rowMd5 = rowmd5
            newArr[key].id = id
            if (!newArr[codeArr.indexOf(code)].value) {
                if (id && rowmd5) {
                    let NewList = self.data.DeleteList
                    NewList.push({
                        entity: "insulin",
                        id: id,
                        rowMd5: rowmd5,
                    })
                    self.setData({
                        DeleteList: NewList
                    })
                }
                newArr.splice(codeArr.indexOf(code), 1)
                codeArr.splice(codeArr.indexOf(code), 1)
            }
        } else {
            newArr.push({
                entity: "insulin",
                patientId: wx.getStorageSync('patientId'),
                date: self.data.dataTime,
                type: 2,
                status: 1,
                id: id,
                rowMd5: rowmd5,
                periodCode: code,
                value: val
            })
        }

        this.setData({
            MealArray: newArr
        })
    },
    //时间选择器
    bindStartTimeChange: function (e) {
        let index = Number(e.target.dataset.index)
        let newArray = this.data.dosageArray
        let val = e.detail.value;
        if (newArray[index].timeEnd) {
            if (contrastTime(val, newArray[index].timeEnd)) {
                newArray[index].timeStart = val
                this.setData({
                    dosageArray: newArray
                })
            }
        } else {
            newArray[index].timeStart = val
            this.setData({
                dosageArray: newArray
            })
        }
    },
    //时间选择器
    bindEndTimeChange: function (e) {
        let index = Number(e.target.dataset.index)
        let newArray = this.data.dosageArray
        let val = e.detail.value;
        if (newArray[index].timeStart) {
            if (contrastTime(newArray[index].timeStart, val)) {
                newArray[index].timeEnd = val
                this.setData({
                    dosageArray: newArray
                })
            }
        } else {
            newArray[index].timeEnd = val
            this.setData({
                dosageArray: newArray
            })
        }
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
        if (userData[index].periodCode !== "99") {
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
        const {
            index,
            type
        } = e.target.dataset
        let userData = this.data.userData
        if (type == "other") {
            userData[index].periodOtherValue = e.detail.value
        } else {
            userData[index].value = e.detail.value
        }
        this.setData({
            userData
        })
    },
    addRecordList: function () {
        let userData = this.data.userData;
        let flag = false;
        const keys = ['periodValue', 'categoryValue', 'value']
        for (const data of userData) {
            for (const key of keys) {
                const value = data[key]
                if (value === undefined) {
                    flag = true;
                    break;
                } else if (value.trim() === "") {
                    flag = true;
                    break
                }
            }
        }
        if (flag) {
            wx.showToast({
                icon: 'none',
                title: '上一组数据各项不能为空',
                duration: 2000
            })
            return
        }
        userData.push({
            periodCode: '',
            periodOtherValue: '',
            categoryCode: '',
            value: ''
        });
        this.setData({
            userData
        });
    },
    delRecordList(e) {
        const {
            index,
            id,
            rowmd5
        } = e.currentTarget.dataset;
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
            GA: gestationalWeek,
        })
        this.getInsulin()
        this.getInsulinPump()
    },
})