const {
    promiseRequest
} = require("../../../utils/Requests")
const {
    getDates,
    deepCopy
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
let date = getDates(1, new Date());
let newDate = moment(date[0].time).format('YYYY年MM月DD日')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        gestationalWeek: '',
        fetusWeightList: [],
        numberOfFetus: "1", //胎数
        fetus: '1', // '0'单胎，'1'双胎
        // rowMd5: "",
        // id: "",
        // BPD: '',
        // HC: '',
        // AC: '',
        // FL: '',
        dateObj: {
            StartDt: newDate,
            EndDt: date[0].time,
            DateSelect: newDate,
            title: "选择时间",
            value: date[0].time
        },
        dataTime: date[0].time,
        dataArr: [],
    },
    radioChange: function (e) {
        let fetus = e.detail.value || this.data.fetus
        this.setData({
            fetus: fetus
        })
    },
    DeleteByDate(e) {
        let date = e.detail.date
        let that = this
        if (that.data.rowMd5 || that.data.BPD) {
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
                                    "entity": "fetusWeight",
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
                                that.getFetusWeight()
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
    saveFetusWeight() {
        let self = this
        let dataArr = self.data.dataArr
        let params = deepCopy(dataArr)
        for (let i = 0; i < params.length; i++) {
            params[i].entity = 'fetusWeight';
            params[i].patientId = wx.getStorageSync('patientId');
            params[i].date = self.data.dataTime;
            params[i].status = '1';
            params[i].gestationalWeek = self.data.gestationalWeek;
        }
        for (let i = 0; i < params.length; i++) {
                if (params[i].biparietalDiameter || params[i].headCircumference
                || params[i].abdorminalCircumference || params[i].femurLength) {
                      if (isNaN(parseFloat(params[i].biparietalDiameter)) || params[i].biparietalDiameter > 110 || params[i].biparietalDiameter < 0) {
                          wx.showToast({
                              title: '双顶径(BPD):请输入0-110的值',
                              icon: 'none',
                              duration: 2000
                          })
                          return
                      }
                      if (isNaN(parseFloat(params[i].headCircumference)) || params[i].headCircumference > 400 || params[i].headCircumference < 0) {
                          wx.showToast({
                              title: '头围(HC):请输入0-400的值',
                              icon: 'none',
                              duration: 2000
                          })
                          return
                      }
                      if (isNaN(parseFloat(params[i].abdorminalCircumference)) || params[i].abdorminalCircumference > 450 || params[i].abdorminalCircumference < 0 || params[i].abdorminalCircumference === '') {
                          wx.showToast({
                              title: '腹围(AC):请输入0-450的值',
                              icon: 'none',
                              duration: 2000
                          })
                          return
                      }
                      if (isNaN(parseFloat(params[i].femurLength)) || params[i].femurLength > 90 || params[i].femurLength < 0 || params[i].femurLength === '') {
                          wx.showToast({
                              title: '股骨长(FL):请输入0-90的值',
                              icon: 'none',
                              duration: 2000
                          })
                          return
                      }
                }else{
                    params.splice(i,1)
                }
        }
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "save",
                "data": params
                // "data": [{
                //     "entity": "fetusWeight",
                //     "patientId": wx.getStorageSync('patientId'),
                //     "date": self.data.dataTime,
                //     "gestationalWeek": '53',
                //     "fetus": self.data.fetus,
                //     "id": self.data.id,
                //     "rowMd5": fetus,
                //     "biparietalDiameter": self.data.BPD,
                //     "headCircumference": self.data.HC,
                //     "abdorminalCircumference": self.data.AC,
                //     "femurLength": self.data.FL,
                //     "status": "1"
                // }]
            }
        }).then(res => {
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                self.setData({
                    rowMd5: ResData.rowMd5,
                    id: ResData.id,
                })
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
                self.getFetusWeight()

            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    getFetusWeight() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getFetusWeight",
                "data": [{
                    "date": self.data.dataTime,
                    "fetus": self.data.fetus
                }]
            }
        }).then(res => {
            console.log(res, "获取胎儿体重");
            if (res.data.code === '0') {
                let arr = self.data.dataArr

                if (res.data.data.length > 0) {
                    var ResData = res.data.data[0]
                    let newObj = self.data.dateObj
                    newObj.DateSelect = moment(ResData.date).format('YYYY年MM月DD日')
                    arr[self.data.fetus - 1].biparietalDiameter = ResData.biparietalDiametger
                    arr[self.data.fetus - 1].headCircumference = ResData.headCircumference
                    arr[self.data.fetus - 1].abdorminalCircumference = ResData.abdorminalCircumference
                    arr[self.data.fetus - 1].femurLength = ResData.femurLength
                    arr[self.data.fetus - 1].id = ResData.id
                    arr[self.data.fetus - 1].rowMd5 = ResData.rowMd5
                    arr[self.data.fetus - 1].fetus = ResData.fetus

                    self.setData({
                        dateObj: newObj,
                        rowMd5: ResData.rowMd5,
                        id: ResData.id,
                        dataArr: arr
                    })
                } else {
                    arr[self.data.fetus - 1] = {
                        // rowMd5: '',
                        // id: '',
                        biparietalDiameter: '',
                        headCircumference: '',
                        abdorminalCircumference: '',
                        femurLength: '',
                    }
                    self.setData({
                        // dateObj: newObj,
                        rowMd5: '',
                        id: '',
                        dataArr: arr
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
    },
    bindDateChange(e) {
        var NewData = this.data.dateObj;
        let val = e.detail.value
        let dateSelect = e.detail.date
        NewData.value = e.detail.date;
        NewData.DateSelect = val;
        this.setData({
            dateObj: NewData,
            dataTime: dateSelect
        })
        this.getFetusWeight()
    },
    bindBPDInput(e) {
        var data = e.detail.value;
        var index = e.currentTarget.dataset.index;
        let arr = this.data.dataArr
        arr[index].biparietalDiameter = data
        this.setData({
            dataArr: arr
        })
    },
    bindHCInput(e) {
        var data = e.detail.value;
        var index = e.currentTarget.dataset.index;
        let arr = this.data.dataArr
        arr[index].headCircumference = data
        this.setData({
            dataArr: arr
        })
    },
    bindACInput(e) {
        var data = e.detail.value;
        var index = e.currentTarget.dataset.index;
        let arr = this.data.dataArr
        arr[index].abdorminalCircumference = data
        this.setData({
            dataArr: arr
        })
    },
    bindFLInput(e) {
        var data = e.detail.value;
        var index = e.currentTarget.dataset.index;
        let arr = this.data.dataArr
        arr[index].femurLength = data
        arr[index].fetus = String(index + 1)
        this.setData({
            dataArr: arr
        })
    },
    historyRecord() {
        wx.navigateTo({
            url: '../fetalWeight/fetalWeight?numberOfFetus=' + this.data.numberOfFetus
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this
        that.setData({
            numberOfFetus: options.numberOfFetus,
            gestationalWeek: options.gestationalWeek
        })
        let num = Number(options.numberOfFetus)
        for (let i = 0; i < num; i++) {
            that.data.dataArr.push({
                // rowMd5: '',
                // id: '',
                biparietalDiameter: '',
                headCircumference: '',
                abdorminalCircumference: '',
                femurLength: '',
            })
        }
        that.setData({
            dataArr: that.data.dataArr
        })
        this.getFetusWeight()
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