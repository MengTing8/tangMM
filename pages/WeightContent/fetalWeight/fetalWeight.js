import * as echarts from '../../../components/ec-canvas/echarts';
import * as base64 from '../../../utils/base64.js';
const {
    promiseRequest
} = require("../../../utils/Requests")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        fetus: '1',
        numberOfFetus: '1',
        FetusWeightList: [],
        selectedIndex: 0,
        ec: {},
        legendList: [],
    },
    radioChange: function (e) {
        let fetus = e.detail.value || this.data.fetus
        this.setData({
            fetus: fetus
        })
         if (this.data.selectedIndex == 1) {
             this.getFetusWeightChart()
         } else {
             this.getFetusWeightList()
         }
    },
    getFetusWeightList() {
        let self = this
        promiseRequest({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getFetusWeightList",
                "data": [{
                    "fetus": self.data.fetus
                }]
            }
        }).then(res => {
            console.log(res, "列表");
            if (res.data.code === '0') {
                self.setData({
                    FetusWeightList: res.data.data
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
    handleTitleChange(e) {
        const {
            index
        } = e.detail;
        this.setData({
            selectedIndex: index
        })
        if (index == 1) {
            this.getFetusWeightChart()
        } else {
            this.getFetusWeightList()
        }
    },
    getFetusWeightChart() {
        promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "getFetusWeightChart",
                    "data": [{
                        // "fetus": this.data.fetus
                    }]
                }
            }).then((res) => {
            console.log(res);
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
            const Chart = echarts.init(canvas, null, {
                width: width,
                height: height
            });
            Chart.setOption(options);
            return Chart;
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            numberOfFetus: options.numberOfFetus
        })
        this.echartsComponent = this.selectComponent('#mychart-dom-weightData');
        this.getFetusWeightList()
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