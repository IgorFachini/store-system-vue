<template>
  <q-input
    ref="inputRef"
    :model-value="modelValue"
    :label="label"
    :class="insideClass"
    :input-class="[inputClass]"
    :disable="disable"
    @update:model-value="onInput"
  />
</template>

<script>
import { QInput } from 'quasar'
import useCurrencyInput from 'vue-currency-input'

export default {
  name: 'CurrencyInput',

  mixins: [QInput],

  props: {
    class: {
      type: String,
      default: ''
    }
  },

  emits: ['update:modelValue', 'change'],
  setup (props) {
    const options = {
      locale: undefined,
      currency: 'BRL',
      currencyDisplay: 'hidden',
      valueRange: undefined,
      precision: undefined,
      hideCurrencySymbolOnFocus: true,
      hideNegligibleDecimalDigitsOnFocus: false,
      autoDecimalDigits: true,
      exportValueAsInteger: false,
      autoSign: true,
      useGrouping: true
    }
    const { inputRef } = useCurrencyInput(options)

    return { inputRef }
  },

  computed: {
    insideClass () {
      return this.class
    }
  },

  watch: {
    modelValue (val) {
      this.$emit('change', val)
    }
  },

  methods: {
    onInput (value) {
      this.$emit('update:modelValue', parseFloat(value.replace(',', '.')))
    }
  }
}
</script>
