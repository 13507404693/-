// components/popup/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    overlay: {
      type: Boolean,
      value: true
    },
    closeOnClickOverlay: {
      type: Boolean,
      value: true
    },
    type: {
      type: String,
      value: 'center'
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
    handleMaskClick: function handleMaskClick() {
      this.triggerEvent('click-overlay', {})
      if (!this.data.closeOnClickOverlay) {
        return
      }
      this.triggerEvent('close', {})
    }
  }
})
