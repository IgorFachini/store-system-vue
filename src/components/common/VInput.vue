<template>
  <q-input
    ref="field"
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
    :mask="type === 'date' ? '##/##/####' : mask"
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
    @update:model-value="onInput"
    @change="$emit('change', $event)"
    @blur="$emit('blur')"
  >
    <template
      #append
    >
      <q-icon
        v-if="type === 'date'"
        name="calendar"
        class="cursor-pointer"
      />

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
    </template>

    <template
      v-if="type === 'date'"
      #default
    >
      <q-popup-proxy
        transition-show="scale"
        transition-hide="scale"
      >
        <q-date
          :model-value="modelValue"
          mask="DD/MM/YYYY"
          :disable="disable"
          :readonly="readonly"
          @input="$emit('update:modelValue', $event)"
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

export default {
  name: 'VInput',

  mixins: [QInput],

  props: {
    successRules: Boolean,
    date: Boolean,
    allowEmptySuccessRules: Boolean,

    qStyle: {
      type: [String, Array, Object],
      default: ''
    },

    tabindex: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'change', 'blur'],

  data () {
    return {
      mounted: false,
      typeField: '',
      showPassword: false,
      hasErrorCheck: false
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

  watch: {
    showPassword (modelValue) {
      this.typeField = modelValue ? 'text' : 'password'
    },
    type (modelValue) {
      this.typeField = modelValue
    },

    modelValue (v) {
      this.checkError(v)
    }
  },

  mounted () {
    this.mounted = true
    this.typeField = this.type === 'date' ? 'text' : this.type
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
      const hasError = Array.isArray(this.rules) ? this.rules.find((rule) => rule(modelValue) === false || typeof rule(modelValue) === 'string') : false

      this.hasErrorCheck = Boolean(hasError)
    },
    onInput (modelValue) {
      this.$emit('update:modelValue', modelValue)
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
