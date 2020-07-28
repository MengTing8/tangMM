// pages/historyWeightMa/historyWeightMa.js
import * as echarts from '../../../components/ec-canvas/echarts';
const app = getApp();
const {
    request
} = require("../../../utils/request")
const {
    getDay,
    checkTime
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
// let date = getDates(1, new Date());
let newDate = moment(getDay(0)).format('YYYY年MM月DD日')
var StarDATE = moment(getDay(-7)).format('YYYY年MM月DD日');
var StarDATE2 = moment(getDay(-7)).format('YYYY年MM月DD日');
var EndDATE = newDate
var EndDATE2 = newDate
const gas = []
const days = []
for (let i = 0; i <= 40; i++) {
    gas.push(i + '周')
}

// for (let i = 0; i <= 6; i++) {
//     days.push(i + '天')
// }

Page({

    /**
     * 页面的初始数据
     */
    data: {
        dateStart: getDay(-7),
        dateEnd: getDay(0),
        CurrentShowDate: true,
        // CurrentShowWeek: false,
        TimeObj: {
            StartDt: newDate,
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
        },
        //图标日期
        TimeObjByDate: {
            StartDt: newDate,
            EndDt: '2029年01月01日',
            StarDATE: StarDATE2,
            EndDATE: EndDATE2,
        },
        ec: {
            
        },
        TabsIndex: 0,
        predays: [gas],
        multiIndex: [0, 0],
        gas,
        days,
        GA: 53,
        bmi: '',
        target: '',
        RecordList: []
    },
    bindCurrentShowWeek() {
        this.setData({
            CurrentShowDate: true,
        })
         this.getWeightListByWeek()
    },
    bindCurrentShowDate() {
        this.setData({
            CurrentShowDate: false,
        })
        this.getWeightListByDate()
    },
    bindStartTimeChangeByDate(e) {
        var NewData = this.data.TimeObjByDate;
        let val = e.detail.value
        // val = ;
        NewData.StarDATE = val;
        this.setData({
            TimeObjByDate: NewData

        })

    },
    bindEndTimeChangeByDate(e) {
        var NewData = this.data.TimeObjByDate;
        let val = e.detail.value
        // val = ;
        NewData.EndDATE = val;
        this.setData({
            TimeObjByDate: NewData

        })

    },
    bindStartTimeChange(e) {
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let dateStart = e.detail.date
        NewData.StarDATE = val;
        let timeCheck = checkTime(dateStart, this.data.dateEnd)
        if (timeCheck) {
            this.setData({
                dateStart,
                TimeObj: NewData,
                CurrentShowDate: false,
            })
            this.getWeightListByDate()
        }

    },
    bindEndTimeChange(e) {
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let dateEnd = e.detail.date
        NewData.EndDATE = val;
        let timeCheck = checkTime(this.data.dateStart, dateEnd)
        if (timeCheck) {
            this.setData({
                dateEnd,
                TimeObj: NewData,
                CurrentShowDate: false,
            })
            this.getWeightListByDate()
        }

    },
    getWeightListByDate() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getWeightListByDate",
                "data": [{
                    "dateStart": self.data.dateStart,
                    "dateEnd": self.data.dateEnd
                }]
            }
        }).then(res => {
            console.log(res, "按日期查询");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                for (let key in ResData.items) {
                    ResData.items[key].date = moment(ResData.items[key].date).format('YYYY年MM月DD日')

                }
                self.setData({
                    RecordList: ResData.items,
                    bmi: ResData.bmi,
                    target: ResData.target,
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
    getWeightListByWeek() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getWeightListByWeek",
                "data": [{
                    "gestationalWeek": self.data.GA
                }]
            }
        }).then(res => {
            console.log(res, "孕周");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                for (let key in ResData.items) {
                    ResData.items[key].date = moment(ResData.items[key].date).format('YYYY年MM月DD日')

                }
                self.setData({
                    RecordList: ResData.items,
                    bmi: ResData.bmi,
                    target: ResData.target,
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
    bindExDateChangeA: function (e) {
        this.setData({
            EXDATE: e.detail.value
        })
    },
    bindGAChange(e) {
        const val = e.detail.value
        this.setData({
            GA: this.data.gas[val[0]].replace('周', ''),
        })
        this.getWeightListByWeek()
    },
    TabsChange(e) {
        let index = e.currentTarget.dataset.index
        this.setData({
            TabsIndex: index
        })
    },
    initChart() {
        const option = {
            "title": {

            },
            "xAxis": {
                "data": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11
                ],
                "name": "å­•æœŸ(å‘¨)",
                "type": "category",
                "nameGap": 30,
                "axisLine": {
                    "onZero": true
                },
                "axisTick": {
                    "show": false
                },
                "axisLabel": {
                    "show": true,
                    "showMinLabel": true
                },
                "splitLine": {
                    "show": true
                },
                "boundaryGap": false,
                "nameLocation": "middle"
            },
            "yAxis": {
                "max": 59,
                "min": 56,
                "name": "ä½“é‡(Kg)",
                "nameGap": 20,
                "axisLine": {
                    "onZero": true
                },
                "axisTick": {
                    "show": false
                },
                "axisLabel": {
                    "show": true,
                    "showMinLabel": false
                },
                "splitLine": {
                    "show": false
                },
                "nameRotate": -90,
                "splitNumber": 3,
                "nameLocation": "middle"
            },
            "series": [
                {
                    "data": [
                        56.11,
                        56.22,
                        56.33,
                        56.44,
                        56.56,
                        56.67,
                        56.78,
                        56.89,
                        57,
                        57.11,
                        57.22
                    ],
                    "type": "line",
                    "symbol": "none",
                    "itemStyle": {
                        "color": null
                    },
                    "lineStyle": {
                        "type": "dashed",
                        "color": "gray"
                    },
                    "hoverAnimation": false
                },
                {
                    "data": [
                        "",
                        57,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                    ],
                    "type": "line",
                    "symbol": "circle",
                    "itemStyle": {
                        "color": null
                    },
                    "lineStyle": {
                        "color": "orange"
                    },
                    "symbolSize": 20,
                    "hoverAnimation": false
                },
                {
                    "data": [
                        56.03,
                        56.06,
                        56.08,
                        56.11,
                        56.14,
                        56.17,
                        56.19,
                        56.22,
                        56.25,
                        56.28,
                        56.31
                    ],
                    "type": "line",
                    "symbol": "none",
                    "itemStyle": {
                        "color": null
                    },
                    "lineStyle": {
                        "type": "dashed",
                        "color": "gray"
                    },
                    "hoverAnimation": false
                }
            ],
            "dataZoom": [
                {
                    "type": "inside",
                    "endValue": 10,
                    "filterMode": "empty",
                    "startValue": 0
                }
            ]
        }
        this.echartsComponnet.init((canvas, width, height) => {
            // 初始化图表      
            const Chart = echarts.init(canvas, null, {
                width: width,
                height: height
            });
            Chart.setOption(option);
            // 注意这里一定要返回 chart 实例，否则会影响事件处理等    
            return Chart;
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.echartsComponnet = this.selectComponent('#mychart-dom-weight');
        this.initChart()
        let {
            GA
        } = options
        this.setData({
            GA
        })
        this.getWeightListByWeek()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        var time3 = new Date();
        this.echartsComponnet = this.selectComponent('#mychart-dom-scatter');
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