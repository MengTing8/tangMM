import * as echarts from '../../../components/ec-canvas/echarts';
const {
    promiseRequest
} = require("../../../utils/Requests")
const {
    getDay,
    getDates,
    checkTime
} = require("../../../utils/util")
const moment = require('../../../utils/moment.min.js');
let date = getDates(1, new Date());
let newDate = moment(getDay(0)).format('YYYY年MM月DD日')
var StarDATE = moment(getDay(-7)).format('YYYY年MM月DD日');
var EndDATE = newDate
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ec: {},
        TimeObjChart: {
            StartDt: newDate,
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
        },
        dateStartChart: getDay(-7),
        dateEndChart: getDay(0),
        TimeObj: {
            StartDt: newDate,
            EndDt: '2029年01月01日',
            StarDATE,
            EndDATE,
        },
        dateStart: getDay(-7),
        dateEnd: getDay(0),
        historyFootList: [],
        selectedIndex: 0,
        heatCharts: {},
        startLength: 0,
        endLength: 0,
        TabsIndex: 0,
        tabCharts: [],
        typeCode: '2',
    },
    getDietList() {
        let _that = this
        let requestObj = {
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getDietList",
                "data": [{
                    "dateStart": _that.data.dateStart,
                    "dateEnd": _that.data.dateEnd
                }]
            }
        };
        promiseRequest(requestObj).then((res) => {
                console.log(res);
                if (res.data.code === '0') {
                    let ResData = res.data.data
                    var newData = []
                    let flag
                    ResData.forEach((item) => {
                            console.log(item);
                            item.forEach(i => {
                                    console.log(i);
                                    flag = newData.find(item1 => item1.date === i.date)
                                    if (!flag) {
                                        newData.push({
                                            date: i.date,
                                            children: [i]
                                        })
                                    } else {
                                        flag.children.push(i)
                                    }
                            })
                    })
                _that.setData({
                    historyFootList: newData,
                })
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        }).catch((errMsg) => {
        console.log(errMsg); 
    });
},
getDietChart() {

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
        this.getDietList()
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
        this.getDietList()
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
    this.setData({
        TabsIndex: index,
        typeCode: typecode
    })
},
onLoad: function (options) {
    this.echartsComponnetDiet = this.selectComponent('#mychartDiet');
    this.echartsComponnetTab = this.selectComponent('#mychartTabs');
    this.getDietList()
}
})