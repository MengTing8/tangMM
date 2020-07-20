// pages/historyWeightMa/historyWeightMa.js
import * as echarts from '../../../components/ec-canvas/echarts';
const app = getApp();
const {
    request
} = require("../../../utils/request")
const {
    getDates,
    checkTime
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
let date = getDates(1, new Date());
let newDate = moment(date[0].time).format('YYYY年MM月DD日')
var StarDATE = "2020年06日01日"
var StarDATE2 = "2020年06日11日"
var EndDATE = newDate
var EndDATE2 = newDate
const gas = []
const days = []
for (let i = 10; i <= 40; i++) {
    gas.push(i + '周')
}

// for (let i = 0; i <= 6; i++) {
//     days.push(i + '天')
// }

function initChart(canvas, width, height) {
    const chart = echarts.init(canvas, null, {
        width: 440,
        height: 500
    });
    canvas.setChart(chart);
    var option = {
        title: {
            text: '体重'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            bottom: -50,
            //    data: ['正常', '过快', '过慢',]
        },
        grid: {
            left: '3%',
            right: '0%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            axisLine: {
                onZero: false,
                lineStyle: {
                    color: '#999999'
                }
            },
            boundaryGap: false,
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日', '1', '2', '3', '4', '5', '6', ],
            splitLine: {
                show: true,
            },
            axisTick: {
                show: false
            },
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#999999'
                }
            },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false
            }
        },
        series: [{
                name: '邮件营销',
                type: 'line',
                symbolSize: 12,
                lineStyle: {
                    color: '#FEC81E',
                    width: 2,
                    type: 'solid'
                },
                itemStyle: {
                    borderWidth: 16,
                    width: 2,

                    color: '#62D829'
                },
                stack: '总量',
                symbol: '',

                data: [120, 132, 101, 134, 90, 230, 210],
                markLine: {
                    symbol: "none", //去掉警戒线最后面的箭头
                    label: {
                        position: "end", //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
                        formatter: "警戒线"
                    },
                    data: [{
                        silent: false, //鼠标悬停事件  true没有，false有
                        lineStyle: { //警戒线的样式  ，虚实  颜色
                            type: "dashed",
                            color: "#CDCDCD"
                        },
                        name: '警戒线',
                        yAxis: 199
                    }]
                }
            },
            {
                name: '联盟广告',
                type: 'line',
                stack: '总量',
                symbol: '',
                symbolSize: 12,
                lineStyle: {
                    color: '#FEC81E',
                    width: 2,
                    type: 'solid'
                },
                itemStyle: {
                    borderWidth: 16,
                    width: 2,

                    color: 'pink'
                },
                data: [220, 182, 191, 234, 290, 330, 310],
                markLine: {
                    symbol: "none", //去掉警戒线最后面的箭头
                    label: {
                        position: "end", //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
                        formatter: "警戒线"
                    },
                    data: [{
                        silent: false, //鼠标悬停事件  true没有，false有
                        lineStyle: { //警戒线的样式  ，虚实  颜色
                            type: "dashed",
                            color: "#CDCDCD"
                        },
                        name: '警戒线',
                        yAxis: 522
                    }]
                }
            },


        ],
        dataZoom: [{
                show: true,
                id: 'dataZoomX',
                type: 'slider',
                xAxisIndex: [0],
                filterMode: 'none',
                // start: 0,
                // end: 100,
                start: (1 - 6 / 10) * 100,
                handleSize: 8,
                showDetail: true,
                fillerColor: "rgba(167,183,204,0.1)"
                // zoomLock:true,
            },
            // {
            //     id: 'dataZoomY',
            //     type: 'slider',
            //     yAxisIndex: [0],
            //     filterMode: 'empty'
            // }

        ],
    };
    chart.setOption(option);
    //  chart.setOption({
    //      xAxis: {
    //          data: mydate
    //      },
    //      series: {
    //          data: arr,
    //      }
    //  });
    return chart;
}
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dateStart: "2020-06-01",
        dateEnd: date[0].time,
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
            onInit: initChart
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
    },
    bindCurrentShowDate() {
        this.setData({
            CurrentShowDate: false,
        })
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
    bindtouchmove(e) {
        console.log(e)

    },
    getleft(e) {
        console.log(e)
    },
    echartInit(e) {
        initChart(e.detail.canvas, e.detail.width, e.detail.height);
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
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
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