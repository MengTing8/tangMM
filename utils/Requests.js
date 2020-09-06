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
                         wx.getUserInfo({
                             success: res => {
                                 let RequestObjs = {
                                     method: "POST",
                                     url: '/wxrequest',
                                     data: {
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
                                 promiseRequest(RequestObjs).then((res) => {
                                     if (res.data.code == "0") {
                                         let promiseQueue = app.globalData.promiseQueue;
                                         let userType = res.data.data[0].userType
                                         let DataArr = res.data.data[0]
                                         wx.setStorageSync('token', DataArr.token)
                                         wx.setStorageSync('userType', userType)
                                         let promiseQueueItem = successCb;
                                         if (successCb) {
                                             promiseQueueItem.data.token = DataArr.token
                                         }
                                         if (promiseQueueItem) {
                                             app.globalData.exeQueue = true;
                                             promiseRequest(promiseQueueItem);
                                             app.globalData.promiseQueue = promiseQueue;
                                         }
                                     } else {
                                         wx.showModal({
                                             title: '提示',
                                             content: res.data.errMsg || '网络错误！',
                                             showCancel: false
                                         })
                                     }

                                 }).catch((errMsg) => {
                                     console.log(errMsg); //错误提示信息
                                 });
                             }
                         })
                     } else {
                         console.log("未授权");
                         wx.reLaunch({
                             url: '/pages/index/index'
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
  */
 const app = getApp()
 const promiseRequest = (requestObj) => {
     let userType = wx.getStorageSync('userType')
     let PatientId = wx.getStorageSync('PatientId')
     var DataArr = requestObj.data.data
     let fun = requestObj.data.function
     if (userType == '1') {
         if (fun == 'getBaseChart' || fun == "getWeightListByWeek" || fun == "getWeightListByDate" || fun == "getWeightChart" || fun == "getFetusWeightList" || fun == "getDietList" || fun == "getDietChart" || fun == "getExerciseList" || fun == "getBloodGlucoseList" || fun == "getBloodGlucoseChartByDate" || fun == "getInsulinList" || fun == "getInsulinPumpList" || fun == "getInsulinListByWeek" || fun == "getInsulinChart" || fun == "getBaseList" || fun == "getFetusWeightChart" || fun == "getExerciseChart" || fun == "getWeightList") {
             DataArr[0].patientId = PatientId
         }
     }
     for (const key in DataArr) {
         if (!DataArr[key].rowMd5) {
             delete DataArr[key].rowMd5
         }
         if (!DataArr[key].id) {
             delete DataArr[key].id
         }
     }
     let apiUrl = 'https://aaron.astraia.com.cn'
     return new Promise((resolve, reject) => {
         if (!requestObj.data.token && requestObj.data.function !== 'mpLogin') {
             login(requestObj)
             return
         }
         //网络请求
         wx.request({
             url: apiUrl + requestObj.url,
             method: requestObj.method,
             data: JSON.stringify(requestObj.data),
             success: function (res) {
                 let promiseQueue = app.globalData.promiseQueue;
                 if (res.data.code == '0') {
                     if (requestObj.resolve) {
                         //如果是promise队列中的请求。
                         requestObj.resolve(res);
                         let promiseQueueItem = promiseQueue.shift();
                         if (app.globalData.exeQueue) {
                             //如果队列可执行则循环队列，保持队列只被循环一次。
                             app.globalData.exeQueue = false; //防止被多次循环。
                             if (promiseQueueItem) {
                                 //  promiseRequest(promiseQueueItem);
                                 promiseQueueItem = promiseQueue.shift();
                                 app.globalData.promiseQueue = promiseQueue;
                             }
                             if (!promiseQueueItem) {
                                 app.globalData.exeQueue = true;
                                 app.globalData.needBeginLogin = true;
                             }
                         }
                     } else {
                         resolve(res);
                     }
                 } else if (res.data.code == '-99') {
                     //token失效，重新调用login换取token
                     wx.clearStorageSync()
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
                 } else if (res.data.code == '-97') {
                     wx.clearStorageSync()
                     wx.reLaunch({
                         url: '/pages/index/index'
                     })
                 } else if (res.data.code == '-1') {
                     if (res.data.message.indexOf("无效签名") !== -1 || res.data.message.indexOf("token") !== -1 || res.data.message.indexOf("无效绑定") !== -1) {
                         wx.clearStorageSync()
                         requestObj.resolve = resolve;
                         promiseQueue.push(requestObj);
                         if (!app.globalData.needBeginLogin) {
                             return;
                         }
                         app.globalData.needBeginLogin = false;
                         login(requestObj)
                     } else if (res.data.message.indexOf("无效授权") !== -1) {
                         wx.clearStorageSync()
                         wx.reLaunch({
                             url: '/pages/index/index'
                         })
                     } else {
                         console.log(res.data);
                         resolve(res);

                     }
                 } else {
                     console.log(res.data);
                     resolve(res);

                 }
             },
             error: function (e) {
                 console.log(e);
                 //  wx.hideLoading()
                 reject(e);
             }
         })
     });
 }
 module.exports = {
     promiseRequest,
     login
 }