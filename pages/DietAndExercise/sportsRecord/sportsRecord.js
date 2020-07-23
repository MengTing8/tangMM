const {
    request
} = require("../../../utils/request")
const {
    getDates
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
const tips = { periodCode: "请选择时段", wayCode: "请选择方式", levelCode: "请选择强度", duration:"请输入运动时长"};
let date = getDates(1, new Date());
let newDate = moment(date[0].time).format('YYYY年MM月DD日')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        note: "",
        levelList: [],
        wayList: [],
        periodList: [],
        userData: [{
          "periodCode": "",
          "wayCode": "",
          "levelCode": "",
          "duration": ""
        }],
        dateObj: {
            StartDt: newDate,
            EndDt: '2029年01月01',
            EXDATE: newDate,
            DateSelect: newDate,
            title: "记录时间"
        },
        dataTime: date[0].time,
        ShowInfo: false,
        delList: []
    },
    saveExercise() {
        if(this.data.delList.length>0) {
          console.log(0)
          this.delExercise();
        }

        let userData = this.data.userData;
        let data = [];
        for(let i=0;i<userData.length;i++) {
            for(const key in userData[i]) {
              const item = userData[i][key]
              if(!item && item !== 0) {
                wx.showToast({
                  title: tips[key],
                  icon: 'none',
                  duration: 2000
                })
                return false;
              }
            }    
        }

        for(let i=0;i<userData.length;i++) {
          userData[i].entity = 'exercise',
          userData[i].patientId = wx.getStorageSync('patientId');
          userData[i].date = this.data.dataTime;
          userData[i].status = '1';
        }
        
        request({
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
      request({
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
        request({
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
            console.log(res, "获取运动记录");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                self.setData({
                    wayList: ResData.wayValues,
                    levelList: ResData.levelValues,
                    periodList: ResData.periodValues,
                    wayCode: ResData.wayCode,
                    periodCode: ResData.periodCode,
                    userData: ResData.items ? ResData.items : this.data.userData
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
        request({
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
            console.log(res);
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                self.setData({
                    note: ResData.note,
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
        const index = Number(e.target.dataset.index)
        let userData = this.data.userData
        userData[index].duration = e.detail.value
        this.setData({
            userData
        })
    },
    bindLevelChange(e) {
        const index = Number(e.target.dataset.index)
        let userData = this.data.userData
        var val = e.detail.value
        userData[index].levelCode = this.data.levelList[val].code
        userData[index].levelValue = this.data.levelList[val].value
        this.setData({
            userData
        });
    },
    bindWayChange(e) {
        const index = Number(e.target.dataset.index);
        let userData = this.data.userData
        var val = e.detail.value
        userData[index].wayCode = this.data.wayList[val].code
        userData[index].wayValue = this.data.wayList[val].value
        this.setData({
            userData
        });
    },
    bindPeriodChange(e) {
        const index = Number(e.target.dataset.index);
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
        "periodCode": "",
        "wayCode": "",
        "levelCode": "",
        "duration": ""
      });
      this.setData({
        userData
      });
    },
    delRecordList(e) {
      const {index,id,rowmd5} = e.currentTarget.dataset;
      let userData = this.data.userData;
      userData.splice(index, 1);
      if(id && rowmd5) {
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