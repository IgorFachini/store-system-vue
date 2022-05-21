import { mapWritableState } from 'pinia'
import { useMainStore } from 'stores/main'

export default {
  data () {
    return {
      render: true
    }
  },
  computed: {
    ...mapWritableState(useMainStore, ['globalLoading']),
    isMobile () {
      return this.$q.screen.lt.sm
    },
    isTablet () {
      return this.$q.screen.sm
    },
    isDesktop () {
      return this.$q.screen.gt.sm
    }
  },
  watch: {
    isMobile () {
      this.forceRerender()
    },

    isTablet () {
      this.forceRerender()
    }
  },
  methods: {
    forceRerender () {
      this.render = false

      return new Promise((resolve) => {
        this.$nextTick(() => {
          this.render = true
          resolve()
        })
      })
    }
  }
}
