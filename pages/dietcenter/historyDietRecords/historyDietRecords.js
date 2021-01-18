import * as echarts from '../../../components/ec-canvas/echarts';
import * as base64 from '../../../utils/base64.js';
const {
    promiseRequest
} = require("../../../utils/Requests")
const {
    getDay,
    sortFun,
    checkTime, getPreMonth
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
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
        TimeObjChart: {
            EndDt: getDay(0),
            StarDATE,
            EndDATE,
            dateStart,
            dateEnd: getDay(0),
        },
        TimeObj: {
            EndDt: getDay(0),
            StarDATE,
            EndDATE,
            dateStart,
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
    handlePreviewImage(e) {
        const {
            pindex,
            ind,
            d
        } = e.currentTarget.dataset;
        const urls = this.data.historyFootList[ind].items[d].photo.map(v => v.url);
        const current = urls[pindex];
        wx.previewImage({
            current,
            urls
        });
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
            console.log(res);
            if (res.data.code === '0') {
                let ResData = res.data.data
                let newData = []
                let flag
                // let arr = Object.keys(ResData[0]);
                // console.log(arr);
                // if (ResData.length !== 0) {
                    // ResData.forEach((item) => {
                    //     console.log(item);
                    //     item.items.forEach(i => {
                    //         flag = newData.find(item1 => item1.date === i.date)
                    //         if (!flag) {
                    //             newData.push({
                    //                 date: i.date,
                    //                 children: [i]
                    //             })
                    //         } else {
                    //             flag.children.push(i)
                    //         }
                    //     })

                    // })
                    ResData.sort(function (a, b) {
                        return a.date < b.date ? 1 : -1;
                    });
                    for (const key in ResData) {
                        if (ResData[key].items) {
                        ResData[key].items.sort(sortFun(`sequence`))
                        }
                    }
                    _that.setData({
                        historyFootList: ResData,
                    })
                // }else{
                //    
                // }

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
            if (this.data.selectedIndex == 0) {
                this.getDietList()
            } else {
                this.getDietChart()
            }
        }
    },
    bindEndTimeChange(e) {
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let date = e.detail.date
        if (checkTime(NewData.dateStart, date)) {
            NewData.EndDATE = val;
            NewData.dateEnd = date;
            this.setData({
                TimeObj: NewData
            })
            if (this.data.selectedIndex == 0) {
                this.getDietList()
            } else {
                this.getDietChart()
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
            this.getDietChart()
        } else {
            this.getDietList()
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
                    "dateStart": self.data.TimeObj.dateStart,
                    "dateEnd": self.data.TimeObj.dateEnd
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

                for (let data of dataList) {
                    for (let i = 0; i < data.legend.length; i++) {
                        let svg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="' + data.legend[i].symbol.substr(7) + '" fill="' + data.legend[i].color + '"></path></svg>'
                        svg = unescape(encodeURIComponent(svg));
                        data.legend[i].symbol = 'data:image/svg+xml;base64,' + base64.btoa(svg);
                    }
                }

                this.setData({
                    TabsIndex: 0,
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
        if (wx.getStorageSync('userType') == '1') {
            wx.setNavigationBarTitle({
                title: '饮食记录'
            })
        }
    }
})