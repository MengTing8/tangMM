const moment = require('../../utils/moment.min.js');
moment.locale();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        pickerObj: {
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
        bindDateChange(e) {
            let val = e.detail.value
            this.triggerEvent('DateChange', {
                value: moment(val).format('YYYY年MM月DD日'),
                date: val,
            });
        },
        DeleteByDate(e) {
            let val = e.currentTarget.dataset.date
            this.triggerEvent('DeleteByDate', {
                date: val,
            });
        },
    }
})