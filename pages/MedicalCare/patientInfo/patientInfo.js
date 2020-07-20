// pages/MyRecord/MyRecord.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInputConten: '',
        talkContent: [{
            text: '护长，请问资料这样录入有问题吗？',
            isMine: true,
            satrtTime: '2020-02-10  20:20:51',
            headImg: '../../../img/user.png'
        }, {
            text: '护长，请问资料这样录入有问题吗？',
            isMine: true,
            satrtTime: '2020-02-10  20:20:51',
            headImg: '../../../img/user.png'
        }, {
            text: '可以的',
            isMine: false,
            satrtTime: '2020-02-10  20:20:51',
            headImg: '../../../img/user.png'

        },  {
            text: '可以的',
            isMine: false,
            satrtTime: '2020-02-10  20:20:51',
            headImg: '../../../img/user.png'

        }, {
            text: '好的',
            isMine: true,
            satrtTime: '2020-02-10  20:20:51',
            headImg: '../../../img/user.png'

        }],
        RecordList: [{
                logo: "../../../img/fetal.png",
                title: '胎动监测',
                info: '感知宝宝的存在',
                Achieve: 1,
            },
            {
                logo: "../../../img/basicData.png",
                title: '基础数据',
                info: '记录每天基础数据',
                Achieve: 2,
            }, {
                logo: "../../../img/weighMa.png",
                title: '宝马空腹体重',
                info: '记录体重对孕期观察有帮助',
                Achieve: 2,
            }, {
                logo: "../../../img/fetaWeight.png",
                title: '胎儿体重',
                info: '胎儿体重对胎儿健康影响至关重要',
                Achieve: 3,
            }, {
                logo: "../../../img/diet.png",
                title: '饮食记录',
                info: '每日能量摄入记录',
                Achieve: 2,
            }, {
                logo: "../../../img/sportsRecord.png",
                title: '运动记录',
                info: '坚持配合运动治疗',
                Achieve: 1,
            }, {
                logo: "../../../img/glucose.png",
                title: '血糖趋势',
                info: '记录跟踪血糖情况',
                Achieve: 2,
            }, {
                logo: "../../../img/insulin.png",
                title: '胰岛素使用登记',
                info: '妊娠糖尿病患者需密切观察血糖',
                Achieve: 3,
            }
        ],
        tabs: ['项目', '留言', '基本信息'],
        TabsIndex: 0,
        option1: [{
                text: '全部商品',
                value: 0,
                icon: null
            },
            {
                text: '新款商品',
                value: 1
            },
            {
                text: '活动商品',
                value: 2
            },
        ],
        option2: [{
                text: '默认排序',
                value: 'a'
            },
            {
                text: '好评排序',
                value: 'b'
            },
            {
                text: '销量排序',
                value: 'c'
            },
        ],
        option3: [{
                text: '默认排序',
                value: 'a'
            },
            {
                text: '好评排序',
                value: 'b'
            },
            {
                text: '销量排序',
                value: 'c'
            },
        ],
        value1: 0,
        value2: 'a',
        value3: 'a',
    },
    TabsChange(e) {
        let index = e.detail.index
        this.setData({
            TabsIndex: index
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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