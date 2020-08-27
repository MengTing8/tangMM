// pages/historyWeightMa/historyWeightMa.js
import * as echarts from '../../../components/ec-canvas/echarts';
import * as base64 from '../../../utils/base64.js';
const {
    promiseRequest
} = require("../../../utils/Requests")
const {
    getDay,
    checkTime
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
let newDate = moment(getDay(0)).format('YYYY年MM月DD日')
var StarDATE = moment(getDay(-7)).format('YYYY年MM月DD日');
var EndDATE = newDate
const gas = []
const days = []
for (let i = 0; i <= 40; i++) {
    gas.push(i + '周')
}
Page({

    /**
     * 页面的初始数据
     */
    data: {

        CurrentShowDate: true,
        // CurrentShowWeek: false,
        TimeObj: {
            StartDt: newDate,
            EndDt:getDay(0),
            StarDATE,
            EndDATE,
            dateStart: getDay(-7),
            dateEnd: getDay(0),
        },
        ec: {},
        TabsIndex: 0,
        predays: [gas],
        multiIndex: [0, 0],
        gas,
        days,
        GA: '',
        bmi: '',
        target: '',
        RecordList: [],
        legendList: null
    },
    bindCurrentShowWeek() {
        this.setData({
            CurrentShowDate: true,
        })
        //this.getWeightListByWeek()
        this.getWeightList(1)
    },
    bindCurrentShowDate() {
        this.setData({
            CurrentShowDate: false,
        })
        //this.getWeightListByDate()
        this.getWeightList(2)
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
            })
            //this.getWeightListByDate()
            this.getWeightList(2)
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
            })
            //this.getWeightListByDate()
            this.getWeightList(2)
        }

    },
    getWeightList(type) {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getWeightList",
                "data": [{
                    "type":type,
                    "gestationalWeek": self.data.GA,
                    "dateStart": self.data.TimeObj.dateStart,
                    "dateEnd": self.data.TimeObj.dateEnd
                }]
            }
        }).then(res => {
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
/*    
    getWeightListByDate() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getWeightListByDate",
                "data": [{
                    "dateStart": self.data.TimeObj.dateStart,
                    "dateEnd": self.data.TimeObj.dateEnd
                }]
            }
        }).then(res => {
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
        promiseRequest({
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
*/
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
        //this.getWeightListByWeek()
        this.getWeightList(1)
    },
    TabsChange(e) {
        let index = e.currentTarget.dataset.index
        if (index == 1) {
            this.getWeightChart()
        }else{
            //this.getWeightListByWeek()
            this.getWeightList(1)
        }
        this.setData({
            TabsIndex: index
        })
    },
    getWeightChart() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getWeightChart",
                "data": [{}]
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
                let legend = res.data.data[0].legend;
                for (let i = 0; i < legend.length; i++) {
                    let svg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="' + legend[i].symbol.substr(7) + '" fill="' + legend[i].color + '"></path></svg>'
                    svg = unescape(encodeURIComponent(svg));
                    legend[i].symbol = 'data:image/svg+xml;base64,' + base64.btoa(svg);
                }
                this.setData({
                    legendList: legend
                })
                option.tooltip = {
                    show: true,
                    trigger: 'item'
                }
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
    onLoad: function (options) {
        let {
            GA
        } = options
        this.setData({
            GA
        })
        this.echartsComponent = this.selectComponent('#mychart-dom-scatter')
        //this.getWeightListByWeek()
        this.getWeightList(1)
          if (wx.getStorageSync('userType') == '1') {
              wx.setNavigationBarTitle({
                  title: '妈妈体重'
              })
          }
    }
})