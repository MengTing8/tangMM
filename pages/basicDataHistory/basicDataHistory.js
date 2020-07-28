import * as echarts from '../../components/ec-canvas/echarts';
const {
    request
} = require("../../utils/request")
const {
    checkTime,
    getDay
} = require("../../utils/util")
const moment = require('../../utils/moment.min.js');
// let date = getDates(1, new Date());
let newDate = moment(getDay(0)).format('YYYY年MM月DD日')
var StarDATE = moment(getDay(-7)).format('YYYY年MM月DD日');
var EndDATE = newDate
var rpx;
var rpxs;
var arr = []
//获取屏幕宽度，获取自适应单位

wx.getSystemInfo({

    success: function (res) {
        rpxs = res.windowWidth / 375;
        if (res.windowWidth == 375) {
            rpx = "10%"
        } else if (res.windowWidth == 414) {
            rpx = "10%"
        } else if (res.windowWidth == 320) {
            rpx = "32%"
        }

    },

})

Page({

    /**
     * 页面的初始数据
     */
    data: {
        ec: {
        },
        TimeObj: {
            StartDt: '2020年01月01日',
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
        },
        dateStart: getDay(-7),
        dateEnd:getDay(0),
        TimeObjChart: {
            StartDt: '2020年01月01日',
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
        },
        dateStartChart: getDay(-7),
        dateEndChart:getDay(0),
        selectedIndex: 0,
        listData: [],
        startLength: 0,
        endLength: 0,
        legendList: []
    },
    //取图表
    getBaseChart() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getBaseChart",
                "data": [{
                    "dateStart": self.data.dateStartChart,
                    "dateEnd": self.data.dateEndChart
                }]
            }
        }).then(res => {
            if (res.data.code === '0') {
                let color = JSON.parse(res.data.data[0].color);
                let option = JSON.parse(res.data.data[0].option);
                let yAxisLabelValues;
                if (res.data.data[0].yAxisLabelValues !== undefined) {
                    yAxisLabelValues = JSON.parse(res.data.data[0].yAxisLabelValues);
                }
                for (var i = 0; i < color.length; i++) {
                    if (color[i].length > 1) {
                        option.series[i].itemStyle.color = (o) => { return color[o.seriesIndex][o.dataIndex]; };
                    }
                }
                if (yAxisLabelValues !== undefined && yAxisLabelValues.length > 0) {
                    option.yAxis.axisLabel = {
                        formatter: function (v, i) {
                            return yAxisLabelValues[i];
                        }
                    }
                }
                this.setData({
                    legendList: res.data.data[0].legend
                })
                this.init_echarts(option)
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    //取基础数据历史记录列表
    getBaseList() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getBaseList",
                "data": [{
                    "dateStart": self.data.dateStart,
                    "dateEnd": self.data.dateEnd
                }]
            }
        }).then(res => {
            if (res.data.code === '0') {
                var ResData = res.data.data
                for (let key in ResData) {
                    ResData[key].time = moment(ResData[key].time).format('YYYY/MM/DD')
                }
                 var afterData = []
                 ResData.forEach(item => {
                     let flag = afterData.find(item1 => item1.time === item.time)
                     if (!flag) {
                         afterData.push({
                             time: item.time,
                             origin: [item]
                         })
                     } else {
                         flag.origin.push(item)
                     }
                 })
                self.setData({
                    listData: afterData
                })

                // self.backmusic();

            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
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
                TimeObj: NewData
            })
            this.getBaseList()
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
                TimeObj: NewData
            })
            this.getBaseList()
        }

    },
    bindStartTimeChart(e) {
        var NewData = this.data.TimeObjChart;
        let val = e.detail.value
        let dateStartChart = e.detail.date
        NewData.StarDATE = val;
        let timeCheck = checkTime(dateStartChart, this.data.dateEndChart)
        if (timeCheck) {
            this.setData({
                dateStartChart,
                TimeObjChart: NewData
            })
            this.getBaseChart()
        }

    },
    bindEndTimeChart(e) {
        var NewData = this.data.TimeObjChart;
        let val = e.detail.value
        let dateEndChart = e.detail.date
        NewData.EndDATE = val;
        let timeCheck = checkTime(this.data.dateStartChart, dateEndChart)
        if (timeCheck) {
            this.setData({
                dateEndChart,
                TimeObjChart: NewData
            })
            this.getBaseChart()
        }

    },
    handleTitleChange(e) {
        const {
            index
        } = e.detail;
        this.setData({
            selectedIndex: index
        })
        if (index == 1) {
            this.getBaseChart()
        }
        // this.init_echarts()
    },
    //初始化图表  
    init_echarts: function (options) {
        this.echartsComponent.init((canvas, width, height) => {
            // 初始化图表      
            const Chart = echarts.init(canvas, null, {
                width: width,
                height: height
            });
            Chart.setOption(options);
            // 注意这里一定要返回 chart 实例，否则会影响事件处理等    
            return Chart;
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.echartsComponent = this.selectComponent('#mychart-dom-basicData');
        this.getBaseList()
        this.getBaseChart()
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