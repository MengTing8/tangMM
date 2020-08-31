const {
    promiseRequest
} = require("../../../utils/Requests")
const {
    getDates
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
const tips = {
    periodCode: '请选择时段',
    wayCode: '请选择方式',
    levelCode: '请选择强度',
    duration: '请输入运动时长'
};
let date = getDates(1, new Date());
let newDate = moment(date[0].time).format('YYYY年MM月DD日')
Page({
    data: {
        texts: "<p>&ensp;&ensp;运动疗法可降低妊娠期基础胰岛素抵抗,是妊娠合并糖尿病的综合治疗措施之一,每餐30分钟后进行中等强度的运动对母儿无不良影响。</p>运动治疗的方法:选择一种低至中等强度的有氧运动(又称耐力运动),主要指由机体大肌肉群参加的持续性运动。步行是常用的简单有氧运动。",
        suggestion: "<p>&ensp;&ensp;每天坚持餐后运动 30 分钟，以中等强度的有氧运动为主，如散步。若您情况不适宜散步可选择上肢运动，如举水瓶。</p>强度以微微出汗为宜，忌过量运动，一般若运动完大汗淋漓或休息 10 分钟仍不能恢复运 动前的心跳则为运动过量。",
        note: "",
        levelList: [],
        wayList: [],
        periodList: [],
        userData: [{
            periodCode: '',
            wayCode: '',
            levelCode: '',
            duration: ''
        }],
        dateObj: {
            StartDt: newDate,
            EndDt: date[0].time,
            DateSelect: newDate,
            title: "记录时间",
            value: date[0].time
        },
        dataTime: date[0].time,
        ShowInfo: false,
        delList: []
    },
    DeleteByDate(e) {
        let date = e.detail.date
        let that = this
        if (that.data.userData[0].periodValue || that.data.userData[0].id) {
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
                                    "entity": "exercise",
                                    "date": date
                                }]
                            }
                        }).then((res) => {
                            console.log(res, "删除");
                            if (res.data.code === '0') {
                                wx.showToast({
                                    title: res.data.message,
                                    icon: 'none',
                                    duration: 3000
                                })
                                that.getExercise()
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
    saveExercise() {
        if (this.data.delList.length > 0) {
            this.delExercise();
        }
        if (this.data.userData.length === 0) {
            return;
        }
        let userData = this.data.userData;
        for (let i = 0; i < userData.length; i++) {
            for (const key in userData[i]) {
                const item = userData[i][key]
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
            userData[i].entity = 'exercise';
            userData[i].patientId = wx.getStorageSync('patientId');
            userData[i].date = this.data.dataTime;
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
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
                this.getExercise()
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    delExercise() {
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
    getExercise() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getExercise",
                "data": [{
                    "date": self.data.dataTime
                }]
            }
        }).then(res => {
            console.log(res);
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                self.setData({
                    texts: ResData.note,
                    suggestion: ResData.suggestion,
                    wayList: ResData.wayValues,
                    levelList: ResData.levelValues,
                    periodList: ResData.periodValues,
                    wayCode: ResData.wayCode,
                    periodCode: ResData.periodCode,
                    userData: ResData.items ? ResData.items : [{
                        periodCode: '',
                        wayCode: '',
                        levelCode: '',
                        duration: ''
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
    getFieldHelp() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getFieldHelp",
                "data": [{
                    "entity": "exercise",
                    "field": "levelCode"
                }]
            }
        }).then(res => {
            if (res.data.code === '0') {
                console.log(res);
                self.setData({
                    note: res.data.data[0].note,
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
    bindDurationInput: function (e) {
        const index = e.target.dataset.index
        let userData = this.data.userData
        userData[index].duration = e.detail.value
        this.setData({
            userData
        })
    },
    bindLevelChange(e) {
        const index = e.target.dataset.index
        let userData = this.data.userData
        var val = e.detail.value
        userData[index].levelCode = this.data.levelList[val].code
        userData[index].levelValue = this.data.levelList[val].value
        this.setData({
            userData
        });
    },
    bindWayChange(e) {
        const index = e.target.dataset.index;
        let userData = this.data.userData
        var val = e.detail.value
        userData[index].wayCode = this.data.wayList[val].code
        userData[index].wayValue = this.data.wayList[val].value
        this.setData({
            userData
        });
    },
    bindPeriodChange(e) {
        const index = e.target.dataset.index;
        let userData = this.data.userData
        var val = e.detail.value
        userData[index].periodCode = this.data.periodList[val].code
        userData[index].periodValue = this.data.periodList[val].value
        this.setData({
            userData,
        });
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
        this.getExercise()
    },
    tapHistory() {
        wx.navigateTo({
            url: '../historySports/historySports'
        })
    },
    strengthInfo() {
        this.getFieldHelp()
        this.setData({
            ShowInfo: true,
        })
    },
    HiedeInfo() {
        this.setData({
            ShowInfo: false,
        })
    },
    addRecordList() {
        let userData = this.data.userData;
        userData.push({
            periodCode: '',
            wayCode: '',
            levelCode: '',
            duration: ''
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
                entity: 'exercise',
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
        this.getExercise()

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