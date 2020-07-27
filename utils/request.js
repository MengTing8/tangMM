/* 用 promise 方式封装 request 请求方法 */
const app = getApp()
const request = (params) => {
    var DataArr = params.data.data
    for (const key in DataArr) {
        if (DataArr[key].rowMd5 == '' || DataArr[key].rowMd5 == null || DataArr[key].rowMd5 == undefined) {
            delete DataArr[key].rowMd5

        }
        if (DataArr[key].id == '' || DataArr[key].id == null || DataArr[key].id == undefined) {
            delete DataArr[key].id
        }

    }

    // const baseURL = "http://59.42.100.209:19080"; //开发环境
    const baseURL = "https://aaron.astraia.com.cn"; //测试环境

    //   wx.showLoading({
    //     title: '加载中...',
    //     // 是否显示透明蒙层，防止触摸穿透
    //     mask: false
    //   });

    // 通过 Promise 对象，把请求成功和失败的回调函数进行封装
    return new Promise((resolve, reject) => {
        // 2.0 发送请求
        wx.request({
            ...params,
            url: baseURL + params.url,
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: res => {
                if (res.data.code == -99) {
                    let code = ''
                    //token失效
                    // wx.clearStorage()
                    var ard = app.globalData
                    // 登录
                    wx.login({
                        success: res => {
                            code = res.code;
                            // 发送 res.code 到后台换取 openId, sessionKey, unionId
                        }
                    })
                    wx.getSetting({
                        success: res => {
                            if (res.authSetting['scope.userInfo']) {
                                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                                wx.getUserInfo({
                                    success: res => {
                                        wx.request({
                                            method: "POST",
                                            url: baseURL + '/wxrequest',
                                            header: {
                                                'content-type': 'application/json'
                                            },
                                            data: {
                                                'function': 'mpLogin',
                                                'data': [{
                                                    'code': code,
                                                    'iv': res.iv,
                                                    'rawData': res.rawData,
                                                    'encryptedData': res.encryptedData,
                                                    'signature': res.signature,
                                                }]
                                            },
                                            success: res => {
                                                if (res.data.code === '0') {
                                                    console.log('data.data=', res.data.data);
                                                    let userType = res.data.data[0].userType
                                                    let DataArr = res.data.data[0]
                                                    wx.setStorageSync('token', DataArr.token)
                                                    wx.setStorageSync('userType', userType)
                                                    app.globalData.userType = userType
                                                    // -2 = 未绑定手机用户
                                                    // -1 = 未绑定诊疗卡用户
                                                    // 1 = 医务人员
                                                    // 2 = 孕产妇
                                                    if (userType == -2) {
                                                        console.log("：未绑定手机用户");
                                                        // -2 ：未绑定手机用户
                                                        wx.navigateTo({
                                                            url: '../tiedCard/tiedCard?tabsItem=' + 0
                                                        })
                                                    } else if (userType == -1) {
                                                        console.log("未绑定诊疗卡用户");
                                                        // -1 = 未绑定诊疗卡用户
                                                        wx.navigateTo({
                                                            url: '../tiedCard/tiedCard?tabsItem=' + 1
                                                        })
                                                    } else if (userType == 2) {
                                                        wx.navigateTo({
                                                            url: '../MyRecord/MyRecord'
                                                        })
                                                    } else if (userType == 1) {
                                                        wx.navigateTo({
                                                            // url: '../MyRecord/MyRecord'
                                                        })
                                                    }
                                                } else {
                                                    wx.showToast({
                                                        title: res.data.message,
                                                        icon: 'none',
                                                        duration: 2000
                                                    })
                                                }
                                                // resolve(res);
                                            },
                                            fail: err => {
                                                console.log(err);

                                                reject(err);
                                            },
                                            // 请求完成的时候
                                            complete: res => {
                                                // 3.0 隐藏加载框
                                                // wx.hideLoading();
                                            }
                                        })


                                    }
                                })
                            }
                        }
                    })



                } else {
                    // 解构返回结果
                    // const {
                    //   message
                    // } = res.data;
                    // 请求成功，执行 Promise 的 resolve 回调函数
                    resolve(res);
                }

            },
            fail: err => {
                console.log(err);

                reject(err);
            },
            // 请求完成的时候
            complete: res => {
                // 3.0 隐藏加载框
                // wx.hideLoading();
            }
        })
    }).catch((e) => {});;
}
const pullDownrequest = (params) => {


    // 抽离项目基本路径
    const baseURL = "https://api.gdbkyz.com/AppUser/api/";

    // 判断 url 中是否包含了 my/ 路径，如果包含说明是私有路径
    // 私有路径的特征，请求头带上 token 做用户校验

    //   if (params.url.includes('my/')) {
    //     // 获取 token 
    //     const token = wx.getStorageSync('token');
    //     if (token) {
    //       // 在参数中添加请求头属性
    //       params.header = {
    //         ...params.header,
    //         "Authorization": token
    //       }
    //     } else {
    //       // 跳转到授权登录页面
    //       wx.navigateTo({
    //         url: '/pages/login/login',
    //       });
    //       // 没有授权就退出函数，需要返回 Promise 对象，防止外部 then 的时候报错。
    //       return new Promise(() => {});
    //     }

    //   }

    // 1.0 在发送请求之前，先显示加载框
    //   wx.showLoading({
    //     title: '加载中...',
    //     // 是否显示透明蒙层，防止触摸穿透
    //     mask: false
    //   });

    // 通过 Promise 对象，把请求成功和失败的回调函数进行封装
    return new Promise((resolve, reject) => {
        // 2.0 发送请求
        wx.request({
            // 直接把所有的参数解构
            ...params,
            // 2.1 !! url 请求地址 = 基本路径 + 传入的 url
            url: baseURL + params.url,
            header: {
                'cookie': wx.getStorageSync('cookies'),
                'content-type': 'application/json' // 默认值
            },
            // 2.2 请求成功的回调函数
            success: res => {
                // 解构返回结果
                // const {
                //   message
                // } = res.data;
                // 请求成功，执行 Promise 的 resolve 回调函数
                resolve(res);
            },
            fail: err => {
                reject(err);
            },
            // 请求完成的时候
            complete: res => {
                // 3.0 隐藏加载框
                wx.hideNavigationBarLoading(); //完成停止加载图标
                wx.stopPullDownRefresh();
            }
        })
    });
}
// 把封装的方法导出
module.exports = {
    request,
    pullDownrequest
}