import * as echarts from '../../components/ec-canvas/echarts';
const app = getApp();
const gas = []
const days = []
for (let i = 0; i <= 40; i++) {
    gas.push(i + '周')
}

//<<<<<<< HEAD
const {
    getDay,
    checkTime
} = require("../../utils/util")
const moment = require('../../utils/moment.min.js');

let newDate = moment(getDay(0)).format('YYYY年MM月DD日')
var StarDATE = moment(getDay(-7)).format('YYYY年MM月DD日');
var EndDATE = newDate
for (let i = 0; i <= 6; i++) {
    days.push(i + '天')
}
const {
    promiseRequest
} = require("../../utils/Requests")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ec: {},

        TimeObj: {
            StartDt: newDate,
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
            dateStart: getDay(-7),
            dateEnd: getDay(0),
        },
        selectedIndex: 0,
        convention: true,
        GaShow: false,
        InsulinPump: false,
        selectedByGA: true,
        index: 1,
        gas,
        GA: '',
        predays: [gas],
        InsulinList: [],
        InsulinPumpList: [],
        legendList: [],
        tagList: [],
        selectedTagList: ['0'],
        InsulinListByWeek:[]
    },
    getInsulinPumpList() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getInsulinPumpList",
                "data": [{}]
            }
        }).then(res => {
            console.log(res, "胰岛素泵");
            if (res.data.code === '0') {
                self.setData({
                    InsulinPumpList: res.data.data,
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
    getInsulinList() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getInsulinList",
                "data": [{}]
            }
        }).then(res => {
            console.log(res, "常规列表");
            if (res.data.code === '0') {
                self.setData({
                    InsulinList: res.data.data,
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
    getInsulinListByWeek() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getInsulinListByWeek",
                "data": [{}]
            }
        }).then(res => {
            console.log(res, "孕周");
            if (res.data.code === '0') {
                self.setData({
                    InsulinListByWeek: res.data.data,
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
    bindChange(e) {
        const val = e.detail.value
        this.setData({
            GA: val[0],
        })
        this.getInsulinChartByWeek();
    },
    toggleType(e) {
        this.setData({
            index: e.currentTarget.dataset.index

        })
        if (this.data.index == '1') {
            this.setData({
                convention: true,
                GaShow: false,
                InsulinPump: false,
            })
            this.getInsulinList()
        } else if (this.data.index == '2') {
            this.setData({
                InsulinPump: true,
                convention: false,
                GaShow: false,
            })
            this.getInsulinPumpList()
        } else {
            this.setData({
                convention: false,
                GaShow: true,
                InsulinPump: false,
            })
        }
    },
    handleTitleChange(e) {
        const {
            index
        } = e.detail;
        if (index === 1) {
            this.getInsulinChartByWeek()
        }
        this.setData({
            selectedIndex: index,
            selectedByGA: true
        })
    },
    bindCurrentShowGA() {
        this.setData({
            selectedByGA: true,
        })
        this.getInsulinChartByWeek()
    },
    bindCurrentShowDate() {
        this.setData({
            selectedByGA: false,
        })
        this.getInsulinChartByDate()
    },
    getInsulinChartByWeek() {
        let tags = [];
        for (const item of this.data.selectedTagList) {
            tags.push({
                code: item
            })
        }
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getInsulinChartByWeek",
                "data": [{
                    "gestationalWeek": this.data.GA,
                    "tags": tags
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

                let tagList = res.data.data[0].tags.sort((a, b) => {
                    return a.sequence - b.sequence
                })

                this.setData({
                    legendList: res.data.data[0].legend,
                    tagList
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
    getInsulinChartByDate() {
        let tags = [];
        for (const item of this.data.selectedTagList) {
            tags.push({
                code: item
            })
        }
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getInsulinChartByDate",
                "data": [{
                    "dateStart": this.data.TimeObj.dateStart,
                    "dateEnd": this.data.TimeObj.dateEnd,
                    "tags": tags
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

                let tagList = res.data.data[0].tags.sort((a, b) => {
                    return a.sequence - b.sequence
                })

                this.setData({
                    legendList: res.data.data[0].legend,
                    tagList
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
    init_echarts(option) {
        this.echartsComponent.init((canvas, width, height) => {
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
    selectTag(e) {
        const code = e.currentTarget.dataset.code
        let selectedTagList = this.data.selectedTagList
        let index = selectedTagList.findIndex((x) => {
            return x === code
        })

        if (index === -1) {
            selectedTagList.push(code)
        } else {
            selectedTagList.splice(index, 1)
        }

        if (this.data.selectedByGA) {
            this.getInsulinChartByWeek()
        } else {
            this.getInsulinChartByDate()
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
                TimeObj: NewData,
                CurrentShowDate: false,
                selectedByGA: false
            })
            this.getInsulinChartByDate()
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
                TimeObj: NewData,
                CurrentShowDate: false,
                selectedByGA: false
            })
            this.getInsulinChartByDate()
        }

    },
    tapHandle() {
        this.setData({
            selectedByGA: true
        })
        return false
    },
    onLoad: function (options) {
        this.setData({
            GA: options.GA
        })
        this.echartsComponent = this.selectComponent('#mychart-dom-scatter');
        this.getInsulinList()
        this.getInsulinPumpList()
        this.getInsulinListByWeek()
    }
})