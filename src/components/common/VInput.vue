<template>
  <q-input
    ref="inputRef"
    :model-value="dataLabel"
    :clearable="clearable"
    :lazy-rules="lazyRules"
    :counter="counter"
    :type="typeField"
    :maxlength="maxlength"
    :loading="loading"
    :label="label"
    :filled="filled"
    :disable="disable"
    :readonly="readonly || range"
    :mask="date && !range ? '####/##/## ##:##' : mask"
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
    @update:model-value="val => onInput(val, true)"
    @change="$emit('change', $event)"
    @blur="$emit('blur')"
  >
    <template #prepend>
      <q-icon
        v-if="date"
        name="event"
        class="cursor-pointer"
      >
        <q-popup-proxy
          cover
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            :model-value="cValue"
            :mask="range ? 'YYYY/MM/DD' : 'YYYY/MM/DD HH:mm'"
            today-btn
            :disable="disable"
            :readonly="readonly"
            :range="range"
            @update:model-value="onInput"
            @change="$emit('change', $event)"
            @blur="$emit('blur')"
            @range-start="$emit('range-start', $event)"
            @range-end="$emit('range-end', $event)"
          >
            <div class="row items-center justify-end">
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
        v-if="date && !range"
        name="access_time"
        class="cursor-pointer"
      >
        <q-popup-proxy
          cover
          transition-show="scale"
          transition-hide="scale"
        >
          <q-time
            :model-value="cValue"
            mask="YYYY/MM/DD HH:mm"
            :disable="disable"
            :readonly="readonly"
            format24h
            now-btn
            @update:model-value="onInput"
            @change="$emit('change', $event)"
            @blur="$emit('blur')"
          >
            <div class="row items-center justify-end">
              <q-btn
                v-close-popup
                :label="$q.lang.label.close"
                color="primary"
                flat
              />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
      <q-btn
        v-if="clearable && cValue"
        icon="close"
        color="primary"
        flat
        @click="clear"
      />
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
    range: Boolean,
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
  emits: ['update:model-value', 'change', 'blur', 'range-start', 'range-end'],
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
    dataLabel () {
      return this.range
        ? this.modelValue && this.modelValue.from ? `${this.modelValue.from} - ${this.modelValue.to}` : 'YYYY/MM/DD - YYYY/MM/DD'
        : this.cValue
    },
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
      this.$emit('change', this.currency ? currencyToFloat(this.cValue) : this.cValue)
      this.checkError(v)
    }
  },

  mounted () {
    this.mounted = true
    this.cValue = this.currency ? toBRLCurrency(this.modelValue).replace('R$', '') : this.modelValue
    this.checkError()
    useFormChild({ validate: this.validate, resetValidation: this.field.resetValidation, requiresQForm: false })
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
    onInput (modelValue, isInput) {
      if (this.currency) {
        this.cValue = String(modelValue).replace(/\./g, '') || '0'
        modelValue = currencyToFloat(modelValue)
      }
      this.$emit('update:model-value', this.type === 'number' ? Number(modelValue) : modelValue)
    },
    clear () {
      this.cValue = ''
      this.$emit('update:model-value', '')
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
