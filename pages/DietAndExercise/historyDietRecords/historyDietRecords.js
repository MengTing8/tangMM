import * as echarts from '../../../components/ec-canvas/echarts';

const {
    promiseRequest
} = require("../../../utils/Requests")
const {
    getDates,
    checkTime
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
let date = getDates(1, new Date());
let newDate = moment(date[0].time).format('YYYY年MM月DD日')
var StarDATE = "2020年06日01日"
var EndDATE = newDate
var rpx;
var rpxs;
wx.getSystemInfo({
    success: function (res) {
        rpxs = res.windowWidth / 375;
        if (res.windowWidth == 375) {
            rpx = "10%"
        } else if (res.windowWidth == 414) {
            rpx = "6%"
        } else if (res.windowWidth == 320) {
            rpx = "32%"
        }

    },

})
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ec: {
            // lazyLoad: true, // 延迟加载
            // onInit: initChartBasicData
        },
        TimeObjChart: {
            StartDt: '2020年01月01日',
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
        },
        dateStartChart: "2020-06-01",
        dateEndChart: date[0].time,
        TimeObj: {
            StartDt: '2020年01月01日',
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
        },
        dateStart: "2020-06-01",
        dateEnd: date[0].time,
        historyFootList: [{
            date: "2020-07-02",
            meal: "早餐",
            time: "08:12",
            dosage: "220",
            name: '胡萝卜200g、豆腐120g、白萝卜400g、鱼肉15g',
            imgUrl: "../../../img/121.jpg"
        }, {
            date: "2020-07-12",
            meal: "早餐",
            time: "08:12",
            dosage: "220",
            name: '胡萝卜200g、豆腐120g、白萝卜400g、鱼肉15g',
            imgUrl: "../../../img/121.jpg",

        }, {
            date: "2020-07-15",
            meal: "早餐",
            time: "08:12",
            dosage: "220",
            name: '胡萝卜200g、豆腐120g、白萝卜400g、鱼肉15g',
            imgUrl: "../../../img/121.jpg"
        }],
        selectedIndex: 0,
        heatCharts: {},
        startLength: 0,
        endLength: 0,
        TabsIndex: 0,
        tabCharts: [],
        typeCode: '2',
    },
    getDietChart() {
        let _that = this
        let requestObj = {
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getDietChart",
                "data": [{
                    "dateStart": _that.data.dateStartChart,
                    "dateEnd": _that.data.dateEndChart
                }]
            }
        };
        promiseRequest(requestObj).then((res) => {
            if (res.data.code === '0') {
                console.log(res);
                let ResData = res.data.data
                console.log(ResData);
                let heatObj = {}
                for (const key in ResData) {
                    if (ResData[key].typeCode == 1) {
                        heatObj = ResData[key]
                        ResData.splice(key, 1)
                    } else {}
                }
                console.log(ResData);
                ResData.sort(this.sortFun(`typeCode`))
                _that.setData({
                    heatCharts: heatObj,
                    tabCharts: ResData,
                    // typeCode: ResData[0].typeCode
                })
                _that.initDietTabs()
                _that.initDiet_echarts()
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
            wx.hideLoading()
        }).catch((errMsg) => {
            wx.hideLoading()
            console.log(errMsg); //错误提示信息
        });
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
            this.getDietChart()
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
            this.getDietChart()
        }

    },
    bindStartTimeChange(e) {
        console.log(e);
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let dateStart = e.detail.date
        let timeCheck = checkTime(dateStart, this.data.dateEnd)
        NewData.StarDATE = val;
        if (timeCheck) {
            this.setData({
                dateStart,
                TimeObj: NewData
            })
        }
    },
    bindEndTimeChange(e) {
        console.log(e);
        var NewData = this.data.TimeObj;
        let val = e.detail.value
        let dateEnd = e.detail.date
        NewData.EndDATE = val;
        if (timeCheck) {
            this.setData({
                dateEnd,
                TimeObj: NewData
            })
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
    handleChartsTabs(e) {
        const {
            index,
            typecode
        } = e.currentTarget.dataset;
        console.log(typecode);
        this.setData({
            TabsIndex: index,
            typeCode: typecode
        })
        this.initDietTabs()
    },
    sortFun: function (attr, rev) {
        //第二个参数没有传递 默认升序排列
        if (rev == undefined) {
            rev = 1;
        } else {
            rev = (rev) ? 1 : -1;
        }

        return function (a, b) {
            a = a[attr];
            b = b[attr];
            if (a < b) {
                return rev * -1;
            }
            if (a > b) {
                return rev * 1;
            }
            return 0;
        }
    },
    //初始化图表  
    initDiet_echarts: function () {
        this.echartsComponnetDiet.init((canvas, width, height) => {
            // 初始化图表      
            const Chart = echarts.init(canvas, null, {
                width: width,
                height: height
            });
            Chart.setOption(this.getOptiontDiet());
            // 注意这里一定要返回 chart 实例，否则会影响事件处理等    
            return Chart;
        });
    },
    getOptiontDiet: function () {
        var that = this
        if (that.data.heatCharts.y.length > 7) {
            that.setData({
                startLength: 50
            })
        } else {
            that.setData({
                startLength: 0,
                endLength: 100
            })
        }
        var option = {
            type: 'scatter',
            title: {
                text: that.data.heatCharts.typeValue,
                subtext: 'kcal'
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
                formatter: "{c}kcal",
                position: function (p) { //其中p为当前鼠标的位置
                    return [p[0] - 35, p[1] - 45];
                },
                extraCssText: 'width:160px;height:40px;background:red;'
                // formatter: function (params, ticket, callback) {
                //     console.log(params);
                //     const item = params[0]
                //     console.log(item);
                //     return item.value + '%';
                // }
            },
            legend: {},
            grid: {
                //   show: true,
                top: 60,
                bottom: 20,
                right: rpx,
                left: 10,
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
                data: ['07.02', '07.11', '07.12', '07.13', '07.14', '07.15', '07.16'],
                // data: that.data.xAxisData,
                // data: function () {
                //     var list = [];
                //     for (let i in that.data.xAxisData) {
                //         var item = that.data.dateArr[i] + '\n' + that.data.xAxisData[i]
                //         list.push(item);
                //     }
                //     return list;
                // }(),
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
                // data: dataY,
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
                            // var col = params.data.isAbnormal == '1' ? 'red' : '#FE9800'
                            return '#FEC81E';
                        }
                    }
                },
                stack: '',
                symbol: 'circle',
                data: that.data.heatCharts.y,
                // markLine: {
                //     symbol: "none", //去掉警戒线最后面的箭头
                //     label: {
                //         position: "end", //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
                //         formatter: ""
                //     },
                //     data: [{
                //         silent: false, //鼠标悬停事件  true没有，false有
                //         lineStyle: { //警戒线的样式  ，虚实  颜色
                //             type: "dashed",
                //             color: "#CDCDCD"
                //         },
                //         name: '警戒线',
                //         // yAxis: that.data.lowerLimit
                //         // yAxis: 22
                //     }, {
                //         silent: false, //鼠标悬停事件  true没有，false有
                //         lineStyle: { //警戒线的样式  ，虚实  颜色
                //             type: "dashed",
                //             color: "#CDCDCD"
                //         },
                //         name: '警戒线',
                //         // yAxis: 43
                //     }],

                // }
            }, ],

            dataZoom: [{
                    show: true,
                    id: 'dataZoomX',
                    type: 'inside', //滚动条作用域在统计图里,不显示出滚动条框
                    xAxisIndex: [0],
                    filterMode: 'filter',
                    start: that.data.startLength,
                    end: that.data.endLength,
                    filterMode: 'empty',
                    // end: 50,
                    // start: (1 - 5 / 6) * 100,
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
    //初始化图表  
    initDietTabs: function () {
        this.echartsComponnetTab.init((canvas, width, height) => {
            // 初始化图表      
            const Chart = echarts.init(canvas, null, {
                width: width,
                height: height
            });
            Chart.setOption(this.getOptiontTabs());
            // 注意这里一定要返回 chart 实例，否则会影响事件处理等    
            return Chart;
        });
    },
    getOptiontTabs: function () {
        var that = this
        let chartIndex = 0
        for (const key in that.data.tabCharts) {
            if (that.data.tabCharts[key].typeCode == that.data.typeCode) {
                chartIndex = key
            }
        }
        console.log(that.data.tabCharts[chartIndex]);
        if (that.data.tabCharts[chartIndex].y.length > 7) {
            that.setData({
                startLength: 50
            })
        } else {
            that.setData({
                startLength: 0,
                endLength: 100
            })
        }
        var option = {
            type: 'scatter',
            title: {
                // text: that.data.tabCharts[chartIndex].typeValue,
                subtext: '  g'
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
                formatter: "{c}kcal",
                position: function (p) { //其中p为当前鼠标的位置
                    return [p[0] - 35, p[1] - 45];
                },
                extraCssText: 'width:160px;height:40px;background:red;'
                // formatter: function (params, ticket, callback) {
                //     console.log(params);
                //     const item = params[0]
                //     console.log(item);
                //     return item.value + '%';
                // }
            },
            legend: {},
            grid: {
                //   show: true,
                top: 60,
                bottom: 20,
                right: rpx,
                left: 10,
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
                data: ['07.02', '07.11', '07.12', '07.13', '07.14', '07.15', '07.16'],
                // data: that.data.xAxisData,
                // data: function () {
                //     var list = [];
                //     for (let i in that.data.xAxisData) {
                //         var item = that.data.dateArr[i] + '\n' + that.data.xAxisData[i]
                //         list.push(item);
                //     }
                //     return list;
                // }(),
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
                // data: dataY,
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
                            // var col = params.data.isAbnormal == '1' ? 'red' : '#FE9800'
                            return '#FEC81E';
                        }
                    }
                },
                stack: '',
                symbol: 'circle',
                data: that.data.tabCharts[chartIndex].y,
                // markLine: {
                //     symbol: "none", //去掉警戒线最后面的箭头
                //     label: {
                //         position: "end", //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
                //         formatter: ""
                //     },
                //     data: [{
                //         silent: false, //鼠标悬停事件  true没有，false有
                //         lineStyle: { //警戒线的样式  ，虚实  颜色
                //             type: "dashed",
                //             color: "#CDCDCD"
                //         },
                //         name: '警戒线',
                //         // yAxis: that.data.lowerLimit
                //         // yAxis: 22
                //     }, {
                //         silent: false, //鼠标悬停事件  true没有，false有
                //         lineStyle: { //警戒线的样式  ，虚实  颜色
                //             type: "dashed",
                //             color: "#CDCDCD"
                //         },
                //         name: '警戒线',
                //         // yAxis: 43
                //     }],

                // }
            }, ],

            dataZoom: [{
                    show: true,
                    id: 'dataZoomX',
                    type: 'inside', //滚动条作用域在统计图里,不显示出滚动条框
                    xAxisIndex: [0],
                    filterMode: 'filter',
                    start: that.data.startLength,
                    end: that.data.endLength,
                    filterMode: 'empty',
                    // end: 50,
                    // start: (1 - 5 / 6) * 100,
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
        this.echartsComponnetDiet = this.selectComponent('#mychartDiet');
        this.echartsComponnetTab = this.selectComponent('#mychartTabs');
        console.log(this.echartsComponnetDiet);
        this.initDiet_echarts()
        this.initDietTabs()
        this.getDietChart()
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