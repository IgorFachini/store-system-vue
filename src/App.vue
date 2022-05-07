<template>
  <router-view />
</template>
<script>
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar, Dialog } from 'quasar'

export default defineComponent({
  name: 'App',

  setup () {
    const { locale } = useI18n({ useScope: 'global' })
    return {
      locale
    }
  },

  data () {
    return {
      newWorker: null
    }
  },

  mounted () {
    this.$q = useQuasar()
    this.locale = this.$q.lang.getLocale()
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration('/service-worker.js').then(reg => {
        reg.addEventListener('updatefound', () => {
        // A wild service worker has appeared in reg.installing!
          this.newWorker = reg.installing

          this.newWorker.addEventListener('statechange', () => {
          // Has network.state changed?
            switch (this.newWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                // new update available
                  this.showHasUpdate()
                }
                // No update available
                break
            }
          })
        })
      })
    }
  },

  methods: {
    showHasUpdate () {
      Dialog.create({
        title: this.$t('newUpdateAvailable'),
        cancel: true,
        ok: {
          label: this.$t('update')
        },
        persistent: true,
        position: 'bottom'
      }).onOk(() => {
        window.location.reload()
      })
    }
  }
})
</script>
