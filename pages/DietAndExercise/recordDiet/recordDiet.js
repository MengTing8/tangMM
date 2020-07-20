const {
    request
} = require("../../../utils/request")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ShowTab:true,
        SearchFoodList:[],
        SearchValue: "",
        active: 1,
        TabList: [],
        foodArr: [],
        codeArr: []
    },
    getFood() {
        let self = this
        request({
            method: "POST",
            url: '/wxrequest',
            data: {
                "token": wx.getStorageSync('token'),
                "function": "getFood",
                "data": [{
                    "date": "2020-06-16"
                }]
            }
        }).then(res => {
            console.log(res, "食物");
            if (res.data.code === '0') {
                var ResData = res.data.data[0]
                self.setData({
                    TabList: ResData,
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
    bindFoodValueInput(e) {
        console.log(e);
        let {
            code,
            name
        } = e.target.dataset
        var newArr = this.data.foodArr
        var dataObj = e.detail.value;
        let codeArr = this.data.codeArr
        if (newArr.length !== 0) {
            for (let i = 0; i < newArr.length; i++) {
                console.log(newArr[i].code);
                // if (newArr[i].code == code) {
                //     console.log("相同的code");
                //     newArr[i].value = dataObj
                //     newArr[i].code = code;
                //     break;
                // } 
                if (codeArr.indexOf(code) !== -1) {
                    newArr[codeArr.indexOf(code)].value = dataObj
                    newArr[codeArr.indexOf(code)].code = code;
                    newArr[codeArr.indexOf(code)].name = name;
                    break;
                } else {
                    console.log(code, "bu");
                    if (codeArr.indexOf(code) === -1) {
                        newArr.push({
                            name: name,
                            code: code,
                            value: dataObj
                        })
                        codeArr.push(code)
                        break;
                    } else {
                        newArr[i].name = name,
                            newArr[i].value = dataObj
                        newArr[i].code = code;
                        break;
                    }
                }
            }
            if (!newArr[codeArr.indexOf(code)].value) {
                newArr.splice(codeArr.indexOf(code), 1)
                codeArr.splice(codeArr.indexOf(code), 1)
            }
        } else {
            newArr.push({
                name: name,
                code: code,
                value: dataObj
            })
            codeArr.push(code)
        }
        this.setData({
            foodArr: newArr
        })
    },
    saveFood() {
        console.log(this.data.foodArr);
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        prevPage.setData({
            foodArr: this.data.foodArr
        })
        setTimeout(() => {
            wx.navigateBack({
                delta: 1 //想要返回的层级
            })
        }, 1000)
    },
    bindSearch(e) {
        let that = this
        that.setData({
            SearchValue: e.detail
        })
        let item = that.data.TabList
        let NewList = []
        for (const key in item) {
            let items = item[key]
            for (const Index in items.foodValues) {
                let foodArr = items.foodValues[Index]
                if (foodArr.name.indexOf(that.data.SearchValue) !== -1) {
                    let obj = {}
                    obj.foodChildren = [foodArr]
                    obj.foodType = items.groupValue
                    NewList.push(obj)
                }
            }
        }
        let foodTypeArr = []
        let arr = []
        NewList.forEach(val => {
            let obj = {}
            // 如果该品类已经存在数组中
            if (foodTypeArr.indexOf(val.foodType) !== -1) {
                arr[foodTypeArr.indexOf(val.foodType)].nafoodChildrenme = arr[foodTypeArr.indexOf(val.foodType)].nafoodChildrenme.concat(val.foodChildren)
            } else {
                foodTypeArr.push(val.foodType)
                obj.foodType = val.foodType
                obj.nafoodChildrenme = val.foodChildren
                arr.push(obj)
            }

        });
        console.log(arr)
         that.setData({
             ShowTab:false,
             SearchFoodList: arr
         })
         if (that.data.SearchValue=='') {
             that.setData({
                 ShowTab: true,
                //  SearchFoodList: arr
             })
         }
    },
    // onChange(e) {
    //     console.log(e);
    //     let that = this
    //     that.setData({
    //         SearchValue: e.detail
    //     })
    //     let item = that.data.TabList
    //     console.log(item);

    //   if (that.data.SearchValue) {
    //         let NewList = []
    //         for (const key in item) {
    //             let items = item[key]
    //             for (const Index in items.foodValues) {
    //                 let foodArr = items.foodValues[Index]
    //                 if (foodArr.name.indexOf(that.data.SearchValue) !== -1) {
    //                     let obj = {}
    //                     obj.foodChildren = [foodArr]
    //                     obj.foodType = items.groupValue
    //                     NewList.push(obj)
    //                 }
    //             }
    //         }
    //         // console.log(NewList);
    //         // for (const i in NewList) {
    //         // //  NewList[i]foodType
    //         // }
    //         let typeArr = []
    //         let Arrs = []
    //         console.log(NewList, 'NewList111');

    //         NewList.forEach(val => {
    //             console.log(val, '1');
    //             let obj1 = {}
    //             obj1.foodType = val.foodType
    //             typeArr.push(obj1)
    //             console.log(typeArr);

    //             let arr = []
    //             typeArr.forEach(function (val2, k) {
    //                 console.log(val2, '2');
    //                 console.log(val.foodType + '---' + val2.foodType);
    //                 if (val.foodType == val2.foodType) {
    //                     let obj = {}
    //                     obj.foodType = val2.foodType
    //                     obj.foodChildren = val.foodChildren
    //                     arr.push(obj)
    //                 } else {
    //                     console.log(arr, NewList, 'else');
    //                     // arr.push(val)
    //                     //   Arrs = arr
    //                 }
    //             })
    //             console.log(arr, '集合');

    //         });
    //         NewList = Arrs
    //         console.log(NewList, '...........');

    //         console.log(typeArr, 'typ');
    //   }


    // },
    TapSearch() {
           var model = JSON.stringify(this.data.TabList);
        wx.navigateTo({
            url: '../recordDietSearch/recordDietSearch?TabList=' + model
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getFood()
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