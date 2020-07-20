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
    // console.log(new Date(new Date().getTime() + 1 * 0.4 * 60 * 1000), "倒计时");

    function countdown(that) {
        if (that.data.refreshClock) {
            return;
        }
        var NowTime = new Date().getTime();
        var total_micro_second = EndTime - NowTime || [];
        //单位毫秒 
        if (total_micro_second < 0) {
            // console.log('时间初始化小于0，活动已结束状态'); 
            // total_micro_second = 1;
            //单位毫秒 ------  WHY？ 

        }
        // console.log('剩余时间：' + total_micro_second);


        // console.log(total_micro_second);
        if (total_micro_second <= 0) {
            console.log(" 已经截止");
            console.log(new Date(), "截止时间");
            var timeEnd = formatTime(new Date())
            that.setData({
                clock: "00:00",
                timeEnd
            });
            that.SaveFetalMovement()
            total_micro_second = ''
            EndTime = new Date(new Date().getTime() + 1 * 60 * 60 * 1000).getTime() || [];
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
        // console.log(day + "天" + hr + "小时" + min + "分钟" + sec + "秒");

        // return day + "天" + hr + "小时" + min + "分钟" + sec + "秒";
        return min + ":" + sec;
    }


    const {
        request
    } = require("../../utils/request")
    const {
        formatDate,
        formatTime,
        getDates
    } = require("../../utils/util")
    var back = wx.getBackgroundAudioManager()

    Page({

        /**
         * 页面的初始数据
         */
        data: {
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
            //------
            avatarUrl: "",
            name: '',
            descriptionUser: '',
            musicPlayKey: 0,
            musicList: [
                // {
                //     name:"1",
                //     url: "http://m701.music.126.net/20200618132449/97b7b9cc26b002a30c5a171a647bb20e/jdymusic/obj/w5zDlMODwrDDiGjCn8Ky/2270179822/2491/6dd5/eafd/7db3a42de108d4d1dbb91fb71d024c28.mp3"
                // },
                // {
                //     name:"2",
                //     url: "http://m801.music.126.net/20200618132511/e01175a57f802ce84c0f2a1201facab2/jdymusic/obj/w5zDlMODwrDDiGjCn8Ky/2180586519/98b2/4d51/b6d3/c8c65de6a0bf053a2cd94d1f9473d069.mp3"
                // }
            ],
            on: true, // 控制音乐的状态，以及图标是否旋转
            TabsIndex: 0,
            State: false,
            SwitchMusic: false,
            multiIndex: [0, 0],
            gas,
            days,
            predays: [gas],
            GA: '',
            description: '',
            descriptionShow: false,
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
                                timeEnd
                            });

                            that.SaveFetalMovement()
                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
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
                                refreshClock: true
                            })

                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
                    }
                })
            }

        },
        //取胎动监测今日记录
        getFetalMovementList() {
            let self = this
            request({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "getFetalMovementList",
                    "data": []
                }
            }).then(res => {
                console.log(res, "胎动监测今日记录");
                if (res.data.code === '0') {
                    self.setData({
                        FetalMovementList: res.data.data
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
        //孕周记录
        getFetalMovementListW() {
            let self = this
            request({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "getFetalMovementListW",
                    "data": [{
                        "gestationalWeek": self.data.GA
                    }]
                }
            }).then(res => {
                console.log(res, "孕周记录");
                if (res.data.code === '0') {
                    self.setData({
                        WeeksRecordList: res.data.data
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
        //保存胎动监测
        SaveFetalMovement() {
            let self = this
            let date = getDates(1, new Date());
            console.log(date);
            request({
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
                        "date": date[0].time,
                        "timeStart": self.data.timeStart,
                        "timeEnd": self.data.timeEnd,
                        "quantity": self.data.quantity,
                        "validQuantity": self.data.validQuantity,
                        "status": 1
                    }]
                }
            }).then(res => {
                console.log(res);
                if (res.data.code === '0') {
                    self.setData({
                        quantity: 0, //原始胎动次数
                        validQuantity: 0, //有效胎动次数
                        clock: "00:00",
                        refreshClock: true,
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
        //a开始计时
        StartCounting() {
            var that = this
            console.log("eee");

            if (that.data.clock == "00:00") {
                var d = new Date()
                var timeStart = formatTime(d)
                that.setData({
                    timeStart,
                    refreshClock: false
                })
                EndTime = new Date(new Date().getTime() + 1 * 60 * 60 * 1000).getTime() || [];

                countdown(that);
            } else {
                console.log("胎动了");
                // var newTime = that.data.clock
                if (this.data.total_econd == '') {
                    var strTime = new Date(new Date().getTime() + 1 * 5 * 60 * 1000).getTime(); //五分钟

                    var newTime = new Date().getTime();
                    that.setData({
                        total_econd: newTime,
                    })
                }
                //  setTimeout(function () {
                //      console.log("达到5分钟1111");
                //  }, 300000)
                console.log(new Date().getTime() - this.data.total_econd);

                if (new Date().getTime() - this.data.total_econd >= 300000) {
                    console.log("达到5分钟");
                    that.setData({
                        validQuantity: that.data.validQuantity + 1,
                        total_econd: ""
                    })
                }
                // console.log(new Date(new Date().getTime() +1 * 5 * 60 * 1000), new Date()) // 后一个小时  当前时间
                that.setData({
                    quantity: that.data.quantity + 1,
                })
            }
        },
        //暂停播放
        stop() {
            let that = this
            let object = that.data.musicList
            //  innerAudioContext.pause();
            back.pause(); // 点击音乐图标后出发的操作
            this.setData({
                on: !this.data.on
            })
            if (this.data.on) {
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
            // let key = 0
            player();

            function player() {
                console.log(that.data.musicPlayKey);
                back.title = object[that.data.musicPlayKey].name;
                back.src = "http://up_mp4.t57.cn/2018/1/03m/13/396131229550.m4a";
                back.play() // 开始播放
                console.log("开始播放");
                console.log(back.src);
                console.log(back.title);
                console.log(object[that.data.musicPlayKey]);
                console.log(object[that.data.musicPlayKey].url);

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
            console.log(e);
            let that = this
            let object = that.data.musicList
            let index = e.currentTarget.dataset.index
            this.setData({
                musicPlayKey: index
            })
            back.title = object[index].name;
            back.src = object[index].url;
            // back.play() // 开始播放
            console.log(back.title);
            console.log(back.src);

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
        },
        //获取胎动监测 -音乐列表
        getFetalMovement() {
            let self = this
            request({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "getFetalMovement",
                    "data": []
                }
            }).then(res => {
                console.log(res);
                if (res.data.code === '0') {

                    self.setData({
                        musicList: res.data.data[0].music,
                        FetalMovementId: res.data.data[0].id,
                        FetalMovementRowMd5: res.data.data[0].rowMd5,
                    })
                    console.log(res.data.data[0].music, );

                    self.backmusic();

                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        }, //获取注意事项
        getFetalMovementNotice() {
            let self = this
            request({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "getFetalMovementNotice",
                    "data": []
                }
            }).then(res => {
                console.log(res);
                if (res.data.code === '0') {
                    self.setData({
                        description: res.data.data[0].description
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
            // console.log('picker发送选择改变，携带值为', e.detail.value, e.detail.column)
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
            // if(this.data.BPD ) {
            // this.exeEFWCanvas()
            // }
        },
        handleTitleChange(e) {
            let index = e.currentTarget.dataset.index
            this.setData({
                TabsIndex: index
            })
            this.getFetalMovementList()
            this.getFetalMovementListW()
        },

        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function (options) {
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
                GA: gestationalWeek
            })
            this.getFetalMovement()
            this.getFetalMovementNotice()
            this.getFetalMovementList()
            this.getFetalMovementListW()
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
            back.onError((res) => {
                console.log(res);

                console.log("错误,,,,...,,.");

            });

            // var that = this
            // //    innerAudioContext.src = "http://m10.music.126.net/20191211122622/856d8fa0a261c96b4e3bf7a21411eb99/ymusic/545a/025a/5158/c01ecd1a5d5046da4b33f2a4dd9dc7c2.mp3"
            // //     innerAudioContext.play();
            // // 获取BackgroundAudioManager 实例 后台播放
            // this.back = wx.getBackgroundAudioManager()
            // // 对实例进行设置
            // this.back.src = "http://up_mp4.t57.cn/2018/1/03m/13/396131229550.m4a"
            // this.back.title = 'Tassel' // 标题为必选项
            // this.back.play() // 开始播放
            // this.back.loop = true
            // wx.onBackgroundAudioStop(function () {
            //     console.log('onBackgroundAudioStop')
            //     console.log("播完了");

            //     that.setData({
            //         on: !that.data.on
            //     })
            // })
        },

        /**
         * 生命周期函数--监听页面显示
         */
        onShow: function () {
            wx.getBackgroundAudioPlayerState({
                success(res) {
                    console.log(res);

                    const status = res.status
                    const dataUrl = res.dataUrl
                    const currentPosition = res.currentPosition
                    const duration = res.duration
                    const downloadPercent = res.downloadPercent
                }
            })
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