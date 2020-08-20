const {
    promiseRequest
} = require("../../utils/Requests")
const {
    getPickerValue,
    getAge
} = require('../../utils/util')
const moment = require('../../utils/moment.min.js');
var dateTimePicker = require('../../utils/dateTimePicker.js');
const date = new Date();
const years = [];
//获取年
for (let i = 2008; i <= date.getFullYear() + 5; i++) {
    // years.push(i + '年');
    years.push(i);
}
Page({
    /**
     * 页面的初始数据
     */
    data: {
        SwitchMusic: false,
        years: years,
        pickerIndex: 12,
        PatientData: {},
        BMI: '',
        suggestion: '',
        PatientWeight: '',
        PatientHeight: '',
        PatientAge: 0, //年龄
        dateBirth: '', //出生日期
        date: '2018-10-01',
        time: '12:00',
        dateTimeArray: null,
        dateTime: null,
        startYear: 1900,
        endYear: 2050,
        StartDt: '2018年01月01日',
        EndDt: '2029年01月01',
        EXDATE: '2018年01月01日',
        LMP: '',
        parityList: [{
            Name: '0',
        }, {
            Name: '1',
        }, {
            Name: '2',
        }, {
            Name: '3',

        }, {
            Name: '4',

        }, {
            Name: '5',

        }],
        gravidityList: [{
            Name: '0',
        }, {
            Name: '1',
        }, {
            Name: '2',
        }, {
            Name: '3',

        }, {
            Name: '4',

        }, {
            Name: '5',

        }, {
            Name: '6',

        }, {
            Name: '7',

        }, {
            Name: '8',

        }, {
            Name: '9',

        }, {
            Name: '10',

        }],
        TermList: [],
        stageCode: "",
        embryoNum: [{
            Name: '单胎',
        }, {
            Name: '双胎',
        }, {
            Name: '三胎',
        }],
        professionList: [],
        dateList: years
    },
    //保存个人信息
    saveMyinfo() {
        let self = this
        let PatientData = this.data.PatientData
        if (PatientData.diabetesB4Gestation == 0) {
            PatientData.diabetesYearB4Gestation = ''
            PatientData.diabetesTypeB4GestationCode = ""

        } else if (PatientData.gdm == 0) {
            PatientData.gdmYear = ''
        }
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "save",
                "data": [{
                    "entity": "patient",
                    "id": PatientData.id,
                    "rowMd5": PatientData.rowMd5,
                    "cardNumber": PatientData.cardNumber,
                    "birthday": PatientData.birthday,
                    "gdmTypeCode": 2,
                    "stageCode": +PatientData.stageCode,
                    "tall": +self.data.PatientHeight,
                    "weight": +self.data.PatientWeight,
                    "bmi": +self.data.BMI,
                    // "gainWeight": null, //增重目标
                    "gravidity": +PatientData.gravidity, //孕次
                    "parity": +PatientData.parity, //产次
                    "numberOfFetus": +PatientData.numberOfFetus, //胎数
                    "deliveryLastTime": PatientData.deliveryLastTime, //末次分娩时间
                    "occupationCode": +PatientData.occupationCode, //职业
                    "ogtt_0": Number(PatientData.ogtt_0),
                    "ogtt_1": Number(PatientData.ogtt_1),
                    "ogtt_2": Number(PatientData.ogtt_2),
                    "hba1c": Number(PatientData.hba1c),
                    "lmp": PatientData.lmp,
                    "diabetesB4Gestation": PatientData.diabetesB4Gestation,
                    "diabetesYearB4Gestation": PatientData.diabetesYearB4Gestation,
                    "diabetesTypeB4GestationCode": PatientData.diabetesTypeB4GestationCode,
                    "gdm": PatientData.gdm,
                    "gdmYear": PatientData.gdmYear,
                    "diabeticFamilyHistory": PatientData.diabeticFamilyHistory,
                    "status": 1
                }]
            }
        }).then(res => {
            if (res.data.code === '0') {
                wx.showToast({
                    title: res.data.message,
                    duration: 2000
                })
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1 //想要返回的层级
                    })
                }, 1000)
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    bindFamilyChange(e) {
        let {
            code
        } = e.currentTarget.dataset
        let PatientData = this.data.PatientData
        PatientData.diabeticFamilyHistory = code
        this.setData({
            PatientData,
        });
    },
    bindGdmYearChange(e) {
        var val = e.detail.value
        let PatientData = this.data.PatientData
        PatientData.gdmYear = this.data.dateList[val]
        this.setData({
            PatientData,
        });
    },
    bindGdmChange(e) {
        let {
            code
        } = e.currentTarget.dataset
        let PatientData = this.data.PatientData
        PatientData.gdm = code
        this.setData({
            PatientData,
        });
    },
    bindDiabetesTypeChange(e) {
        let {
            code
        } = e.currentTarget.dataset
        let PatientData = this.data.PatientData
        PatientData.diabetesTypeB4GestationCode = code
        this.setData({
            PatientData,
        });
    },
    bindDiabetesYearChange(e) {
        var val = e.detail.value
        let PatientData = this.data.PatientData
        PatientData.diabetesYearB4Gestation = this.data.years[val]
        this.setData({
            PatientData,
        });
    },
    //是否有糖尿病
    tapDiabetes(e) {
        let {
            code
        } = e.currentTarget.dataset
        let PatientData = this.data.PatientData
        PatientData.diabetesB4Gestation = code

        this.setData({
            PatientData,
        });
    },
    bindLMPChange(e) {
        var val = e.detail.value
        let PatientData = this.data.PatientData
        PatientData.lmp = val
        this.setData({
            PatientData,
            LMP: moment(val).format('YYYY年MM月DD日')
        });

    },
    bindOgtt_0Input: function (e) {
        let PatientData = this.data.PatientData
        PatientData.ogtt_0 = e.detail.value
        this.setData({
            PatientData
        })
    },
    bindOgtt_1Input: function (e) {
        let PatientData = this.data.PatientData
        PatientData.ogtt_1 = e.detail.value
        this.setData({
            PatientData
        })
    },
    bindOgtt_2Input: function (e) {
        let PatientData = this.data.PatientData
        PatientData.ogtt_2 = e.detail.value
        this.setData({
            PatientData
        })
    },
    bindHba1cInput: function (e) {
        let PatientData = this.data.PatientData
        PatientData.hba1c = e.detail.value
        this.setData({
            PatientData
        })
    },
    bindOccupationChange(e) {
        let PatientData = this.data.PatientData
        var val = e.detail.value
        PatientData.occupationValue = this.data.professionList[val].value
        PatientData.occupationComment = this.data.professionList[val].level
        PatientData.occupationCode = this.data.professionList[val].code
        this.setData({
            PatientData,
        });
    },
    //获取职业
    getOccupation() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getOccupation",
                "data": []
            }
        }).then(res => {
            if (res.data.code === '0') {
                self.setData({
                    professionList: res.data.data,
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
    //获取我的个人信息
    getPatient() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getPatient",
                "data": []
            }
        }).then(res => {
            console.log(res);
            if (res.data.code === '0') {
                let Data = res.data.data[0]
                let age = ''
                let birthday = ''
                let lmp = ''
                if (Data.birthday) {
                    age = getAge(Data.birthday)
                    birthday = moment(Data.birthday).format('YYYY年MM月DD日')
                } else {
                    age = ''
                    birthday = ''
                }
                if (Data.lmp) {
                    lmp = moment(Data.lmp).format('YYYY年MM月DD日')
                } else {
                    lmp = ''
                }
                let indexs = []
                let arr = self.data.dateTimeArray
                let time = Data.deliveryLastTime
                if (time) {
                    indexs.push(getPickerValue(arr[0], time.substring(0, 4)))
                    indexs.push(getPickerValue(arr[1], time.substring(5, 7)))
                    indexs.push(getPickerValue(arr[2], time.substring(8, 10)))
                    indexs.push(getPickerValue(arr[3], time.substring(11, 13)))
                    indexs.push(getPickerValue(arr[4], time.substring(14, 17)))
                }
                self.setData({
                    dateTime: indexs,
                    pickerIndex: getPickerValue(self.data.years, Data.diabetesYearB4Gestation),
                    PatientData: Data,
                    BMI: Data.bmi,
                    // suggestion: Data.bmiComment,
                    PatientWeight: Data.weight,
                    PatientHeight: Data.tall,
                    dateBirth: birthday,
                    PatientAge: age,
                    professionList: Data.occupationValues,
                    TermList: Data.stageValues,
                    LMP: lmp
                })

                this.calculateBMI()

            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    calculateBMI() {
        var bmi = (parseFloat(this.data.PatientWeight) / ((parseFloat(this.data.PatientHeight) / 100) * (parseFloat(this.data.PatientHeight) / 100))).toFixed(1)
        var theSug = ''
        if (bmi <= 18.4) {
            theSug = '偏瘦'
        } else if (bmi >= 18.5 && bmi <= 24.9) {
            theSug = '正常'
        } else if (bmi >= 25.0 && bmi <= 29.9) {
            theSug = '超重'
        } else if (bmi >= 30) {
            theSug = '肥胖'
        }
        if (isNaN(bmi)) {
            bmi = ''
        }
        this.setData({
            BMI: bmi,
            suggestion: theSug,
        })
    },
    //孕次选择
    bindGravidityChange(e) {
        let PatientData = this.data.PatientData
        var val = e.detail.value
        PatientData.gravidity = this.data.gravidityList[val].Name
        this.setData({
            PatientData,
        });
    },
    //产次
    bindParityChange(e) {
        let PatientData = this.data.PatientData
        var val = e.detail.value
        PatientData.parity = this.data.parityList[val].Name
        this.setData({
            PatientData,
        });
    },
    //胎数
    bindNumberOfFetusChange(e) {
        let PatientData = this.data.PatientData
        var val = e.detail.value
        PatientData.numberOfFetus = +val + 1
        this.setData({
            PatientData,
        });
    },
    //现处阶段
    bindStageChange(e) {
        let PatientData = this.data.PatientData
        var val = e.detail.value
        PatientData.stageCode = this.data.TermList[val].code
        this.setData({
            PatientData,
        });
    },
    bindHeightInput: function (e) {
        this.setData({
            PatientHeight: e.detail.value
        })
        this.calculateBMI()
    },
    bindWeightInput: function (e) {
        if (this.data.PatientHeight == '' || this.data.PatientHeight == '0' || this.data.PatientHeight == null) {
            wx.showToast({
                title: '请输入身高',
                icon: 'none',
                duration: 2000
            })
            this.setData({
                PatientWeight: e.detail.value
            })
        } else {
            this.setData({
                PatientWeight: e.detail.value
            })
            this.calculateBMI()
        }

    },
    bindAgeChange(e) {
        var val = e.detail.value
        let PatientData = this.data.PatientData
        PatientData.birthday = val
        var age = getAge(val)
        this.setData({
            PatientData,
            PatientAge: age,
            dateBirth: moment(val).format('YYYY年MM月DD日')
        });

    },
    changeDateTime(e) {
        this.setData({
            dateTime: e.detail.value
        });
    },
    changeDateTimeColumn(e) {
        let PatientData = this.data.PatientData
        var arr = this.data.dateTime,
            dateArr = this.data.dateTimeArray;
        arr[e.detail.column] = e.detail.value;
        dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

        let times = dateArr[0][arr[0]] + '-' + dateArr[1][arr[1]] + '-' + dateArr[2][arr[2]] + " " + dateArr[3][arr[3]] + ":" + dateArr[4][arr[4]]
        PatientData.deliveryLastTime = times
        this.setData({
            PatientData,
            dateTimeArray: dateArr,
            dateTime: arr
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        this.getPatient()
        // this.getOccupation()
        var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
        this.setData({
            dateTime: obj.dateTime,
            dateTimeArray: obj.dateTimeArray,
        });
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