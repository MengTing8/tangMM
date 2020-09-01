    import * as echarts from '../../components/ec-canvas/echarts';
    import * as base64 from '../../utils/base64';
    const gas = []
    const days = []
    for (let i = 0; i <= 40; i++) {
        gas.push(i + '周')
    }

    for (let i = 0; i <= 6; i++) {
        days.push(i + '天')
    }
    // 倒计时
    var EndTime = new Date(new Date().getTime() + 1 * 60 * 60 * 1000).getTime() || [];

    function countdown(that) {
        if (that.data.refreshClock) {
            return;
        }
        var NowTime = new Date().getTime();
        var total_micro_second = EndTime - NowTime || [];
        //单位毫秒 
        if (total_micro_second < 0) {
            // total_micro_second = 1;
            //单位毫秒 ------  WHY？ 

        }
        if (total_micro_second <= 0) {
            var timeEnd = formatTime(new Date())
            that.setData({
                clock: "00:00",
                timeEnd
            });
            back.stop()
            that.SaveFetalMovement()
            total_micro_second = ''
            EndTime = new Date(new Date().getTime() + 0.3 * 60 * 60 * 1000).getTime() || [];
            return;
        } else {
            // 渲染倒计时时钟  
            that.setData({
                clock: dateformat(total_micro_second)
                //若已结束，此处输出'0天0小时0分钟0秒' 
            });
        }

        setTimeout(function () {
            total_micro_second -= 1000;
            countdown(that);

        }, 1000)


    }
    // 时间格式化输出，如11天03小时25分钟19秒  每1s都会调用一次
    function dateformat(micro_second) {
        // 总秒数 
        var second = Math.floor(micro_second / 1000);
        // 天数 
        var day = Math.floor(second / 3600 / 24);
        // 小时 
        var hr = Math.floor(second / 3600 % 24);
        // 分钟 
        var min = Math.floor(second / 60 % 60);
        // 秒 
        var sec = Math.floor(second % 60);
        if (hr <= 9) hr = '0' + hr;
        if (min <= 9) min = '0' + min;
        if (sec <= 9) sec = '0' + sec;
        // return day + "天" + hr + "小时" + min + "分钟" + sec + "秒";
        return min + ":" + sec;
    }

    const {
        promiseRequest
    } = require("../../utils/Requests")
    const {
        formatTime,
        getDates
    } = require("../../utils/util")
    var back = wx.getBackgroundAudioManager()
    let date = getDates(1, new Date());

    Page({

        /**
         * 页面的初始数据
         */
        data: {
            dateRecord: date[0].time,
            WeeksRecordList: [],
            FetalMovementList: [],
            refreshClock: false,
            patientId: wx.getStorageSync('patientId'),
            FetalMovementId: '',
            FetalMovementRowMd5: '',
            total_econd: "",
            intervalTime: 0,
            timeStart: '',
            timeEnd: '',
            quantity: 0, //原始胎动次数
            validQuantity: 0, //有效胎动次数
            clock: "00:00",
            avatarUrl: "",
            name: '',
            descriptionUser: '',
            musicPlayKey: 0,
            musicList: [],
            onMusic: false, // 控制音乐的状态，以及图标是否旋转
            TabsIndex: 0,
            State: false,
            SwitchMusic: false,
            multiIndex: [0],
            gas,
            days,
            predays: [gas],
            GA: '',
            description: '',
            descriptionShow: false,
            ec: {},
            legendList: [],
        },
         DeleteByDate(e) {
             let {
                 id,
                 rowmd5
             } = e.currentTarget.dataset
             let that = this
             if (that.data.FetalMovementList.length>0) {
                 wx.showModal({
                     title: '提示',
                     content: "确定删除当日数据？",
                     success(res) {
                         if (res.confirm) {
                             promiseRequest({
                                 method: "POST",
                                 url: '/wxrequest',
                                 data: {
                                     "token": wx.getStorageSync('token'),
                                     "function": "delete",
                                     "data": [{
                                         "entity": "fetalMovement",
                                          "id": id,
                                          "rowMd5": rowmd5,
                                     }]
                                 }
                             }).then((res) => {
                                 if (res.data.code === '0') {
                                     wx.showToast({
                                         title: res.data.message,
                                         icon: 'none',
                                         duration: 3000
                                     })
                                     that.getFetalMovementList()
                                 } else {
                                     wx.showToast({
                                         title: res.data.message,
                                         icon: 'none',
                                         duration: 3000
                                     })
                                 }
                             })
                         } else if (res.cancel) {}
                     }
                 })
             } else {
                 wx.showToast({
                     title: '无数据可删！',
                     icon: 'none',
                     duration: 2000
                 })
             }

         },
        bindEnd() {
            let that = this
            if (that.data.clock == "00:00") {
                wx.showToast({
                    title: "监测还未开始",
                    icon: 'none',
                    duration: 2000
                })
                return;
            } else {
                wx.showModal({
                    title: '提示',
                    content: "确定结束监测吗？",
                    success(res) {
                        if (res.confirm) {
                            var timeEnd = formatTime(new Date())
                            that.setData({
                                timeEnd,
                            });
                            back.stop()
                            that.SaveFetalMovement()
                        } else if (res.cancel) {}
                    }
                })
            }
        },
        //重新监测
        refreshData() {
            let that = this
            if (that.data.clock == "00:00") {
                wx.showToast({
                    title: "监测还未开始",
                    icon: 'none',
                    duration: 2000
                })
                return;
            } else {
                wx.showModal({
                    title: '提示',
                    content: "确定要重置监测吗？",
                    success(res) {
                        if (res.confirm) {
                            that.setData({
                                quantity: 0, //原始胎动次数
                                validQuantity: 0, //有效胎动次数
                                clock: "00:00",
                                refreshClock: true,
                            })
                            back.stop()
                        } else if (res.cancel) {}
                    }
                })
            }

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
                    "data": [{}]
                }
            }).then(res => {
                if (res.data.code === '0') {
                    var ResData = res.data.data
                    ResData.sort(function (a, b) {
                        return a.time < b.time ? 1 : -1;
                    });
                    self.setData({
                         //FetalMovementList: res.data.data
                         FetalMovementList: ResData
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
                        "gestationalWeek": self.data.GA
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
        //保存胎动监测
        SaveFetalMovement() {
            let self = this
            promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "save",
                    "data": [{
                        "entity": "fetalMovement",
                        // "id": self.data.FetalMovementId,
                        // "rowMd5": self.data.FetalMovementRowMd5,
                        "patientId": self.data.patientId,
                        "date": self.data.dateRecord,
                        "timeStart": self.data.timeStart,
                        "timeEnd": self.data.timeEnd,
                        "quantity": self.data.quantity,
                        "validQuantity": self.data.validQuantity,
                        "status": 1
                    }]
                }
            }).then(res => {
                if (res.data.code === '0') {
                    self.setData({
                        quantity: 0, //原始胎动次数
                        validQuantity: 0, //有效胎动次数
                        clock: "00:00",
                        refreshClock: true,
                        total_econd: ""
                    });
                    self.getFetalMovementList()
                    self.getFetalMovementListW()
                    wx.showToast({
                        title: res.data.message,
                        duration: 2000
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
        //开始计时
        StartCounting() {
            var that = this
            if (that.data.clock == "00:00") {
                that.backmusic();
                var d = new Date()
                var timeStart = formatTime(d)
                that.setData({
                    timeStart,
                    refreshClock: false
                })
                EndTime = new Date(new Date().getTime() + 1 * 60 * 60 * 1000).getTime() || [];
                countdown(that);
            } else {
                if (this.data.total_econd == '' && that.data.validQuantity == 0) {
                    that.setData({
                        validQuantity: that.data.validQuantity + 1,
                    })
                }
                if (this.data.total_econd == '') {
                    // var strTime = new Date(new Date().getTime() + 1 * 5 * 60 * 1000).getTime(); //五分钟
                    var newTime = new Date().getTime();
                    that.setData({
                        total_econd: newTime,
                    })
                }
                if (new Date().getTime() - this.data.total_econd >= 300000) {
                    that.setData({
                        validQuantity: that.data.validQuantity + 1,
                        total_econd: ""
                    })
                }
                that.setData({
                    quantity: that.data.quantity + 1,
                })
            }
        },
        //暂停播放
        stop() {
            let that = this
            let object = that.data.musicList
            back.pause(); // 点击音乐图标后出发的操作
            this.setData({
                onMusic: !this.data.onMusic
            })
            if (this.data.onMusic) {
                back.title = object[0].name;
                back.src = object[0].url;
                back.play()
            } else {
                back.pause()
            }
        },
        backmusic: function () {
            let that = this
            let object = that.data.musicList
            player();
            that.setData({
                onMusic: true
            })

            function player() {
                back.title = object[that.data.musicPlayKey].name;
                back.src = object[that.data.musicPlayKey].url;
                back.play() // 开始播放
                back.onEnded(() => {
                    if (that.data.musicPlayKey < object.length - 1) {
                        that.data.musicPlayKey++
                    } else {
                        that.data.musicPlayKey = 0
                    }
                    player();
                })
            }
        },
        //切换歌曲
        selectMusic(e) {
            let that = this
            let object = that.data.musicList
            let index = e.currentTarget.dataset.index
            this.setData({
                musicPlayKey: index
            })
            back.title = object[index].name;
            back.src = object[index].url;
        },
        /**
         * 播放下一首
         */
        playNext() {
            var that = this;
            let playIndex = 0;
            if (that.data.musicPlayKey < (that.data.musicList.length - 1)) {
                playIndex = that.data.musicPlayKey + 1;
            }
            that.data.musicPlayKey = playIndex;
            that.setAudio();
        },
        /**
         * 播放上一首
         */
        playPrev() {
            var that = this;
            var playIndex = that.data.musicList.length - 1;
            if (that.data.musicPlayKey > 0) {
                playIndex = that.data.musicPlayKey - 1;
            }
            that.data.musicPlayKey = playIndex;
            that.setAudio();
        },
        /**
         * 播放新的音频
         */
        setAudio() {
            var that = this;
            var data = that.data.musicList[that.data.musicPlayKey]
            back.title = data.name;
            back.src = data.url;
        },
        toggleMusic() {
            var that = this;
            that.setData({
                SwitchMusic: (!that.data.SwitchMusic)
            })
        },
        onChangeShowState: function () {
            var that = this;
            that.setData({
                descriptionShow: (!that.data.descriptionShow)
            })
            if (that.data.descriptionShow && !this.data.description) {
                that.getNotice()
            }

        },
        //获取胎动监测 -音乐列表
        getFetalMovement() {
            let self = this
            promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "getFetalMovement",
                    "data": []
                }
            }).then(res => {
                if (res.data.code === '0') {
                    self.setData({
                        musicList: res.data.data[0].music,
                        FetalMovementId: res.data.data[0].id,
                        FetalMovementRowMd5: res.data.data[0].rowMd5,
                    })
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        }, //获取注意事项
        getNotice() {
            let self = this
            promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "getNotice",
                    "data": [{
                        "type": "1"
                    }]
                }
            }).then(res => {
                console.log(res);
                if (res.data.code === '0') {
                    self.setData({
                        description: res.data.data[0].text
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
        bindMultiPickerColumnChange(e) {
            let predays = this.data.predays
            let val = e.detail.value,
                col = e.detail.column
            if ((val == 30 && col == 0)) {
                // predays[1] = ['0天']
                this.setData({
                    multiIndex: [30, 0]
                })
            } else {
                // predays[1] = days
            }
            this.setData({
                predays: predays
            })
        },
        bindChange(e) {
            const val = e.detail.value
            this.setData({
                GA: this.data.gas[val[0]].replace('周', ''),
                // Preday: this.data.days[val[1]].replace('天', '')
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
                    "data": []
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
            this.echartsComponent = this.selectComponent('#mychart-dom-movementData');
            let {
                avatarUrl,
                name,
                description,
                patientId,
                gestationalWeek
            } = options
            this.setData({
                patientId,
                avatarUrl,
                name,
                descriptionUser: description,
                GA: gestationalWeek,
                multiIndex: [+gestationalWeek]
            })
            this.getFetalMovement()
            this.getFetalMovementList()
            // this.getFetalMovementListW()
        },

        /**
         * 生命周期函数--监听页面初次渲染完成
         */
        onReady: function () {
            var that = this
            back.onNext(function () {
                console.log('onNext')
                that.playNext();
            });
            back.onPrev(function () {
                console.log('onPrev')
                that.playPrev();
            });
            back.onCanplay(() => {
                console.log("可以播放,,,,...,,.");

            });
            back.onStop(() => {
                console.log("停止");
                that.setData({
                    onMusic: false
                })
            });
            back.onError((res) => {
                console.log("错误,,,,...,,.");

            });
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