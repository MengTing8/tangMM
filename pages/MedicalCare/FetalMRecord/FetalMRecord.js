 import * as echarts from '../../../components/ec-canvas/echarts';
 const gas = []
 const days = []
 for (let i = 0; i <= 40; i++) {
     gas.push(i + '周')
 }

 for (let i = 0; i <= 6; i++) {
     days.push(i + '天')
 }
 const {
     promiseRequest
 } = require("../../../utils/Requests")
 Page({

     /**
      * 页面的初始数据
      */
     data: {
         WeeksRecordList: [],
         FetalMovementList: [],
         multiIndex: [0, 0],
         gas,
         days,
         predays: [gas],
         GA: '',
         TabsIndex: 0,
         ec: {},
         legendList: [],
     },
     //取胎动监测今日记录
     getFetalMovementList() {
         let self = this
         promiseRequest({
             method: "POST",
             url: '/wxrequest',
             data: {
                 "token": wx.getStorageSync('token'),
                 "function": "getFetalMovementList",
                 "data": [{
                     "patientId": wx.getStorageSync('PatientId')
                 }]
             }
         }).then(res => {
             if (res.data.code === '0') {
                 self.setData({
                     FetalMovementList: res.data.data
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
     //孕周记录
     getFetalMovementListW() {
         let self = this
         promiseRequest({
             method: "POST",
             url: '/wxrequest',
             data: {
                 "token": wx.getStorageSync('token'),
                 "function": "getFetalMovementListByWeek",
                 "data": [{
                     "gestationalWeek": self.data.GA,
                     "patientId": wx.getStorageSync('PatientId')
                 }]
             }
         }).then(res => {
             if (res.data.code === '0') {
                 self.setData({
                     WeeksRecordList: res.data.data
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
             GA: this.data.gas[val[0]].replace('周', ''),
         })
         this.getFetalMovementListW()
     },
     handleTitleChange(e) {
         let index = e.currentTarget.dataset.index
         this.setData({
             TabsIndex: index
         })
         if (index == 0) {
             this.getFetalMovementList()
         } else if (index == 1) {
             this.getFetalMovementListW()
         } else {
             this.getFetalMovementChart()
         }
     },
     getFetalMovementChart() {
         let requestObj = {
             method: "POST",
             url: '/wxrequest',
             data: {
                 "token": wx.getStorageSync('token'),
                 "function": "getFetalMovementChart",
                 "data": [{
                     "patientId": wx.getStorageSync('PatientId')
                 }]
             }
         };
         promiseRequest(requestObj).then((res) => {
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
                 this.setData({
                     legendList: res.data.data[0].legend
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
         this.echartsComponent = this.selectComponent('#movemrntRecord');
         this.setData({
             GA: options.GA
         })
         this.getFetalMovementList()
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