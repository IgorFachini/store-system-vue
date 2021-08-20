<template>
  <q-page class="flex flex-center">
    <v-input
      v-model="modelData"
      :label="$t('date')"
      date
      range
      @update:model-value="t"
    />
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    >
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageIndex',

  data () {
    return {
      modelData: {
        from: '',
        to: ''
      }
    }
  },

  watch: {
    modelData (val) {
      console.log('val', val)
    }
  },

  methods: {
    t (t) {
      console.log('t', t)
    }
  }
})
</script>
