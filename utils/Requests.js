 /**
  * 登录校验，获取openid
  * successCb 
  */
 function login(successCb) {
     let code = ''
     wx.login({
         success: function (res) {
             code = res.code;
             wx.getSetting({
                 success: res => {
                     if (res.authSetting['scope.userInfo']) {
                         // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                         wx.getUserInfo({
                             success: res => {
                                 let RequestObjs = {
                                     method: "POST",
                                     url: '/wxrequest',
                                     data: {
                                         "token": wx.getStorageSync('token'),
                                         'function': 'mpLogin',
                                         'data': [{
                                             'code': code,
                                             'iv': res.iv,
                                             'rawData': res.rawData,
                                             'encryptedData': res.encryptedData,
                                             'signature': res.signature,
                                         }]
                                     }
                                 }
                                 //  wx.showLoading({
                                 //      title: '努力加载中...',
                                 //  })
                                 promiseRequest(RequestObjs).then((res) => {
                                     console.log(res, 'loginR');
                                     //  wx.hideLoading()
                                     if (res.data.code == "0") {
                                         let promiseQueue = app.globalData.promiseQueue;
                                         let userType = res.data.data[0].userType
                                         let DataArr = res.data.data[0]
                                         wx.setStorageSync('token', DataArr.token)
                                         wx.setStorageSync('userType', userType)
                                         let promiseQueueItem = successCb;
                                         console.log(promiseQueueItem, 'promiseQueueItem');
                                         promiseQueueItem.data.token = DataArr.token
                                         console.log(promiseQueueItem, 'newtoken');
                                         if (promiseQueueItem) {
                                             app.globalData.exeQueue = true;
                                             promiseRequest(promiseQueueItem);
                                             app.globalData.promiseQueue = promiseQueue;
                                         }
                                         // successCb && successCb()
                                     } else {
                                         wx.hideLoading()
                                         wx.showModal({
                                             title: '提示',
                                             content: res.data.errMsg || '网络错误！',
                                             showCancel: false
                                         })
                                     }

                                 }).catch((errMsg) => {
                                     wx.hideLoading()
                                     console.log(errMsg); //错误提示信息
                                 });
                                 wx.hideLoading()
                             }
                         })
                     }
                 }
             })

         }
     })
 }

 /**
  * 封装的promise
  * 参数： requestObj 请求成功回调
  * throwError: true|false  如果传true则不判断code直接执行requestObj。否则code为100000时提示网络异常
  */
 const app = getApp()
 const promiseRequest = (requestObj) => {
     var DataArr = requestObj.data.data
     for (const key in DataArr) {
         if (DataArr[key].rowMd5 == '' || DataArr[key].rowMd5 == null || DataArr[key].rowMd5 == undefined) {
             delete DataArr[key].rowMd5

         }
         if (DataArr[key].id == '' || DataArr[key].id == null || DataArr[key].id == undefined) {
             delete DataArr[key].id
         }

     }
     let apiUrl = 'https://aaron.astraia.com.cn'
     return new Promise((resolve, reject) => {
         //网络请求
         wx.request({
             url: apiUrl + requestObj.url,
             method: requestObj.method,
             data: JSON.stringify(requestObj.data),
             success: function (res) {
                 //  console.log(res);
                 //  wx.hideLoading()
                 let promiseQueue = app.globalData.promiseQueue;
                 if (res.data.code == '0') {
                     if (requestObj.resolve) { //如果是promise队列中的请求。
                         requestObj.resolve(res);
                         let promiseQueueItem = promiseQueue.shift();
                         if (app.globalData.exeQueue) {
                             //如果队列可执行则循环队列，保持队列只被循环一次。
                             app.globalData.exeQueue = false; //防止被多次循环。
                             while (promiseQueueItem) {
                                 promiseRequest(promiseQueueItem);
                                 promiseQueueItem = promiseQueue.shift();
                                 app.globalData.promiseQueue = promiseQueue;
                             }
                             if (!promiseQueueItem) {
                                 app.globalData.exeQueue = true;
                                 app.globalData.needBeginLogin = true;
                             }
                             console.log(promiseQueueItem);
                         }
                     } else {
                         resolve(res);
                     }
                 } else if (res.data.code == '-99') {
                     //token失效，重新调用login换取token
                     requestObj.resolve = resolve;
                     promiseQueue.push(requestObj);
                     //请求失败了，把该请求放到promise队列，等待更新token后重新调用。
                     if (!app.globalData.needBeginLogin) {
                         //如果不需要重新登录
                         return;
                     }
                     //防止重复调用login。
                     app.globalData.needBeginLogin = false;
                     login(requestObj)
                 } else {
                     resolve(res);
                     console.log(res.data.message);
                     wx.showToast({
                         title: res.data.message,
                         icon: 'none',
                         duration: 2000
                     })
                 }
             },
             error: function (e) {
                 //  wx.hideLoading()
                 reject(e);
             }
         })
     });
 }
 module.exports = {
     promiseRequest,
 }