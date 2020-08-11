const {
    promiseRequest
} = require("../../../utils/Requests")
const {
    getAge
} = require('../../../utils/util')
const moment = require('../../../utils/moment.min.js');
let windowHeight
wx.getSystemInfo({
    success: function (res) {
        windowHeight = res.windowHeight
    }
})
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInputConten: '',
        talkContent: [{
            text: '护长，请问资料这样录入有问题吗？',
            isMine: true,
            satrtTime: '2020-02-10  20:20:51',
            headImg: '../../../img/user.png'
        }, {
            text: '护长，请问资料这样录入有问题吗？',
            isMine: true,
            satrtTime: '2020-02-10  20:20:51',
            headImg: '../../../img/user.png'
        }],
        tabs: [{
                "code": "1",
                "value": "项目",
                "sequence": "1"
            },
            {
                "code": "2",
                "value": "留言",
                "sequence": "2"
            },
            {
                "code": "3",
                "value": "基本信息",
                "sequence": "3"
            }
        ],
        TabsIndex: 0,
        ProjectsData: {},
        PatientInfo: {},
        PatientAge: 0,
        suggestion: '',
        scrollHeight: ((windowHeight - 160) * 2) + 'rpx',
        userInputConten: '',
        MessageList: [],
        scrollToView: '',
        NurseId:'',
        patientId: '',
        userType: wx.getStorageSync('userType')
    },
    getMessage() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getMessage",
                "data": [{
                    patientId: self.data.patientId
                }]
            }
        }).then(res => {
            console.log(res);
            if (res.data.code === '0') {
                let ResData = res.data.data[0]
                for (const key in ResData) {
                    ResData[key].createdDateTime = ResData[key].createdDateTime.substring(0, 19)
                }
                if (ResData.length>0) {
                    ResData.sort(function (a, b) {
                        return a.createdDateTime > b.createdDateTime ? 1 : -1;
                    });
                }
                 

                self.setData({
                    MessageList: ResData,
                })
                if (self.data.MessageList.length > 0) {
                    self.setData({
                        scrollHeight: ((windowHeight - 160) * 2) + 'rpx',
                        scrollToView: "msg" + (self.data.MessageList.length - 1),

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
    //
    saveMessage() {
        let self = this
        if (!self.data.userInputConten) {
            wx.showToast({
                title: '请输入信息',
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
                    "data": [{
                        "entity": "message",
                        "patientId": self.data.patientId,
                        "text": self.data.userInputConten,
                        "writtenBy": self.data.NurseId,
                        "status": "1"
                    }]
                }
            }).then(res => {
                console.log(res);
                if (res.data.code === '0') {

                    self.getMessage()
                    self.setData({
                        userInputConten: '',
                        scrollHeight: ((windowHeight - 186) * 2) + 'rpx',
                        // scrollToView: "msg" + (self.data.MessageList.length - 1)
                    })
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        }

    },
    InputMessage(e) {
        let val = e.detail.value
        this.setData({
            userInputConten: val
        })
    },
    getPatient4Nurse() {
        let requestObj = {
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getPatient4Nurse",
                "data": [{
                    "patientId": this.data.patientId
                }]
            }
        };
        promiseRequest(requestObj).then((res) => {
            console.log(res);
            if (res.data.code === '0') {
                let Data = res.data.data[0]
                let age = ''
                if (Data.birthday) {
                    age = getAge(Data.birthday)
                    Data.birthday = moment(Data.birthday).format('YYYY年MM月DD日')
                }
                if (Data.lmp) {
                    age = getAge(Data.birthday)
                    Data.lmp = moment(Data.lmp).format('YYYY年MM月DD日')

                }
                var theSug = ''
                if (Data.bmi <= 18.4) {
                    theSug = '偏瘦'
                } else if (Data.bmi >= 18.5 && Data.bmi <= 24.9) {
                    theSug = '正常'
                } else if (Data.bmi >= 25.0 && Data.bmi <= 29.9) {
                    theSug = '超重'
                } else if (Data.bmi >= 30) {
                    theSug = '肥胖'
                }
                this.setData({
                    PatientInfo: Data,
                    PatientAge: age,
                    suggestion: theSug,
                })
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        }).catch((errMsg) => {
            console.log(errMsg); //错误提示信息
        });
    },
    getMyRecord4Nurse() {
        let requestObj = {
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getMyRecord4Nurse",
                "data": [{
                    "patientId": this.data.patientId
                }]
            }
        };
        promiseRequest(requestObj).then((res) => {
            console.log(res);
            if (res.data.code === '0') {
                this.setData({
                    ProjectsData: res.data.data[0]
                })
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        }).catch((errMsg) => {
            console.log(errMsg); //错误提示信息
        });
    },
    TabsChange(e) {
        let {
            index,
            code
        } = e.detail
        this.setData({
            TabsIndex: index,
            tabCode: code,
        })
        if (index == 2) {
            this.getPatient4Nurse()
        }else if (index==1) {
            this.getMessage()
        }
    },
      RecordInfo(e) {
          let index = e.detail.index
          let userType = this.data.userType
          let gestationalWeek = this.data.ProjectsData.gestationalWeek
          let URL = ''
          if (index == 0) {
              // 胎动监测
              URL = `../FetalMRecord/FetalMRecord?GA=${gestationalWeek}`
          } else if (index == 1) {
              // 基础数据
              URL = '../../basicDataHistory/basicDataHistory?userType=' + userType
          } else if (index == 2) {
              // 妈妈空腹体重
              URL = `../../WeightContent/historyWeightMa/historyWeightMa?GA=${gestationalWeek}&userType=${userType}`
          } else if (index == 3) {
              // 胎儿体重
              URL = '../../WeightContent/fetalWeight/fetalWeight?userType=' + userType
          } else if (index == 4) {
              // 饮食记录
              URL = '../../DietAndExercise/historyDietRecords/historyDietRecords?userType=' + userType
          } else if (index == 5) {
              // 运动记录
              URL = '../../DietAndExercise/historySports/historySports?userType=' + userType
          } else if (index == 6) {
              // 血糖
              URL = '../../historyBloodSugar/historyBloodSugar?userType=' + userType
          } else if (index == 7) {
              // 胰岛素
              URL =`../../historyInsulin/historyInsulin?GA=${gestationalWeek}&userType=${userType}`
          }
          wx.navigateTo({
              url: URL
          })
      },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            patientId: options.patientId,
            NurseId: options.NurseId
        })
         wx.setStorageSync('PatientId', options.patientId)
        this.getMyRecord4Nurse()
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