import * as echarts from '../../components/ec-canvas/echarts';
import * as base64 from '../../utils/base64';
const {
    promiseRequest
} = require("../../utils/Requests")
const {
    sortFun,
    checkTime,
    getDay, getPreMonth
} = require("../../utils/util")
const moment = require('../../utils/moment.min.js');
let newDate = moment(getDay(0)).format('YYYY年MM月DD日')
var dateStart = getPreMonth(getDay(0))
var StarDATE = moment(dateStart).format('YYYY年MM月DD日');
var EndDATE = newDate
Page({
    /**
     * 页面的初始数据
     */
    data: {
        TimeObj: {
            EndDt:getDay(0),
            StarDATE,
            EndDATE,
            dateStart,
            dateEnd: getDay(0),
        },
        selectedIndex: 0,
        BloodGlucoseList: [],
        ec: {

        },
        legendList: null,
        tagList: [],
        selectedTagList: [],
        BloodGlucoseTable: [
            {
                "gestationalWeek": "18",
                "header1": [{
                    "col": "1",
                    "value": ""
                }, {
                    "col": "2",
                    "value": "早"
                }, {
                    "col": "3",
                    "value": "午"
                }, {
                    "col": "4",
                    "value": "晚"
                }, {
                    "col": "5",
                    "value": ""
                }],
                "header2": [{
                    "col": "1",
                    "value": "孕18"
                }, {
                    "col": "2",
                    "value": "前"
                }, {
                    "col": "3",
                    "value": "1H"
                }, {
                    "col": "4",
                    "value": "2H"
                }, {
                    "col": "5",
                    "value": "前"
                }, {
                    "col": "6",
                    "value": "1H"
                }, {
                    "col": "7",
                    "value": "2H"
                }, {
                    "col": "8",
                    "value": "前"
                }, {
                    "col": "9",
                    "value": "1H"
                }, {
                    "col": "10",
                    "value": "2H"
                }, {
                    "col": "11",
                    "value": "睡前"
                }],
                "items": [{
                        "sequence": "1",
                        "row": [{
                            "col": "1",
                            "value": "07/10"
                        }, {
                            "col": "2",
                            "value": "1.2"
                        }, {
                            "col": "3",
                            "value": "1.3"
                        }, {
                            "col": "4",
                            "value": "1.4"
                        }, {
                            "col": "5",
                            "value": "1.5"
                        }, {
                            "col": "6",
                            "value": "1.6"
                        }, {
                            "col": "7",
                            "value": "1.7"
                        }, {
                            "col": "8",
                            "value": "1.8"
                        }, {
                            "col": "9",
                            "value": "1.9"
                        }, {
                            "col": "10",
                            "value": "1.0"
                        }, {
                            "col": "11",
                            "value": "1.1"
                        }]
                    },
                    {
                        "sequence": "2",
                        "row": [{
                            "col": "1",
                            "value": "瞬感"
                        }, {
                            "col": "2",
                            "value": ""
                        }, {
                            "col": "3",
                            "value": "2.3"
                        }, {
                            "col": "4",
                            "value": "2.4"
                        }, {
                            "col": "5",
                            "value": "2.5"
                        }, {
                            "col": "6",
                            "value": "2.6"
                        }, {
                            "col": "7",
                            "value": "2.7"
                        }, {
                            "col": "8",
                            "value": "2.8"
                        }, {
                            "col": "9",
                            "value": "2.9"
                        }, {
                            "col": "10",
                            "value": "2.0"
                        }, {
                            "col": "11",
                            "value": "2.1"
                        }]
                    }
                ]
            },
            {
                "gestationalWeek": "17",
                "header1": [{
                    "col": "1",
                    "value": ""
                }, {
                    "col": "2",
                    "value": "早"
                }, {
                    "col": "3",
                    "value": "午"
                }, {
                    "col": "4",
                    "value": "晚"
                }, {
                    "col": "5",
                    "value": ""
                }],
                "header2": [{
                    "col": "1",
                    "value": "孕17"
                }, {
                    "col": "2",
                    "value": "前"
                }, {
                    "col": "3",
                    "value": "1H"
                }, {
                    "col": "4",
                    "value": "2H"
                }, {
                    "col": "5",
                    "value": "前"
                }, {
                    "col": "6",
                    "value": "1H"
                }, {
                    "col": "7",
                    "value": "2H"
                }, {
                    "col": "8",
                    "value": "前"
                }, {
                    "col": "9",
                    "value": "1H"
                }, {
                    "col": "10",
                    "value": "2H"
                }, {
                    "col": "11",
                    "value": "睡前"
                }],
                "items": [{
                        "sequence": "1",
                        "row": [{
                            "col": "1",
                            "value": "07/10"
                        }, {
                            "col": "2",
                            "value": "1.2"
                        }, {
                            "col": "3",
                            "value": "1.3"
                        }, {
                            "col": "4",
                            "value": "1.4"
                        }, {
                            "col": "5",
                            "value": "1.5"
                        }, {
                            "col": "6",
                            "value": "1.6"
                        }, {
                            "col": "7",
                            "value": "1.7"
                        }, {
                            "col": "8",
                            "value": "1.8"
                        }, {
                            "col": "9",
                            "value": "1.9"
                        }, {
                            "col": "10",
                            "value": "1.0"
                        }, {
                            "col": "11",
                            "value": "1.1"
                        }]
                    },
                    {
                        "sequence": "2",
                        "row": [{
                            "col": "1",
                            "value": "瞬感"
                        }, {
                            "col": "2",
                            "value": ""
                        }, {
                            "col": "3",
                            "value": "2.3"
                        }, {
                            "col": "4",
                            "value": "2.4"
                        }, {
                            "col": "5",
                            "value": "2.5"
                        }, {
                            "col": "6",
                            "value": "2.6"
                        }, {
                            "col": "7",
                            "value": "2.7"
                        }, {
                            "col": "8",
                            "value": "2.8"
                        }, {
                            "col": "9",
                            "value": "2.9"
                        }, {
                            "col": "10",
                            "value": "2.0"
                        }, {
                            "col": "11",
                            "value": "2.1"
                        }]
                    }
                ]
            }
        ]
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
                  for (const key in ResData) {
                      if (ResData[key].items) {
                      ResData[key].items.sort(sortFun(`sequence`))
                      }
                  }
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
            let isFirstTime = true;
            this.getGLUChart(isFirstTime)
        }else{
            this.getBloodGlucoseList()
        }
        this.setData({
            selectedIndex: index
        })
    },
    getGLUChart(isFirstTime) {
        let tags = [];
        if(isFirstTime){
            //首次进入，后台将默认选择全部。
            tags = [{"code":"0"}]
        }else{
            for (const item of this.data.selectedTagList) {
                tags.push({
                    code: item
                })
            }
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
            console.log(res);
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

                let legend1 = res.data.data[0].legend1.sort(function (a, b) {
                    return a.sequence - b.sequence;
                });
                for (let i = 0; i < legend1.length; i++) {
                    // let svg = '<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="' + legend1[i].symbol.substr(7) + '" fill="' + legend1[i].color + '"></path></svg>'
                    // svg = unescape(encodeURIComponent(svg));
                    // legend1[i].symbol = 'data:image/svg+xml;base64,' + base64.btoa(svg);
                    legend1[i].symbol = legend1[i].symbol.substr(8)
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