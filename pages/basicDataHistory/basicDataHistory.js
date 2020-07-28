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

function initChartBasicData(canvas, width, height) {
    const chart = echarts.init(canvas, null, {
        width: 440,
        height: 500
    });
    canvas.setChart(chart);
    var option = {
        type: 'scatter',
        title: {
            text: '糖化血红蛋白'
        },
        tooltip: {
            trigger: 'axis',
            show: false, //选中提示面板不显示
        },
        color: ['#296FD8', '#BF29D8', '#FF8900', '#299AD8', '#00EDFF'],
        legend: {
            data: [],
            left: '10%',
            right: '10%',
            padding: 5,
            bottom: '-6%',
            icon: 'rect',
            itemWidth: 14, //图例的宽度
            itemHeight: 14, //图例的高度
            textStyle: { //图例文字的样式
                color: '#ccc',
                fontSize: 14
            },
            selectedMode: false, //控制是否可以通过点击图例改变系列的显示状态

        },
        grid: {
            //   show: true,
            top: 30,
            bottom: 20,
            right: rpx,
            left: 0,
            // right: '2%',
            // bottom: '3%',
            containLabel: true,
            width: 'auto',
            z: 10,
        },
        // toolbox: {
        //     // feature: {
        //     //     // saveAsImage: {}
        //     // }
        // },
        xAxis: {
            type: 'category',
            axisLine: {
                onZero: false,
                lineStyle: {
                    color: '#CDCDCD'
                }
            },
            boundaryGap: false,
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周7', '周8', '周9', '周10', '周11', '周12', '周13', '周14', '周15', '周16', '周17', ],
            splitLine: {
                show: true,
                lineStyle: {
                    color: ['#F8F8F8'], //修改分割线颜色
                    width: 1,
                    type: 'solid'
                }
            },
            axisTick: {
                show: false,
            },
            axisLabel: {
                interval: 0 //设置X坐标数据隔一个显示
            }
        },
        yAxis: {
            // type: 'category',
            // splitNumber: 19,
            // axisLine: {
            //     lineStyle: {
            //         color: '#CDCDCD'
            //     }
            // },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false
            }
        },
        series: [{
                name: '总量',
                type: 'scatter',
                symbolSize: 12,
                lineStyle: {
                    color: '#FEC81E',
                    width: 2,
                    type: 'solid'
                },
                itemStyle: {
                    normal: {
                        color: "#FEC81E",
                        //  lineStyle: {
                        //     //  color: "#FEC81E"
                        //  }
                    }
                },
                // itemStyle: {
                //     borderWidth: 16,
                //     width: 2,
                //     color: '#62D829'
                // },
                stack: '总量',
                symbol: 'circle',

                data: [1, 13, 11, 14, 9, 20, 10, 14, 9, 23, 10, 14, 9, 2, 10],
                markLine: {
                    symbol: "none", //去掉警戒线最后面的箭头
                    label: {
                        position: "end", //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
                        formatter: ""
                    },
                    data: [{
                        silent: false, //鼠标悬停事件  true没有，false有
                        lineStyle: { //警戒线的样式  ，虚实  颜色
                            type: "dashed",
                            color: "#CDCDCD"
                        },
                        name: '警戒线',
                        yAxis: 0
                    }, {
                        silent: false, //鼠标悬停事件  true没有，false有
                        lineStyle: { //警戒线的样式  ，虚实  颜色
                            type: "dashed",
                            color: "#CDCDCD"
                        },
                        name: '警戒线',
                        yAxis: 9
                    }],

                }
            },
            // {
            //     name: '早餐前',
            //     type: 'scatter',
            //     stack: '总量',
            //     symbol: '',
            //     symbolSize: 12,
            //     lineStyle: {
            //         color: '#BF29D8', //折线颜色
            //         width: 2,
            //         type: 'solid'
            //     },
            //     itemStyle: {
            //         borderWidth: 16,
            //         width: 2,
            //         color: '#BF29D8' //折线转折圆点颜色
            //     },
            //     data: [10, 11, 11, 14, 10, 10, 11, 12, 12, 11, 14, 22, 13, 22, 13, 33, 11],
            //     markLine: {
            //         symbol: "none", //去掉警戒线最后面的箭头
            //         label: {
            //             position: "end", //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
            //             formatter: ""
            //         },
            //         data: [{
            //             silent: false, //鼠标悬停事件  true没有，false有
            //             lineStyle: { //警戒线的样式  ，虚实  颜色
            //                 type: "dashed",
            //                 color: "#CDCDCD"
            //             },
            //             name: '',
            //             yAxis: 25
            //         }]
            //     }
            // }, {
            //     name: '午餐前',
            //     type: 'scatter',
            //     stack: '总量',
            //     symbol: '',
            //     symbolSize: 12,
            //     lineStyle: {
            //         color: '#FF8900',
            //         width: 2,
            //         type: 'solid'
            //     },
            //     itemStyle: {
            //         borderWidth: 16,
            //         width: 2,
            //         color: '#FF8900'
            //     },
            //     data: [20, 18, 11, 24, 20, 30, 10, 20, 12, 11, 24, 12, 3, 22, 3, 33, 11],
            //     markLine: {
            //         symbol: "none", //去掉警戒线最后面的箭头
            //         label: {
            //             position: "end", //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
            //             formatter: ""
            //         },
            //         data: [{
            //             silent: false, //鼠标悬停事件  true没有，false有
            //             lineStyle: { //警戒线的样式  ，虚实  颜色
            //                 type: "dashed",
            //                 color: "#CDCDCD"
            //             },
            //             name: '',
            //             yAxis: 50
            //         }]
            //     }
            // },


        ],
        // dataZoom: [{
        //         show: false,
        //         realtime: true,
        //         start: 0,
        //         end: 50
        //     },
        //     {
        //         type: 'inside',
        //         realtime: true,
        //         start: 0,
        //         end: 50
        //     }
        // ]
        //  dataZoom: [{
        //      type: 'inside'
        //  }],
        dataZoom: [{
                show: true,
                id: 'dataZoomX',
                type: 'inside', //滚动条作用域在统计图里,不显示出滚动条框
                xAxisIndex: [0],
                filterMode: 'filter',
                // start: 10,
                // end: 100,
                start: (1 - 5 / 10) * 100,
                handleSize: 8,
                showDetail: true,
                fillerColor: "rgba(167,183,204,0.3)", //选中范围的填充颜色
                // zoomLock:true,
                textStyle: {
                    color: "#8e8e8e",
                    fontSize: "0" //手柄字体大小 左右两边的文字
                }
            },


        ],

    };

    chart.setOption(option);
    chart.setOption({
        // xAxis: {
        //     data: arr
        // },
        // yAxis: {
        // },
        // series: {
        //     data: '',
        // },
    });
    return chart;
}
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ec: {
            // lazyLoad: true, // 延迟加载
            // onInit: initChartBasicData
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
        dataArr: [],
        xAxisData: [],
        dateArr: [],
        isAbnormalArr: [],
        startLength: 0,
        endLength: 0,
        lowerLimit: 0, //	虚线下限
        upperLimit: 0, //虚线上限
        legendList: [],
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
                var ResData = res.data.data[0]
                let nameArr = []
                let dateArr = []
                let isAbnormal = []
                for (let key in ResData.x) {
                    ResData.x[key].value = Number(ResData.x[key].value)
                    nameArr.push(ResData.x[key].seriesValue2)
                    dateArr.push(ResData.x[key].seriesValue1)
                    isAbnormal.push(ResData.x[key].isAbnormal)
                }
                self.setData({
                    dataArr: ResData.x,
                    xAxisData: nameArr,
                    isAbnormalArr: isAbnormal,
                    dateArr,
                    legendList: ResData.legend,
                    lowerLimit: ResData.lowerLimit, //	虚线下限
                    upperLimit: ResData.upperLimit //虚线上限
                })
                self.init_echarts();
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
    init_echarts: function () {
        this.echartsComponnet.init((canvas, width, height) => {
            // 初始化图表      
            const Chart = echarts.init(canvas, null, {
                width: width,
                height: height
            });
            Chart.setOption(this.getOption());
            // 注意这里一定要返回 chart 实例，否则会影响事件处理等    
            return Chart;
        });
    },
    getOption: function () {
        var that = this

        if (that.data.xAxisData.length > 7) {
            that.setData({
                startLength: 50
            })
        } else {
            that.setData({
                startLength: 0,
                endLength: 100
            })
        }
        // let color = that.data.isAbnormalArr.map(element => {
        //     var col = element == '1' ? 'green' : 'red'
        //     return col;
        // });
        var option = {
            type: 'scatter',
            title: {
                text: '糖化血红蛋白'
            },
            tooltip: {
                trigger: 'item', //数据项图形触发--'axis'坐标轴触发
                backgroundColor: "rgba(238, 238, 238, 0.75)", //设置背景图片 rgba格式
                borderWidth: "1", //边框宽度设置1
                // show: false, //选中提示面板不显示
                axisPointer: { //去掉移动的指示线
                    type: 'none'
                },
                textStyle: {
                    color: "black" //设置文字颜色
                },
                formatter: "{c}%",
                position: function (p) { //其中p为当前鼠标的位置
                    return [p[0] + 10, p[1] - 22];
                },
                extraCssText: 'width:160px;height:40px;background:red;'
                // formatter: function (params, ticket, callback) {
                //     const item = params[0]
                //     return item.value + '%';
                // }
            },
            // color: ['#296FD8', '#BF29D8', '#FF8900', '#00EDFF'],
            legend: {
                // data: ['q', 'e'],
                // left: '10%',
                // right: '10%',
                // padding: 5,
                // bottom: '-6%',
                // icon: 'rect',
                // itemWidth: 14, //图例的宽度
                // itemHeight: 14, //图例的高度
                // textStyle: { //图例文字的样式
                //     color: '#ccc',
                //     fontSize: 14
                // },
                // selectedMode: false, //控制是否可以通过点击图例改变系列的显示状态

            },
            grid: {
                //   show: true,
                top: 50,
                bottom: 20,
                right: rpx,
                left: 0,
                // right: '2%',
                // bottom: '3%',
                containLabel: true,
                width: 'auto',
                z: 10,
            },
            //  toolbox: {
            //      feature: {
            //          saveAsImage: {}
            //      }
            //  }, //下载图标
            xAxis: {
                type: 'category',
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: '#CDCDCD'
                    }
                },
                boundaryGap: false,
                // data: ['周一', '周2一', '周一3', '周二', '周三', '周四', '周五', '周六', '周7', '周五', '周六', '周7'],
                // data: that.data.xAxisData,
                data: function () {
                    var list = [];
                    for (let i in that.data.xAxisData) {
                        var item = that.data.dateArr[i] + '\n' + that.data.xAxisData[i]
                        list.push(item);
                    }
                    return list;
                }(),
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['#F8F8F8'], //修改分割线颜色
                        width: 1,
                        type: 'solid'
                    }
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    interval: 0 //设置X坐标数据隔一个显示
                },
                // axisTick: {
                //     length: 5
                // },
            },
            yAxis: {
                // type: 'category',
                splitNumber: 10,
                axisLine: {
                    lineStyle: {
                        color: '#CDCDCD'
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                }
            },
            series: [{
                // barWidth: 10, //柱图宽度
                // name: '有机质含量',
                type: 'scatter',
                symbolSize: 12,
                lineStyle: {
                    color: '#FEC81E',
                    width: 2,
                    type: 'solid'
                },
                itemStyle: {
                    normal: {
                        color: (params) => {
                            var col = params.data.isAbnormal == '1' ? 'red' : '#FE9800'
                            return col;
                        }
                    }
                },
                stack: '',
                symbol: 'circle',
                data: that.data.dataArr,
                markLine: {
                    symbol: "none", //去掉警戒线最后面的箭头
                    label: {
                        position: "end", //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
                        formatter: ""
                    },
                    data: [{
                        silent: false, //鼠标悬停事件  true没有，false有
                        lineStyle: { //警戒线的样式  ，虚实  颜色
                            type: "dashed",
                            color: "#CDCDCD"
                        },
                        name: '警戒线',
                        yAxis: that.data.lowerLimit
                    }, {
                        silent: false, //鼠标悬停事件  true没有，false有
                        lineStyle: { //警戒线的样式  ，虚实  颜色
                            type: "dashed",
                            color: "#CDCDCD"
                        },
                        name: '警戒线',
                        yAxis: that.data.upperLimit
                    }],

                }
            }, ],

            dataZoom: [{
                    show: true,
                    id: 'dataZoomX',
                    type: 'inside', //滚动条作用域在统计图里,不显示出滚动条框
                    xAxisIndex: [0],
                    filterMode: 'filter',
                    start: that.data.startLength,
                    end: that.data.endLength,
                    // end: 100,
                    filterMode: 'empty',
                    //  end: 50,
                    //  start: (1 - 5/ 6) * 100,
                    handleSize: 8,
                    showDetail: true,
                    fillerColor: "rgba(167,183,204,0.3)", //选中范围的填充颜色
                    // zoomLock:true,
                    textStyle: {
                        color: "#8e8e8e",
                        fontSize: "0" //手柄字体大小 左右两边的文字
                    }
                },


            ],

        };
        return option
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.echartsComponnet = this.selectComponent('#mychart-dom-basicData');
        this.init_echarts()
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