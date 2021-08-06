<template>
  <q-input
    ref="inputRef"
    :model-value="modelValue"
    :label="label"
    @update:model-value="onInput"
  />
</template>

<script>
import { QInput } from 'quasar'
import useCurrencyInput from 'vue-currency-input'

export default {
  name: 'CurrencyInput',

  mixins: [QInput],

  emits: ['update:modelValue'],
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

  methods: {
    onInput (value) {
      this.$emit('update:modelValue', value)
    }
  }
}
</script>
