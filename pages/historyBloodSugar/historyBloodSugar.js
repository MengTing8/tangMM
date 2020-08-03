import * as echarts from '../../components/ec-canvas/echarts';
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
        dateStart: getDay(-7),
        dateEnd: getDay(0),
        TimeObj: {
            StartDt: newDate,
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
        },
        selectedIndex: 0,
        BloodGlucoseList: [],
        ec:{

        },
        legendList: null,
        tagList: [],
        selectedTagList: ['0']
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
                    "dateStart": self.data.dateStart,
                    "dateEnd": self.data.dateEnd
                }]
            }
        }).then(res => {
            console.log(res);
            if (res.data.code === '0') {
                var ResData = res.data.data
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
        let dateStart = e.detail.date
        NewData.StarDATE = val;
        let timeCheck = checkTime(dateStart, this.data.dateEnd)
        const owner = e.currentTarget.dataset.owner
        if (timeCheck) {
            this.setData({
                dateStart,
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
        let dateEnd = e.detail.date
        NewData.EndDATE = val;
        let timeCheck = checkTime(this.data.dateStart, dateEnd)
        const owner = e.currentTarget.dataset.owner
        if (timeCheck) {
            this.setData({
                dateEnd,
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
        if(index === 1) {
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
                    "dateStart": this.data.dateStart,
                    "dateEnd": this.data.dateEnd,
                    'tag': tags
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
                let tagList = res.data.data[0].tags.sort((a, b) => {
                    return a.sequence - b.sequence
                })

                this.setData({
                    legendList1: res.data.data[0].legend1,
                    legendList2: res.data.data[0].legend2,
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
    }
})