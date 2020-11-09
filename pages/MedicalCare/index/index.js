const {
    promiseRequest
} = require("../../../utils/Requests")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        activeIndex: null,
        TabsIndex: 0,
        NurseData: {},
        tabs: [],
        MenuTitle: ['胎数', "胰岛素类型", '特殊高危人群'],
        MenuItems: [],
        ids: 0,
        GravidaList: [],
        tabCode: '1',
        searchValue: '',
        items: [],
        NurseId: '',
    },
    bindShowMsg(e) {
        let index = e.currentTarget.dataset.index
        this.setData({
            activeIndex: this.data.activeIndex == index ? -1 : index,
            ids: index
        })
    },
    mySelect(e) {
        var {
            value,
            code,
            sequence
        } = e.currentTarget.dataset
        let arr = this.data.MenuTitle
        let datas = this.data.items
        arr[this.data.activeIndex] = value
        let codeArr = []
        datas.forEach(item => {
            codeArr.push(item.sequence)
        })
        let key = codeArr.indexOf(sequence)
        if (codeArr.includes(sequence)) {
            datas[key].sequence = sequence
            datas[key].code = code
        } else {
            datas.push({
                sequence: sequence,
                code: code,
            })
        }
        this.setData({
            MenuTitle: arr,
            activeIndex: null,
            items: datas
        })
        this.getGravida()
    },
    onSearch(e) {
        this.setData({
            searchValue: e.detail
        })
        this.getGravida()
    },
    getPatientInfo(e) {
        let id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `../patientInfo/patientInfo?patientId=${id}&NurseId=${this.data.NurseId}`
        })
    },
    getNurse() {
        let that = this
        return new Promise((resolve, reject) => {
            promiseRequest({
                method: "POST",
                url: '/wxrequest',
                data: {
                    "token": wx.getStorageSync('token'),
                    "function": "getNurse",
                    "data": []
                }
            }).then((res) => {
                console.log(res, 'getNurse');
                if (res.data.code === '0') {
                    that.setData({
                        NurseData: res.data.data[0],
                        MenuItems: res.data.data[0].items,
                        NurseId: res.data.data[0].id,
                        tabs: res.data.data[0].tabs
                    })
                    resolve(res.data.data[0])
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            }).catch((errMsg) => {
                console.log(errMsg); //错误提示信息
            });
        })

    },
    getGravida() {
        let requestObj = {
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getGravida",
                "data": [{
                    "tabCode": this.data.tabCode,
                    "searchKeyword": this.data.searchValue,
                    "items": this.data.items
                }]
            }
        };
        promiseRequest(requestObj).then((res) => {
            console.log(res, 'getGravida');
            if (res.data.code === '0') {
                if (res.data.data.length > 0) {
                    this.setData({
                        GravidaList: res.data.data,
                    })
                } else {
                    this.setData({
                        GravidaList: []
                    })
                }
                let arr = this.data.tabs
                if (arr[this.data.tabCode - 1]) {
                    arr[this.data.tabCode - 1].quantity = res.data.data.length
                    this.setData({
                        tabs: arr
                    })
                }
                setTimeout(() => {
                    wx.hideToast()
                }, 500);
            } else {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        }).catch((errMsg) => {
            console.log(errMsg); //错误提示信息
        });
    },
    TabsChange(e) {
        let {
            index,
            code
        } = e.detail
        this.setData({
            TabsIndex: index,
            tabCode: code,
        })
        this.getGravida()
    },
    onRefresh() {
        wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: 2000
        })
        this.getGravida()
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {},

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: async function () {
        console.log('医务端---');
        // this.getNurse()
        // this.getGravida()
        let that = this
        let getNurse = await this.getNurse()
        if (getNurse.id || getNurse.id !== '') {
            that.getGravida()
        }
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton()
        }
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