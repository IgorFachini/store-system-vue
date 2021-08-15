<template>
  <q-input
    ref="inputRef"
    :model-value="cValue"
    :clearable="clearable"
    :lazy-rules="lazyRules"
    :counter="counter"
    :type="typeField"
    :maxlength="maxlength"
    :loading="loading"
    :label="label"
    :filled="filled"
    :disable="disable"
    :readonly="readonly"
    :mask="date ? '##/##/##' : mask"
    :reverse-fill-mask="reverseFillMask"
    :style="qStyle"
    :autofocus="autofocus"
    :autogrow="autogrow"
    :hide-bottom-space="hideBottomSpace"
    :input-class="[{'text-primary': successRules && !error }, inputClass]"
    :outlined="outlined"
    :tabindex="tabindex"
    :hint="hint"
    :rules="rules"
    :class="insideClass"
    :reactive-rules="reactiveRules"
    step="any"
    @update:model-value="onInput"
    @change="$emit('change', $event)"
    @blur="$emit('blur')"
  >
    <template
      #append
    >
      <q-icon
        v-if="type==='password'"
        :name="showPassword ? `visibility` : `visibility_off`"
        class="cursor-pointer"
        @click="showPassword = !showPassword"
      />

      <q-icon
        v-if="(!disable && !readonly) && successRules && !error && !hasErrorCheck"
        name="check"
        color="primary"
      />

      <q-icon
        v-if="date"
        name="event"
        class="cursor-pointer"
      >
        <q-popup-proxy
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            :model-value="cValue"
            mask="DD/MM/YY"
            :disable="disable"
            :readonly="readonly"
            @update:model-value="onInput"
            @change="$emit('change', $event)"
            @blur="$emit('blur')"
          >
            <div
              class="row items-center justify-end"
            >
              <q-btn
                v-close-popup
                :label="$q.lang.label.close"
                color="primary"
                flat
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>

    <template
      v-for="propSlot in Object.keys($slots)"
      #[propSlot]="props"
    >
      <slot
        :name="propSlot"
        v-bind="props"
      />
    </template>
  </q-input>
</template>
<script>
import { useFormChild, QInput } from 'quasar'
import { currencyToFloat, toBRLCurrency } from 'utils/'
import useCurrencyInput from 'vue-currency-input'

export default {
  name: 'VInput',

  mixins: [QInput],

  props: {
    successRules: Boolean,
    date: Boolean,
    currency: Boolean,

    class: {
      type: String,
      default: ''
    },

    qStyle: {
      type: [String, Array, Object],
      default: ''
    },

    tabindex: {
      type: String,
      default: ''
    }
  },
  emits: ['update:model-value', 'change', 'blur'],
  setup (props) {
    if (props.currency) {
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
    }
    return {}
  },

  data () {
    return {
      mounted: false,
      cValue: '',
      showPassword: false,
      hasErrorCheck: false
    }
  },

  computed: {
    typeField () {
      return this.showPassword ? 'text' : this.type
    },
    insideClass () {
      return this.class
    },

    field () {
      if (this.mounted) {
        return this.$refs.inputRef
      }
      return {}
    }
  },

  watch: {
    showPassword (modelValue) {
      this.typeField = modelValue ? 'text' : 'password'
    },

    type (modelValue) {
      this.typeField = modelValue
    },

    modelValue (v) {
      this.cValue = this.currency ? toBRLCurrency(v).replace('R$', '') : v
      this.checkError(v)
    }
  },

  mounted () {
    this.mounted = true
    this.cValue = this.currency ? toBRLCurrency(this.modelValue).replace('R$', '') : this.modelValue
    this.checkError()
    useFormChild({ validate: this.validate, resetValidation: this.field.resetValidation, requiresQForm: true })
  },

  methods: {
    validate () {
      this.checkError()
      return this.field.validate()
    },
    checkError (v) {
      const modelValue = v || this.modelValue
      const hasError = Array.isArray(this.rules) ? this.rules.find((rule) => typeof rule === 'string' ? false : rule(modelValue) === false || typeof rule(modelValue) === 'string') : false

      this.hasErrorCheck = Boolean(hasError)
    },
    onInput (modelValue) {
      if (this.currency) {
        this.cValue = String(modelValue).replace(/\./g, '') || '0'
        modelValue = currencyToFloat(modelValue)
      }
      this.$emit('update:model-value', this.type === 'number' ? Number(modelValue) : modelValue)
    }
  }
}
</script>
<style lang="scss">
  .q-field__bottom--animated > .q-field__messages {
    height: auto;
    min-height: 16px !important;
  }

  .q-field__bottom--animated {
    transform: none;
    position: static;
  }

 .q-position-engine > .q-date {
    min-width: inherit;
  }

</style>
