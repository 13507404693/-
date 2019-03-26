// components/tab/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array,
      value: []
    },
    selectedId: {
      type: [String, Number],
      value: ''
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
    handleTabChange(e) {
      var selectedId = e.currentTarget.dataset.id
      this.setData({
        selectedId: selectedId
      })
      this.triggerEvent('tabchange', selectedId)
    },
  }
})
