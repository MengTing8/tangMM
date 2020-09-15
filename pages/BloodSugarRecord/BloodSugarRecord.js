const {
    promiseRequest
} = require("../../utils/Requests")
const {
    getDates, sortFun
} = require("../../utils/util")
const moment = require('../../utils/moment.min.js');
let date = getDates(1, new Date());
let newDate = moment(date[0].time).format('YYYY年MM月DD日')
let app = getApp()
moment.locale();
const tips = {
    periodSubvalue: '请选择时间段',
    periodCode: '请选择时间段类型',
    categoryValue: "请选择测量值类型",
    periodSubcode: '请选择具体时间段',
    periodExtraValue: '请输入具体时间段',
    categoryCode: '请选择测量值类型',
    value: '请输入测量值'
};
Page({
    data: {
        periodCode: '1',
        resBloodData: [],
        TabsIndex: 0,
        tabs: ["常规时间段", "特殊时间段"],
        apiClicked: false,
        BloodData: [{
            periodCode: '1',
            periodSubcode: '',
            periodExtraValue: '',
            categoryCode: '',
            value: ''
        }, {
            periodCode: '2',
            periodSubcode: '',
            periodExtraValue: '',
            categoryCode: '',
            value: ''
        }],
        periodIndex: 0,
        periodValues: [],
        categoryValues: [],
        dateObj: {
            EndDt: date[0].time,
            EXDATE: newDate,
            DateSelect: newDate,
            title: "记录时间",
            value: date[0].time
        },
        dataTime: date[0].time,
        delList: [],
    },
    handleBloodTabs(e) {
        const {
            index,
            code
        } = e.currentTarget.dataset;
        this.setData({
            TabsIndex: index,
            periodCode: code
        })
    },
    DeleteByDate(e) {
        let date = e.detail.date
        let that = this
        if (that.data.BloodData[0].id || that.data.BloodData[0].value) {
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
                                    "entity": "bloodGlucose",
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
                                that.getBloodGlucose()
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
    getBloodGlucose() {
        let self = this
        let BloodData = self.data.BloodData
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getBloodGlucose",
                "data": [{
                    "date": self.data.dataTime,
                    // "periodCode": BloodData.periodCode || "",
                    // "periodSubcode": BloodData.periodSubcode || "",
                    // "categoryCode": BloodData.categoryCode || "1"
                }]
            }
        }).then((res) => {
            if (res.data.code === '0') {
                console.log(res);
                var ResData = res.data.data
                let arr = []
                ResData.forEach(i => {
                    if (i.items) {
                        for (const key in i.items) {
                            arr.push(i.items[key])
                        }
                    }
                });
                arr.sort(sortFun(`sequence`))
                self.setData({
                    resBloodData: res.data.data,
                    BloodData: arr,
                    // periodCode: arr[0].periodCode
                    // categoryValues: ResData.categoryValues,
                    // periodValues: ResData.periodValues
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
    onSaveBtn() {
        let self = this
        let BloodData = self.data.BloodData
        if (this.data.delList.length > 0) {
            this.delBloodGlucose();
        }
        for (let i = 0; i < BloodData.length; i++) {
            for (const key in BloodData[i]) {
                if (BloodData[i].value == '0' && !BloodData[i].categoryValue && !BloodData[i].periodSubvalue) {
                    BloodData.splice(i, 1)
                }
                if (key === 'periodExtraValue' && BloodData[i].periodSubcode !== "99") {
                    continue;
                }
                if (key === 'rowMd5' || key === 'id' || key == 'sequence') {
                    continue;
                }
                let item = ''
                if (BloodData[i]) {
                    item = BloodData[i][key]
                }
                if (!item || item == '0' || item.replace(/\s+/g, '').length === 0) {
                    wx.showToast({
                        title: tips[key],
                        icon: 'none',
                        duration: 2000
                    })
                    return false;
                }
            }
        }

        for (let i = 0; i < BloodData.length; i++) {
            BloodData[i].entity = 'bloodGlucose';
            BloodData[i].patientId = app.globalData.patientId;
            BloodData[i].date = this.data.dataTime;
            BloodData[i].status = '1';
        }
        if (BloodData.length === 0) {
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
            promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "save",
                    "data": BloodData
                }
            }).then((res) => {
                if (res.data.code === '0') {
                    var ResData = res.data.data[0]
                    self.setData({
                        // categoryValues: ResData.categoryValues,
                        // periodValues: ResData.periodValues
                    })
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                    this.getBloodGlucose()
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
                }, 3000);
            })
        }
    },
    delBloodGlucose() {
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "delete",
                "data": this.data.delList
            }
        }).then(res => {
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
    historyRecordBtn(e) {
        wx.navigateTo({
            url: '../historyBloodSugar/historyBloodSugar'
        })

    },
    bindValueInput(e) {
        const index = e.currentTarget.dataset.index
        let BloodData = this.data.BloodData
        BloodData[index].value = e.detail.value
        this.setData({
            BloodData
        })
    },

    bindExtraValueInput: function (e) {
        const index = e.currentTarget.dataset.index
        let BloodData = this.data.BloodData
        BloodData[index].periodExtraValue = e.detail.value
        this.setData({
            BloodData
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
        this.getBloodGlucose()
    },
    bindPeriodChange(e) {
        const index = e.currentTarget.dataset.index
        let BloodData = this.data.BloodData
        console.log(BloodData);
        let TabsIndex = this.data.TabsIndex
        let val = e.detail.value
        // BloodData[index].periodCode = this.data.periodCode
        BloodData[index].periodSubvalue = this.data.resBloodData[TabsIndex].periodSubcodeValues[val].value
        BloodData[index].periodSubcode = this.data.resBloodData[TabsIndex].periodSubcodeValues[val].code
        this.setData({
            periodIndex: val,
            BloodData
        })
    },
    bindPerChildrenChange(e) {
        const index = e.currentTarget.dataset.index
        let BloodData = this.data.BloodData
        let val = e.detail.value
        BloodData[index].periodSubvalue = this.data.periodValues[this.data.periodIndex].children[val].value
        BloodData[index].periodSubcode = this.data.periodValues[this.data.periodIndex].children[val].code
        this.setData({
            BloodData
        })
    },
    bindCategoryChange(e) {
        const index = e.currentTarget.dataset.index
        let BloodData = this.data.BloodData
        let TabsIndex = this.data.TabsIndex
        let val = e.detail.value
        BloodData[index].categoryValue = this.data.resBloodData[TabsIndex].categoryValues[val].value
        BloodData[index].categoryCode = this.data.resBloodData[TabsIndex].categoryValues[val].code
        this.setData({
            BloodData
        })
    },
    // bindCategoryChangeB(e) {
    //     const index = e.currentTarget.dataset.index
    //     let Data = this.data.BloodDataB
    //     let val = e.detail.value
    //     Data[index].categoryValue = this.data.resBloodData[1].categoryValues[val].value
    //     Data[index].categoryCode = this.data.resBloodData[1].categoryValues[val].code
    //     this.setData({
    //         BloodDataB: Data
    //     })
    // },
    addRecordList() {
        let BloodData = this.data.BloodData
        BloodData.push({
            periodCode: this.data.periodCode,
            periodSubcode: '',
            periodExtraValue: '',
            categoryCode: '',
            value: ''
        })
        this.setData({
            BloodData
        })
    },
    delRecordList(e) {
        const {
            index,
            id,
            rowmd5
        } = e.currentTarget.dataset
        let userData = this.data.BloodData;
        userData.splice(index, 1);
        if (id && rowmd5) {
            let delList = this.data.delList;
            delList.push({
                entity: 'bloodGlucose',
                id: id,
                rowMd5: rowmd5
            });
            this.setData({
                delList
            });
        }
        this.setData({
            BloodData: userData
        });
    },
    onLoad: function (options) {
        this.getBloodGlucose()
    }
})