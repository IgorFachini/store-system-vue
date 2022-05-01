<template>
  <router-view />
</template>
<script>
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
export default defineComponent({
  name: 'App',

  setup () {
    const { locale } = useI18n({ useScope: 'global' })
    return {
      locale
    }
  },

  mounted () {
    this.$q = useQuasar()
    this.locale = this.$q.lang.getLocale()
  }
})
</script>
