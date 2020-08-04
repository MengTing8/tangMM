const {
    promiseRequest
} = require("../../utils/Requests")
const {
    getDates
} = require("../../utils/util")
const moment = require('../../utils/moment.min.js');
let date = getDates(1, new Date());
let newDate = moment(date[0].time).format('YYYY年MM月DD日')
moment.locale();
const tips = {
    periodCode: '请选择时间段类型',
    periodSubcode: '请选择具体时间段',
    periodExtraValue: '请输入具体时间段',
    categoryCode: '请选择测量值类型',
    value: '请输入测量值'
};
Page({
    data: {
        BloodData: [{
            periodCode: '',
            periodSubcode: '',
            periodExtraValue: '',
            categoryCode: '',
            value: ''
        }],
        periodIndex: 0,
        periodValues: [],
        categoryValues: [],
        dateObj: {
            StartDt: newDate,
            EndDt: '2029年01月01',
            EXDATE: newDate,
            DateSelect: newDate,
            title: "记录时间",
            value: date[0].time
        },
        dataTime: date[0].time,
        delList: [],
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
                        "periodCode": BloodData.periodCode || "",
                        "periodSubcode": BloodData.periodSubcode || "",
                        "categoryCode": BloodData.categoryCode || "1"
                    }]
                }
            }).then((res) => {
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                self.setData({
                    BloodData: ResData.items ? ResData.items : [{
                        periodCode: '',
                        periodSubcode: '',
                        periodExtraValue: '',
                        categoryCode: '',
                        value: ''
                    }], 
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
    onSaveBtn(e) {
        let self = this
        let BloodData = self.data.BloodData
        if (this.data.delList.length > 0) {
            this.delBloodGlucose();
        }
        if (BloodData.length === 0) {
            return;
        }
        for (let i = 0; i < BloodData.length; i++) {
            for (const key in BloodData[i]) {
                const item = BloodData[i][key]
                if (key === 'periodExtraValue' && BloodData[i].periodSubcode !== "99") {
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

        for (let i = 0; i < BloodData.length; i++) {
            BloodData[i].entity = 'bloodGlucose';
            BloodData[i].patientId = wx.getStorageSync('patientId');
            BloodData[i].date = this.data.dataTime;
            BloodData[i].status = '1';
        }
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
                      categoryValues: ResData.categoryValues,
                      periodValues: ResData.periodValues
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
        })
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
        let val = e.detail.value
        let periodSubvalue;
        BloodData[index].periodValue = this.data.periodValues[val].value,
            BloodData[index].periodCode = this.data.periodValues[val].code
        if (this.data.periodIndex !== val) {
            BloodData[index].periodSubcode = ''
            BloodData[index].periodSubvalue = ''
        }
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
        let val = e.detail.value
        BloodData[index].categoryValue = this.data.categoryValues[val].value
        BloodData[index].categoryCode = this.data.categoryValues[val].code
        this.setData({
            BloodData
        })
    },
    addRecordList() {
        let BloodData = this.data.BloodData
        BloodData.push({
            periodCode: '',
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