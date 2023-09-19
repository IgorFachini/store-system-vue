<template>
  <q-input
    ref="field"
    inputmode="numeric"
    :model-value="cValue"
    :clearable="clearable"
    :lazy-rules="lazyRules"
    :counter="counter"
    :maxlength="maxlength"
    :loading="loadingInside"
    :label="label"
    :filled="filled"
    :disable="disable"
    :readonly="readonly"
    mask="#####-###"
    :style="qStyle"
    :autofocus="autofocus"
    :autogrow="autogrow"
    :hide-bottom-space="hideBottomSpace"
    :input-class="[inputClass]"
    :outlined="outlined"
    :tabindex="tabindex"
    :hint="hint"
    :rules="[
      val => !val || (isCepValid || `${$t('errorLocating')} CEP`),
      val => !val || (validateCEP(val) || `CEP ${$t('invalid')}`)
    ]"
    @update:model-value="onInput"
    @change="$emit('change', $event)"
    @blur="$emit('blur')"
  >
    <template #after>
      <q-btn
        icon="download"
        :label="$t('find')"
        :disable="disable"
        :loading="loadingInside"
        @click="load"
      />
    </template>
  </q-input>
</template>
<script>
import CepService from 'services/Cep'
import { useFormChild, QInput } from 'quasar'

export default {
  name: 'VInputCep',

  mixins: [QInput],

  props: {
    qStyle: {
      type: [String, Array, Object],
      default: ''
    },

    tabindex: {
      type: String,
      default: ''
    }
  },

  emits: ['update:modelValue', 'change', 'blur', 'response', 'error'],

  data () {
    return {
      mounted: false,
      showPassword: false,
      hasErrorCheck: false,
      loadingInside: false,
      isCepValid: true
    }
  },

  computed: {
    cValue () {
      return this.modelValue
    },

    field () {
      if (this.mounted) {
        return this.$refs.field
      }
      return {}
    }
  },

  mounted () {
    this.mounted = true
    useFormChild({ validate: this.validate, resetValidation: this.field.resetValidation, requiresQForm: true })
  },

  methods: {
    load () {
      this.loadingInside = true

      CepService.get(this.modelValue.replace('-', ''))
        .then((res) => {
          if (res.data.erro) {
            this.isCepValid = false
            return this.$emit('error', res.data.erro)
          }

          this.isCepValid = true
          this.$emit('response', res.data)
        })
        .catch((err) => {
          this.isCepValid = false
          this.$emit('error', err)
        })
        .finally(() => {
          this.loadingInside = false
          this.$refs.field.validate()
        })
    },
    validate () {
      return this.field.validate()
    },
    validateCEP (val) {
      return /[0-9]{5}-[\d]{3}/.test(val)
    },
    onInput (modelValue) {
      this.$emit('update:modelValue', modelValue)
    }
  }
}
</script>
