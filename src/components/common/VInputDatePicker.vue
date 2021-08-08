<template>
  <q-input
    ref="field"
    type="text"
    mask="##/##/##"
    class="q-py-none"
    :clearable="clearable"
    :label="label"
    :model-value="modelValue"
    :readonly="readonly"
    :disable="disable"
    :loading="loading"
    :rules="rules"
    :hint="hint"
    :outlined="outlined"
    @clear="$emit('update:model-value', ''), $emit('change', '')"
    @update:model-value="$emit('update:model-value', $event)"
    @change="$emit('change', $event)"
    @blur="$emit('blur')"
  >
    <template #append>
      <q-icon
        name="event"
        class="cursor-pointer"
      >
        <q-popup-proxy
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            :model-value="modelValue"
            mask="DD/MM/YY"
            :disable="disable"
            :readonly="readonly"
            @update:model-value="$emit('update:model-value', $event)"
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
  </q-input>
</template>
<script>
import { useFormChild, QInput, QDate } from 'quasar'

export default {

  mixins: [QInput, QDate],
  emits: ['blur', 'change', 'clear', 'update:model-value'],

  computed: {
    cLoading () {
      return this.loading || this.selectLoading
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
    validate () {
      return this.field.validate()
    }
  }
}
</script>
