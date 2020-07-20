// components/Tabs/Tabs.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        tabs: {
            type: Array,
            value: []
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        TabsIndex: 0,
    },
    methods: {
        // 标题的点击事件
        handleTitleChange(e) {
            const {
                index
            } = e.currentTarget.dataset;
            this.setData({
                TabsIndex: index
            })
            // 触发父组件中的自定义事件
            this.triggerEvent("titleChange", {
                index
            });
        }
    }
})