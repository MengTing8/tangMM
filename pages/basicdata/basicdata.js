  const {
      request
  } = require("../../utils/request")
  const {
      formatDate,
      getDates
  } = require("../../utils/util")
  const moment = require('../../utils/moment.min.js');
  let date = getDates(1, new Date());
  Page({

      /**
       * 页面的初始数据
       */
      data: {
          StartDt: '2020年06月18日',
          EndDt: '2029年01月01',
          EXDATE: '2020年06月18日',
          //   fundalHeight: "", //宫高
          //   abdominalCircumference: "", //腹围
          //   hba1c: "", //糖化血红蛋白
          baseData: {
              entity: "base",
              patientId: wx.getStorageSync('patientId'),
              date: date[0].time,
              id: '',
              rowMd5: '',
              fundalHeight: "",
              abdominalCircumference: "",
              hba1c: "",
              status: 1,

          },
          dateRecord: date[0].time,
          RecordDate: moment(date[0].time).format('YYYY年MM月DD日'),
          time: '',
          BasicRowMd5: '',
          dataArray: [{
              entity: "baseDetail",
              patientId: wx.getStorageSync('patientId'),
              status: 1,
              time: '',
              heartRate: '',
              systolicPressure: "",
              diastolicPressure: '',
              date: date[0].time,
              id: '',
              rowMd5: '',
          }],
          DeleteList: [],
      },
      //保存基础数据
      SaveBasicdata() {
          let self = this
          let NewData = self.data.dataArray
          let topNo = false
          let bottomNo = false
          if (self.data.DeleteList.length > 0) {
              self.DeleteDaseDetail()
          }
          //心率组校验
          for (const key in NewData) {
              if (NewData[key].time !== '' || NewData[key].heartRate !== '' || NewData[key].systolicPressure !== '' || NewData[key].diastolicPressure !== '') {
                  if (!NewData[key].time) {
                      wx.showToast({
                          title: '请选择时间',
                          icon: 'none',
                          duration: 3000
                      })
                      return false;
                  } else if (!NewData[key].heartRate) {
                      wx.showToast({
                          title: '请输入心率',
                          icon: 'none',
                          duration: 3000
                      })
                      return false;
                  } else if (!NewData[key].systolicPressure) {
                      wx.showToast({
                          title: '请输入收缩压',
                          icon: 'none',
                          duration: 3000
                      })
                      return false;
                  } else if (!NewData[key].diastolicPressure) {
                      wx.showToast({
                          title: '请输入舒张压',
                          icon: 'none',
                          duration: 3000
                      })
                      return false;
                  }
              } else {
                  topNo = true
              }
          }
          // 宫高组校验
          if (self.data.baseData.fundalHeight || self.data.baseData.abdominalCircumference || self.data.baseData.hba1c) {
              if (!self.data.baseData.fundalHeight) {
                  wx.showToast({
                      title: '请输入宫高',
                      icon: 'none',
                      duration: 3000
                  })
                  return false;
              } else if (!self.data.baseData.abdominalCircumference) {
                  wx.showToast({
                      title: '请输入腹围',
                      icon: 'none',
                      duration: 3000
                  })
                  return false;
              } else if (!self.data.baseData.hba1c) {
                  wx.showToast({
                      title: '请输入糖化血红蛋白',
                      icon: 'none',
                      duration: 3000
                  })
                  return false;
              }
          } else {
              bottomNo = true
          }
          if (bottomNo && topNo) {
              wx.showToast({
                  title: '请输入数据',
                  icon: 'none',
                  duration: 3000
              })
              return false;
          } else if (bottomNo) {
              self.requestSave(NewData)
              return false;
          } else if (topNo) {
              self.requestSave([self.data.baseData])
              return false;
          } else {
              let params = self.deepCopy(NewData)
              params.push(self.data.baseData)
              self.requestSave(params)
              return false;
          }
      },
      requestSave(params) {
          console.log(params);
          let that = this
          request({
              method: "POST",
              url: '/wxrequest',
              data: {
                  "token": wx.getStorageSync('token'),
                  "function": "save",
                  "data": params
              }
          }).then(res => {
              console.log(res, "save");
              if (res.data.code === '0') {
                  wx.showToast({
                      title: res.data.message,
                      icon: 'none',
                      duration: 2000
                  })
                  that.getBasicdata()
              } else {
                  wx.showToast({
                      title: res.data.message,
                      icon: 'none',
                      duration: 2000
                  })
              }
          })
      },
      DeleteDaseDetail() {
          let self = this
          request({
              method: "POST",
              url: '/wxrequest',
              data: {
                  "token": wx.getStorageSync('token'),
                  "function": "delete",
                  "data": self.data.DeleteList
              }
          }).then(res => {
              if (res.data.code === '0') {} else {
                  wx.showToast({
                      title: res.data.message,
                      icon: 'none',
                      duration: 2000
                  })
              }
          })
      },
      //取基础数据
      getBasicdata() {
          let self = this
          request({
              method: "POST",
              url: '/wxrequest',
              data: {
                  "token": wx.getStorageSync('token'),
                  "function": "getBase",
                  "data": [{
                      "date": self.data.dateRecord
                  }]
              }
          }).then(res => {
              if (res.data.code === '0') {
                  let ResData = res.data.data[0]
                      let NewbaseData = self.data.baseData
                      let newArr = self.data.dataArray
                  if (ResData.items.length > 0) {
                      let newArr = ResData.items
                      for (const key in newArr) {
                          newArr[key].entity = "baseDetail"
                          newArr[key].patientId = wx.getStorageSync('patientId')
                          newArr[key].status = 1
                          newArr[key].rowMd5 = newArr[key].rowMd5
                          newArr[key].id = newArr[key].id
                          self.setData({
                              dataArray: newArr,
                              DeleteList: []
                          })
                      }
                  } else {
                      newArr = [{
                          entity: "baseDetail",
                          patientId: wx.getStorageSync('patientId'),
                          status: 1,
                          time: '',
                          heartRate: '',
                          systolicPressure: "",
                          diastolicPressure: '',
                          date: self.data.dateRecord,
                          id: '',
                          rowMd5: '',
                      }]
                      self.setData({
                          dataArray: newArr,
                          DeleteList: []
                      })
                  }
                  if (ResData.hba1c) {
                      NewbaseData.abdominalCircumference = ResData.abdominalCircumference
                      NewbaseData.hba1c = ResData.hba1c
                      NewbaseData.date = ResData.date
                      NewbaseData.id = ResData.id
                      NewbaseData.rowMd5 = ResData.rowMd5
                      NewbaseData.fundalHeight = ResData.fundalHeight
                      NewbaseData.patientId = wx.getStorageSync('patientId')
                      self.setData({
                          baseData: NewbaseData,
                          BasicRowMd5: ResData.rowMd5,
                          DeleteList: []

                      })
                  } else {
                      NewbaseData = {
                              entity: "base",
                              patientId: wx.getStorageSync('patientId'),
                              date: self.data.dateRecord,
                              id: '',
                              rowMd5: '',
                              fundalHeight: "",
                              abdominalCircumference: "",
                              hba1c: "",
                              status: 1,

                          },
                          self.setData({
                              DeleteList: [],
                              baseData: NewbaseData,
                          })
                  }
              } else {
                  wx.showToast({
                      title: res.data.message,
                      icon: 'none',
                      duration: 2000
                  })
              }
          })
      },
      tapHistory() {
          wx.navigateTo({
              url: '../basicDataHistory/basicDataHistory'
          })
      },
      //删除
      delRecord: function (e) {
          let {
              index,
              id,
              rowmd5
          } = e.currentTarget.dataset
          if (id && rowmd5) {
              let NewList = this.data.DeleteList
              NewList.push({
                  entity: "baseDetail",
                  id: id,
                  rowMd5: rowmd5,
              })
              this.setData({
                  DeleteList: NewList
              })
          }
          this.data.dataArray.splice(index, 1)
          this.setData({
              dataArray: this.data.dataArray
          })
      },
      //添加记录列表
      addRecordList() {
          let self = this
          var arr = self.data.dataArray
          arr.push({
              patientId: wx.getStorageSync('patientId'),
              status: 1,
              entity: "baseDetail",
              date: self.data.dateRecord,
              id: '',
              rowMd5: '',
          })
          this.setData({
              dataArray: arr,
          })
      },
      //选择记录时间
      bindRecordDateChange(e) {
          let valDate = e.detail.value
          this.setData({
              RecordDate: moment(valDate).format('YYYY年MM月DD日'),
              dateRecord: valDate
          })
          this.getBasicdata()
      },
      //时间选择器
      bindTimeChange: function (e) {
          let index = Number(e.target.dataset.index)
          let newArray = this.data.dataArray
          let dataObj = e.detail.value;
          newArray[index].time = dataObj
          this.setData({
              dataArray: newArray
          })
      },
      //输入框绑定
      bindHeartRateInput(e) {
          var index = Number(e.target.dataset.index)
          var newArr = this.data.dataArray
          var dataObj = e.detail.value;
          newArr[index].heartRate = dataObj
          this.setData({
              dataArray: newArr
          })
      },
      bindSystolicPreInput(e) {
          var index = Number(e.target.dataset.index)
          var newObj = this.data.dataArray
          var dataObj = e.detail.value;
          newObj[index].systolicPressure = dataObj
          this.setData({
              dataArray: newObj
          })
      },
      bindDiastolicPreInput(e) {
          var index = Number(e.target.dataset.index)
          var newObj = this.data.dataArray
          var dataObj = e.detail.value;
          newObj[index].diastolicPressure = dataObj
          this.setData({
              dataArray: newObj
          })
      },
      //宫高
      bindFundalHeightInput(e) {
          let NewObj = this.data.baseData
          var data = e.detail.value;
          NewObj.fundalHeight = data
          NewObj.date = this.data.dateRecord,
              this.setData({
                  baseData: NewObj
              })
      },
      //糖化血红蛋白
      bindHba1cInput(e) {
          let NewObj = this.data.baseData
          var data = e.detail.value;
          NewObj.hba1c = data
          NewObj.date = this.data.dateRecord
          this.setData({
              baseData: NewObj
          })
      },
      //腹围
      bindAbdominalInput(e) {
          var data = e.detail.value;
          let NewObj = this.data.baseData
          NewObj.abdominalCircumference = data
          NewObj.date = this.data.dateRecord
          this.setData({
              baseData: NewObj
          })
      },
      deepCopy(checkArr) {
          var result = Array.isArray(checkArr) ? [] : {};
          for (var key in checkArr) {
              if (checkArr.hasOwnProperty(key)) {
                  if (typeof checkArr[key] === "object" && checkArr[key] !== null) {
                      result[key] = this.deepCopy(checkArr[key]);
                  } else {
                      result[key] = checkArr[key];
                  }
              }
          }
          return result;
      },
      /**
       * 生命周期函数--监听页面加载
       */
      onLoad: function (options) {
          this.getBasicdata()
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