import * as echarts from '../../components/ec-canvas/echarts';
const app = getApp();
const gas = []
const days = []
for (let i = 10; i <= 40; i++) {
    gas.push(i + '周')
}

for (let i = 0; i <= 6; i++) {
    days.push(i + '天')
}
var rpx;
var rpxs;

//获取屏幕宽度，获取自适应单位

wx.getSystemInfo({

    success: function (res) {
        rpxs = res.windowWidth / 375;

        if (res.windowWidth == 375) {
            rpx = "20%"
        } else if (res.windowWidth == 414) {
            rpx = "10%"
        } else if (res.windowWidth == 320) {
            rpx = "32%"
        }

    },

})

function initChart(canvas, width, height) {
    const chart = echarts.init(canvas, null, {
        width: 440,
        height: 500
    });
    canvas.setChart(chart);
    var option = {
        title: {
            text: '体重'
        },
        tooltip: {
            trigger: 'axis',
            show: false, //选中提示面板不显示
        },
        color: ['#296FD8', '#BF29D8', '#FF8900', '#299AD8', '#00EDFF'],
        legend: {
            data: [{
                name: '1总量',
            }, {
                name: '1早餐前',
            }, {
                name: '1午餐前',

            }, {
                name: '1晚餐前',

            }, {
                name: '1晚餐前',

            }],
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
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
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
            type: 'value',
            splitNumber: 19,
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
                name: '总量',
                type: 'line',
                symbolSize: 12,
                lineStyle: {
                    color: '#FEC81E',
                    width: 2,
                    type: 'solid'
                },
                itemStyle: {
                    normal: {
                        color: "#62D829",
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
                    // data: [{
                    //     silent: false, //鼠标悬停事件  true没有，false有
                    //     lineStyle: { //警戒线的样式  ，虚实  颜色
                    //         type: "dashed",
                    //         color: "#CDCDCD"
                    //     },
                    //     name: '警戒线',
                    //     yAxis: 19
                    // }]

                }
            },
            {
                name: '早餐前',
                type: 'line',
                stack: '总量',
                symbol: '',
                symbolSize: 12,
                lineStyle: {
                    color: '#BF29D8', //折线颜色
                    width: 2,
                    type: 'solid'
                },
                itemStyle: {
                    borderWidth: 16,
                    width: 2,
                    color: '#62D829' //折线转折圆点颜色
                },
                data: [10, 11, 11, 14, 10, 10, 11, 12, 12, 11, 14, 22, 13, 22, 13, 33, 11],
                markLine: {
                    symbol: "none", //去掉警戒线最后面的箭头
                    label: {
                        position: "end", //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
                        formatter: ""
                    },
                    // data: [{
                    //     silent: false, //鼠标悬停事件  true没有，false有
                    //     lineStyle: { //警戒线的样式  ，虚实  颜色
                    //         type: "dashed",
                    //         color: "#CDCDCD"
                    //     },
                    //     name: '',
                    //     yAxis: 5
                    // }]
                }
            }, {
                name: '午餐前',
                type: 'line',
                stack: '总量',
                symbol: '',
                symbolSize: 12,
                lineStyle: {
                    color: '#FF8900',
                    width: 2,
                    type: 'solid'
                },
                itemStyle: {
                    borderWidth: 16,
                    width: 2,
                    color: '#62D829'
                },
                data: [20, 18, 11, 24, 20, 30, 10, 20, 12, 11, 24, 12, 3, 22, 3, 33, 11],
                markLine: {
                    symbol: "none", //去掉警戒线最后面的箭头
                    label: {
                        position: "end", //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
                        formatter: ""
                    },
                    // data: [{
                    //     silent: false, //鼠标悬停事件  true没有，false有
                    //     lineStyle: { //警戒线的样式  ，虚实  颜色
                    //         type: "dashed",
                    //         color: "#CDCDCD"
                    //     },
                    //     name: '',
                    //     yAxis: 5
                    // }]
                }
            }, {
                name: '晚餐前',
                type: 'line',
                stack: '总量',
                symbol: '',
                symbolSize: 12,
                lineStyle: {
                    color: '#299AD8',
                    width: 2,
                    type: 'solid'
                },
                itemStyle: {
                    borderWidth: 16,
                    width: 2,
                    color: '#62D829'
                },
                data: [20, 11, 33, 20, 30, 10, 20, 12, 11, 24, 22, 3, 22, 33, 12, 11, 12],
                markLine: {
                    symbol: "none", //去掉警戒线最后面的箭头
                    label: {
                        position: "end", //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
                        formatter: ""
                    },
                    data: [
                        // {
                        //     name: '平均线',
                        //     // 支持 'average', 'min', 'max'
                        //     type: 'average'
                        // },
                        // {
                        //     name: 'Y 轴值为 100 的水平线',
                        //     yAxis: 60
                        // },
                        // [{
                        //         // 起点和终点的项会共用一个 name
                        //         name: '最小值到最大值',
                        //         type: 'min'
                        //     },
                        //     {
                        //         type: 'max',
                        //     }
                        // ],
                        // [{
                        //         name: '两个坐标之间的标线',
                        //         coord: [10, 20]
                        //     },
                        //     {
                        //         coord: [20, 30]
                        //     }
                        // ],
                        [{
                            // 固定起点的 x 像素位置，用于模拟一条指向最大值的水平线
                            yAxis: 'max',
                            x: '20%'
                        }, {
                            type: 'max',
                            x: '90%'

                        }],
                        // [{
                        //         name: '两个屏幕坐标之间的标线',
                        //         x: 100,
                        //         y: 200
                        //     },
                        //     {
                        //         x: 500,
                        //         y: 200
                        //     }
                        // ]
                    ]

                    // data: [{
                    //     silent: false, //鼠标悬停事件  true没有，false有
                    //     lineStyle: { //警戒线的样式  ，虚实  颜色
                    //         type: "dashed",
                    //         color: "#CDCDCD"
                    //     },
                    //     name: '',
                    //     yAxis: 80
                    // }]
                }
            }, {
                name: '睡前',
                type: 'line',
                stack: '总量',
                symbol: '',
                symbolSize: 12,
                lineStyle: {
                    color: '#00EDFF',
                    width: 2,
                    type: 'solid'
                },
                itemStyle: {
                    borderWidth: 16,
                    width: 2,

                    color: '#62D829'
                },
                data: [10, 2, 11, 4, 20, 30, 10, 20, 12, 11, 24, 12, 12, 20, 33, 33, 11],
                markLine: {
                    symbol: "none", //去掉警戒线最后面的箭头
                    label: {
                        position: "end", //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
                        formatter: ""
                    },
                    // data: [{
                    //     silent: false, //鼠标悬停事件  true没有，false有
                    //     lineStyle: { //警戒线的样式  ，虚实  颜色
                    //         type: "dashed",
                    //         color: "#CDCDCD"
                    //     },
                    //     name: '',
                    //     yAxis: 80
                    // }]
                }
            },


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
        //     data: ''
        // },
        // series: {
        //     data: arr,
        // },

    });
    return chart;
}
const {
    request
} = require("../../utils/request")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ec: {
            onInit: initChart
        },
        selectedIndex: 0,
        convention: true,
        GaShow: false,
        InsulinPump: false,
        index: 1,
        gas,
        days,
        Preday: '0',
        GA: '10',
        predays: [gas, days],
        multiIndex: [0, 0],
        listData: [

            {
                "GA": "28周+1",
                "breakfast": "0.2",
                "ChineseFood": "0.3",
                "dinner": '0',
                "total": "4"
            },

            {
                "GA": "28周+1",
                "breakfast": "0.2",
                "ChineseFood": "0.3",
                "dinner": '0',
                "total": "4"
            },

            {
                "GA": "28周+1",
                "breakfast": "0.2",
                "ChineseFood": "0.3",
                "dinner": '0',
                "total": "4"
            },

        ],
        legendData: [{
            name: '空腹',
            color: '#296FD8'

        }, {
            name: '早餐后2小时',
            color: '#BF29D8'

        }, {
            name: '午餐前',
            color: '#FF8900'

        }, {
            name: '午餐后2小时',
            color: '#299AD8'

        }, {
            name: '晚餐前',
            color: '#00EDFF'

        }, {
            name: '晚餐后2小时',
            color: '#8200FF'

        }, {
            name: '睡前',
            color: '#0BB9BF'

        }, {
            name: '0点血糖',
            color: '#BF610B'

        }],
        goalData: [{
            name: '高于目标',
            color: '#296FD8'

        }, {
            name: '低于目标',
            color: '#BF29D8'

        }, {
            name: '正常',
            color: '#FF8900'

        }],
        InsulinList: [],
        InsulinPumpList:[],
    },
    getInsulinPumpList() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getInsulinPumpList",
                "data": []
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
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getInsulinList",
                "data": []
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
    bindtouchmove(e) {
        console.log(e)

    },
    echartInit(e) {
        console.log(e);
        initChart(e.detail.canvas, e.detail.width, e.detail.height);
    },
    bindChange(e) {
        const val = e.detail.value
        this.setData({
            GA: this.data.gas[val[0]].replace('周', ''),
            Preday: this.data.days[val[1]].replace('天', '')
        })
        // if(this.data.BPD ) {
        // }
    },
    bindMultiPickerColumnChange(e) {
        // console.log('picker发送选择改变，携带值为', e.detail.value, e.detail.column)
        let predays = this.data.predays
        let val = e.detail.value,
            col = e.detail.column
        if ((val == 30 && col == 0)) {
            predays[1] = ['0天']
            this.setData({
                multiIndex: [30, 0]
            })
        } else {
            predays[1] = days
        }
        this.setData({
            predays: predays
        })
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
        this.setData({
            selectedIndex: index
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getInsulinList()
        this.getInsulinPumpList()
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