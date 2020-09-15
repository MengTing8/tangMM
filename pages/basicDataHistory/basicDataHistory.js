import * as echarts from '../../components/ec-canvas/echarts';
import * as base64 from '../../utils/base64.js';
const {
    promiseRequest
} = require("../../utils/Requests")
const {
    checkTime,
    getDay,
    getPreMonth
} = require("../../utils/util")
const moment = require('../../utils/moment.min.js');
let newDate = moment(getDay(0)).format('YYYY年MM月DD日')
var EndDATE = newDate
var dateStart = getPreMonth(getDay(0))
var StarDATE = moment(dateStart).format('YYYY年MM月DD日');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        ec: {},
        TimeObj: {
            EndDt: getDay(0),
            StarDATE,
            EndDATE,
            dateStart,
            dateEnd: getDay(0),
        },
        dateStart,
        dateEnd: getDay(0),
        selectedIndex: 0,
        listData: [],
        startLength: 0,
        endLength: 0,
        legendList: [],
    },

    //取图表
    getBaseChart() {
        let self = this
        let requestObj = {
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getBaseChart",
                "data": [{
                    "dateStart": self.data.TimeObj.dateStart,
                    "dateEnd": self.data.TimeObj.dateEnd
                }]
            }
        };
        promiseRequest(requestObj).then((res) => {
            if (res.data.code === '0') {
                let color = JSON.parse(res.data.data[0].color);
                let option = JSON.parse(res.data.data[0].option);
                let yAxisLabelValues;
                if (res.data.data[0].yAxisLabelValues !== undefined) {
                    yAxisLabelValues = JSON.parse(res.data.data[0].yAxisLabelValues);
                }
                for (var i = 0; i < color.length; i++) {
                    if (color[i].length > 1) {
                        option.series[i].itemStyle.color = (o) => {
                            return color[o.seriesIndex][o.dataIndex];
                        };
                    }
                }
                if (yAxisLabelValues !== undefined && yAxisLabelValues.length > 0) {
                    option.yAxis.axisLabel = {
                        formatter: function (v, i) {
                            return yAxisLabelValues[i];
                        }
                    }
                }
                let legend = res.data.data[0].legend;
                for (let i = 0; i < legend.length; i++) {
                    let svg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="' + legend[i].symbol.substr(7) + '" fill="' + legend[i].color + '"></path></svg>'
                    svg = unescape(encodeURIComponent(svg));
                    legend[i].symbol = 'data:image/svg+xml;base64,' + base64.btoa(svg);
                }
                this.setData({
                    legendList: legend
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
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getBaseList",
                "data": [{
                    "dateStart": self.data.TimeObj.dateStart,
                    "dateEnd": self.data.TimeObj.dateEnd
                }]
            }
        }).then((res) => {
            if (res.data.code === '0') {
                var ResData = res.data.data
                for (let key in ResData) {
                    ResData[key].time = ResData[key].time ? moment(ResData[key].time).format('YYYY/MM/DD') : ''
                }
                ResData.sort(function (a, b) {
                    return a.time < b.time ? 1 : -1;
                });
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
        if (checkTime(dateStart, NewData.dateEnd)) {
            NewData.StarDATE = val;
            NewData.dateStart = dateStart;
            this.setData({
                TimeObj: NewData
            })
            if (this.data.selectedIndex == 1) {
                this.getBaseChart()
            } else {
                this.getBaseList()

            }
        }
    },
    bindEndTimeChange(e) {
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let dateEnd = e.detail.date
        if (checkTime(NewData.dateStart, dateEnd)) {
            NewData.EndDATE = val;
            NewData.dateEnd = dateEnd;
            this.setData({
                TimeObj: NewData
            })
            if (this.data.selectedIndex == 1) {
                this.getBaseChart()
            } else {
                this.getBaseList()

            }
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
        } else {
            this.getBaseList()
        }
    },
    //初始化图表  
    init_echarts: function (options) {
        this.echartsComponent.init((canvas, width, height) => {
            const Chart = echarts.init(canvas, null, {
                width: width,
                height: height
            });
            Chart.setOption(options);
            return Chart;
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.echartsComponent = this.selectComponent('#mychart-dom-basicData');
        this.getBaseList()
        if (wx.getStorageSync('userType') == '1') {
            wx.setNavigationBarTitle({
                title: '基础数据'
            })
        }
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