import * as echarts from '../../components/ec-canvas/echarts';
import * as base64 from '../../utils/base64';
const {
    promiseRequest
} = require("../../utils/Requests")
const {
    getDates,
    checkTime,
    getDay
} = require("../../utils/util")
const moment = require('../../utils/moment.min.js');
let newDate = moment(getDay(0)).format('YYYY年MM月DD日')
var StarDATE = moment(getDay(-7)).format('YYYY年MM月DD日');
var EndDATE = newDate
Page({
    /**
     * 页面的初始数据
     */
    data: {
        // dateStart: getDay(-7),
        // dateEnd: getDay(0),
        TimeObj: {
            StartDt: newDate,
            EndDt:getDay(0),
            StarDATE,
            EndDATE,
            dateStart: getDay(-7),
            dateEnd: getDay(0),
        },
        selectedIndex: 0,
        BloodGlucoseList: [],
        ec: {

        },
        legendList: null,
        tagList: [],
        selectedTagList: []
    },
    getBloodGlucoseList() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getBloodGlucoseList",
                "data": [{
                    "dateStart": self.data.TimeObj.dateStart,
                    "dateEnd": self.data.TimeObj.dateEnd
                }]
            }
        }).then(res => {
            console.log(res);
            if (res.data.code === '0') {
                var ResData = res.data.data
                ResData.sort(function (a, b) {
                    return a.date < b.date ? 1 : -1;
                });
                self.setData({
                    BloodGlucoseList: ResData
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
        let date = e.detail.date
        const owner = e.currentTarget.dataset.owner
        if (checkTime(date, NewData.dateEnd)) {
            NewData.StarDATE = val;
            NewData.dateStart = date;
            this.setData({
                TimeObj: NewData
            })
            if (this.data.selectedIndex === 1) {
                this.getGLUChart()
                return
            }
            this.getBloodGlucoseList()
        }
    },
    bindEndTimeChange(e) {
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let date = e.detail.date
        const owner = e.currentTarget.dataset.owner
        if (checkTime(NewData.dateStart, date)) {
            NewData.EndDATE = val;
            NewData.dateEnd = date;
            this.setData({
                TimeObj: NewData
            })
            if (this.data.selectedIndex === 1) {
                this.getGLUChart()
                return
            }
            this.getBloodGlucoseList()
        }
    },
    handleTitleChange(e) {
        let index = e.detail.index
        if (index === 1) {
            this.getGLUChart()
        }
        this.setData({
            selectedIndex: index
        })
    },
    getGLUChart() {
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
                "function": "getBloodGlucoseChartByDate",
                "data": [{
                    "dateStart": this.data.TimeObj.dateStart,
                    "dateEnd": this.data.TimeObj.dateEnd,
                    'tags': tags
                }]
            }
        }).then(res => {
            if (res.data.code === '0' && res.data.totalRecord !== '0') {
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
                    if (element.isSelected=='1') {
                        selectedTagList.push(element.code)
                    }
                });

                let legend1 = res.data.data[0].legend1;
                for (let i = 0; i < legend1.length; i++) {
                    let svg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="' + legend1[i].symbol.substr(7) + '" fill="' + legend1[i].color + '"></path></svg>'
                    svg = unescape(encodeURIComponent(svg));
                    legend1[i].symbol = 'data:image/svg+xml;base64,' + base64.btoa(svg);
                }

                let legend2 = res.data.data[0].legend2;
                for (let i = 0; i < legend2.length; i++) {
                    let svg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="' + legend2[i].symbol.substr(7) + '" fill="' + legend2[i].color + '"></path></svg>'
                    svg = unescape(encodeURIComponent(svg));
                    legend2[i].symbol = 'data:image/svg+xml;base64,' + base64.btoa(svg);
                }

                this.setData({
                    legendList1: legend1,
                    legendList2: legend2,
                    tagList,
                    selectedTagList
                })
                this.init_echarts(option)
                // }
            } else if (res.data.code === '0' && res.data.totalRecord === '0'){
                this.init_echarts({});
                this.setData({
                    legendList1: [],
                    legendList2: [],
                    tagList: [],
                    selectedTagList: []
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
    init_echarts(option) {
      this.echartsComponentGLU.init((canvas, width, height) => {
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
        this.getGLUChart()
    },
    onLoad: function (options) {
        this.echartsComponentGLU = this.selectComponent('#GLU');
        this.getBloodGlucoseList()
         if (wx.getStorageSync('userType') == '1') {
             wx.setNavigationBarTitle({
                 title: '血糖记录'
             })
         }
    }
})