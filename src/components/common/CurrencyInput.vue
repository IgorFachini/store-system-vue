<template>
  <q-input
    ref="inputRef"
    :model-value="cValue"
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
import { currencyToFloat, toBRLCurrency } from 'utils/'

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
      locale: 'de-DE',
      currency: 'EUR',
      currencyDisplay: 'hidden',
      valueRange: undefined,
      precision: undefined,
      hideCurrencySymbolOnFocus: true,
      hideGroupingSeparatorOnFocus: false,
      hideNegligibleDecimalDigitsOnFocus: false,
      autoDecimalDigits: true,
      exportValueAsInteger: false,
      autoSign: true,
      useGrouping: false
    }
    const { inputRef } = useCurrencyInput(options)

    return { inputRef }
  },

  data () {
    return {
      cValue: '0'
    }
  },

  computed: {
    insideClass () {
      return this.class
    }
  },

  watch: {
    modelValue (val) {
      this.cValue = toBRLCurrency(val).replace('R$', '')
      this.$emit('change', val)
    }
  },

  methods: {
    onInput (value) {
      this.cValue = String(value).replace(/\./g, '') || '0'
      const cValue = currencyToFloat(value)
      this.$emit('update:modelValue', cValue)
    }
  }
}
</script>
