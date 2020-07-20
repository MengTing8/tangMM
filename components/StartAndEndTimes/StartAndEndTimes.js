const moment = require('../../utils/moment.min.js');
moment.locale();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        TimeObj: {
            type: Object
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        bindStartTimeChange(e) {
            let val = e.detail.value
            this.triggerEvent('StartTimeChange', {
                value: moment(val).format('YYYY年MM月DD日'),
                date:val
            });
        },
        bindEndTimeChange(e) {
            let val = e.detail.value
            this.triggerEvent('EndTimeChange', {
                value: moment(val).format('YYYY年MM月DD日'),
                date: val
            });
        },
    }
})