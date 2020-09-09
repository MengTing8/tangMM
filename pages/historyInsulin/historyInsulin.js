import * as echarts from '../../components/ec-canvas/echarts';
import * as base64 from '../../utils/base64';
import regeneratorRuntime from '../../lib/runtime/runtime';
const app = getApp();
const gas = []
const days = []
for (let i = 0; i <= 40; i++) {
    gas.push(i + '周')
}
const {
    getDay,
    checkTime,
    sortFun
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
        multiIndex: [0],
        ec: {},
        TimeObj: {
            StartDt: newDate,
            EndDt: getDay(0),
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
        selectedTagList: [],
        InsulinListByWeek: []
    },
    getInsulinPumpList() {
        let self = this
        return new Promise((resolve, reject) => {
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
                    var ResData = res.data.data
                    ResData.sort(function (a, b) {
                        return a.date < b.date ? 1 : -1;
                    });
                    for (const key in ResData) {
                        const element = ResData[key];
                        if (element.items1) {
                            element.items1.sort(sortFun(`sequence`))
                        }
                    }
                    self.setData({
                        InsulinPumpList: ResData,
                    })
                    resolve(ResData)
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        })
    },
    getInsulinList() {
        let self = this
        return new Promise((resolve, reject) => {
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
                    var ResData = res.data.data
                    ResData.sort(function (a, b) {
                        return a.date < b.date ? 1 : -1;
                    });
                    for (const key in ResData) {
                        const element = ResData[key];
                        if (element.items) {
                            element.items.sort(sortFun(`sequence`))
                        }
                    }
                    self.setData({
                        InsulinList: ResData,
                    })
                    resolve(ResData)
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
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
        //this.getInsulinChartByWeek();
        this.getInsulinChart(1);
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
            this.getInsulinListByWeek()
        }
    },
    handleTitleChange(e) {
        const {
            index
        } = e.detail;
        if (index === 1) {
            //this.getInsulinChartByWeek()
            this.getInsulinChart(1);
        } else {
            // if (this.data.index == '1') {
            //     this.getInsulinList()
            // } else if (this.data.index == '2') {
            //     this.getInsulinPumpList()
            // } else {
            //     this.getInsulinListByWeek()
            // }
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
        //this.getInsulinChartByWeek()
        this.getInsulinChart(1);
    },
    bindCurrentShowDate() {
        this.setData({
            selectedByGA: false,
        })
        // this.getInsulinChartByDate()
        this.getInsulinChart(2);
    },

    getInsulinChart(type) {
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
                "function": "getInsulinChart",
                "data": [{
                    "type": type,
                    "gestationalWeek": this.data.GA,
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
                let selectedTagList = []
                tagList.forEach(element => {
                    if (element.isSelected == '1') {
                        selectedTagList.push(element.code)
                    }
                });
                let legend = res.data.data[0].legend;
                for (let i = 0; i < legend.length; i++) {
                    // let svg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="' + legend[i].symbol.substr(7) + '" fill="' + legend[i].color + '"></path></svg>'
                    // svg = unescape(encodeURIComponent(svg));
                    // legend[i].symbol = 'data:image/svg+xml;base64,' + base64.btoa(svg);
                    legend[i].symbol = legend[i].symbol.substr(8)
                }
                this.setData({
                    legendList: legend,
                    tagList,
                    selectedTagList
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

    /*
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
                let selectedTagList = []
                tagList.forEach(element => {
                    if (element.isSelected == '1') {
                        selectedTagList.push(element.code)
                    }
                });
                let legend = res.data.data[0].legend;
                for (let i = 0; i < legend.length; i++) {
                    let svg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="' + legend[i].symbol.substr(7) + '" fill="' + legend[i].color + '"></path></svg>'
                    svg = unescape(encodeURIComponent(svg));
                    legend[i].symbol = 'data:image/svg+xml;base64,' + base64.btoa(svg);
                }
                this.setData({
                    legendList: legend,
                    tagList,
                    selectedTagList
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
                let selectedTagList = []
                tagList.forEach(element => {
                    if (element.isSelected == '1') {
                        selectedTagList.push(element.code)
                    }
                });
                let legend = res.data.data[0].legend;
                for (let i = 0; i < legend.length; i++) {
                    // let svg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="' + legend[i].symbol.substr(7) + '" fill="' + legend[i].color + '"></path></svg>'
                    // svg = unescape(encodeURIComponent(svg));
                    // legend[i].symbol = 'data:image/svg+xml;base64,' + base64.btoa(svg);
                    legend[i].symbol = legend[i].symbol.substr(8)
                }
                this.setData({
                    legendList: legend,
                    tagList,
                    selectedTagList
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
    */
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
            //this.getInsulinChartByWeek()
            this.getInsulinChart(1);
        } else {
            //this.getInsulinChartByDate()
            this.getInsulinChart(2);
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
            //this.getInsulinChartByDate()
            this.getInsulinChart(2);
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
            //this.getInsulinChartByDate()
            this.getInsulinChart(2);
        }

    },
    tapHandle() {
        this.setData({
            selectedByGA: true
        })
        return false
    },
    onLoad: function (options) {
        let that = this
        this.setData({
            GA: options.GA,
            multiIndex: [+options.GA]
        })
        this.echartsComponent = this.selectComponent('#mychart-dom-scatter');
        if (wx.getStorageSync('userType') == '1') {
            wx.setNavigationBarTitle({
                title: '胰岛素使用记录'
            })
        }
    },
    onShow: async function () {
        let that = this
        let InsulinList = await this.getInsulinList()
        let InsulinPumpList = await this.getInsulinPumpList()
        if (InsulinList.length == 0 && InsulinPumpList.length > 0) {
            that.setData({
                InsulinPump: true,
                convention: false,
                index: '2',
            })

        } else if (InsulinList.length > 0 && InsulinPumpList.length == 0) {
            that.setData({
                convention: true,
                InsulinPump: false,
                index: '1',
            })
        } else {
            that.setData({
                convention: true,
                InsulinPump: false,
                index: '1',
            })
        }

    }
})