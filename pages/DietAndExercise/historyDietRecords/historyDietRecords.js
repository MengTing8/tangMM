import * as echarts from '../../../components/ec-canvas/echarts';
const {
    promiseRequest
} = require("../../../utils/Requests")
const {
    getDay,
    getDates,
    checkTime
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
let date = getDates(1, new Date());
let newDate = moment(getDay(0)).format('YYYY年MM月DD日')
var StarDATE = moment(getDay(-7)).format('YYYY年MM月DD日');
var EndDATE = newDate
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ec: {},
        TimeObjChart: {
            StartDt: newDate,
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
            dateStart: getDay(-7),
            dateEnd: getDay(0),
        },
        TimeObj: {
            StartDt: newDate,
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
            dateStart: getDay(-7),
            dateEnd: getDay(0),
        },
        historyFootList: [],
        selectedIndex: 0,
        heatCharts: {},
        startLength: 0,
        endLength: 0,
        TabsIndex: 0,
        tabCharts: ['蛋白质', '碳水化合物', '脂肪'],
        optionList: [],
        legendList1: [],
        legendList2: [],
    },
    getDietList() {
        let _that = this
        promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "getDietList",
                    "data": [{
                        "dateStart": _that.data.TimeObj.dateStart,
                        "dateEnd": _that.data.TimeObj.dateEnd
                    }]
                }
            }).then((res) => {
            if (res.data.code === '0') {
                let ResData = res.data.data
                var newData = []
                let flag
                ResData.forEach((item) => {
                    item.forEach(i => {
                        flag = newData.find(item1 => item1.date === i.date)
                        if (!flag) {
                            newData.push({
                                date: i.date,
                                children: [i]
                            })
                        } else {
                            flag.children.push(i)
                        }
                    })
                })
                _that.setData({
                    historyFootList: newData,
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
    bindStartTimeChart(e) {
        var NewData = this.data.TimeObjChart;
        let val = e.detail.value
        let date = e.detail.date
        if (checkTime(date, NewData.dateEnd)) {
            NewData.StarDATE = val;
            NewData.dateStart = date;
            this.setData({
                TimeObjChart: NewData
            })
            this.getDietChart()
        }
    },
    bindEndTimeChart(e) {
        var NewData = this.data.TimeObjChart;
        let val = e.detail.value
        let date = e.detail.date
        if (checkTime(NewData.dateStart, date)) {
             NewData.EndDATE = val;
             NewData.dateEnd = date;
            this.setData({
                TimeObjChart: NewData
            })
            this.getDietChart()
        }
    },
    bindStartTimeChange(e) {
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let date = e.detail.date
        if (checkTime(date, NewData.dateEnd)) {
              NewData.StarDATE = val;
              NewData.dateStart = date;
            this.setData({
                TimeObj: NewData
            })
            this.getDietList()
        }
    },
    bindEndTimeChange(e) {
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let dgitate = e.detail.date
        if (checkTime(NewData.dateStart, date)) {
             NewData.EndDATE = val;
             NewData.dateEnd = date;
            this.setData({
                TimeObj: NewData
            })
            this.getDietList()
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
            this.getDietChart()
        }
    },
    getDietChart() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getDietChart",
                "data": [{
                    "dateStart": self.data.TimeObjChart.dateStart,
                    "dateEnd": self.data.TimeObjChart.dateEnd
                }]
            }
        }).then(res => {
            if (res.data.code === '0') {
                const dataList = res.data.data;

                dataList.sort((a, b) => {
                    return a.sequence - b.sequence
                })


                let option1 = this.getOption(dataList[0]);
                let option2 = this.getOption(dataList[1]);
                this.setData({
                    optionList: dataList,
                    legendList1: dataList[0].legend,
                    legendList2: dataList[1].legend,
                })
                this.initEnergyECharts(option1)
                this.initOtherECharts(option2)
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },
    initEnergyECharts(options) {
        this.echartsComponentDiet.init((canvas, width, height) => {
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
    initOtherECharts(options) {
        this.echartsComponentDietOther.init((canvas, width, height) => {
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
    handleChartsTabs(e) {
        const {
            index
        } = e.currentTarget.dataset;
        this.setData({
            TabsIndex: index,
            legendList2: this.data.optionList[index + 1].legend
        })
        const option = this.getOption(this.data.optionList[index + 1])
        this.initOtherECharts(option)
    },
    getOption(params) {
        let color = JSON.parse(params.color);
        let option = JSON.parse(params.option);
        let yAxisLabelValues;
        if (params.yAxisLabelValues !== undefined) {
            yAxisLabelValues = JSON.parse(params.yAxisLabelValues);
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
        return option
    },
    onLoad: function (options) {
        this.echartsComponentDiet = this.selectComponent('#mychartDiet');
        this.echartsComponentDietOther = this.selectComponent('#mychartTabs');
        this.getDietList()
    }
})