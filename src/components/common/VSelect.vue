<template>
  <q-select
    ref="field"
    :model-value="modelValue"
    map-options
    emit-value
    :input-debounce="inputDebounce"
    :use-input="autocomplete"
    :lazy-rules="lazyRules"
    :filled="filled"
    :clearable="clearable"
    :outlined="outlined"
    :disable="disable"
    :readonly="readonly"
    :label="label"
    :label-color="labelColor"
    :options="filteredOpts"
    :loading="loading"
    :rules="rules"
    :hint="hint"
    :input-class="[inputClass]"
    :class="insideClass"
    @clear="$emit('input-value', ''), $emit('clear', '')"
    @filter="filterQSelect"
    @update:model-value="$emit('update:model-value', $event)"
    @input-value="$emit('input-value', $event)"
    @change="$emit('change', $event)"
    @blur="$emit('blur')"
  >
    <template #no-option>
      <q-item>
        <q-item-section class="text-grey">
          Sem resultados.
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
<script>
import { useFormChild, QSelect } from 'quasar'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'VSelect',

  mixins: [QSelect],

  props: {
    sorted: Boolean,
    autocomplete: Boolean,

    class: {
      type: String,
      default: ''
    },

    options: {
      type: Array,
      default: null
    }
  },

  emits: ['blur', 'change', 'clear', 'input-value', 'filter', 'update:model-value'],

  data () {
    return {
      selectModel: null,
      filteredOpts: [],
      selectOpts: []
    }
  },

  computed: {
    insideClass () {
      return this.class
    },
    field () {
      if (this.mounted) {
        return this.$refs.field
      }
      return {}
    }
  },

  watch: {
    loading () {
      this.setup()
    },

    value () {
      this.isValid = true
    }
  },

  created () {
    this.setup()
  },

  mounted () {
    this.mounted = true
    useFormChild({ validate: this.validate, resetValidation: this.field.resetValidation, requiresQForm: true })
  },

  methods: {
    validate () {
      return this.field.validate()
    },
    setup () {
      const options = this.sorted ? this.sort(this.options) : this.options

      this.selectOpts = options
      this.filteredOpts = options
    },

    sort (opts = []) {
      try {
        return [...opts].sort((a, b) => (a.label || a).localeCompare((b.label || b)))
      } catch {
        return opts
      }
    },

    filter (opts = [], value) {
      try {
        return opts.filter(v => (v.label || v).toLowerCase().startsWith(value.toLowerCase()))
      } catch {
        return opts
      }
    },

    filterQSelect (value, update) {
      this.$emit('filter', value)
      update(() => {
        if (value === '') {
          this.filteredOpts = this.sorted ? this.sort(this.selectOpts) : this.selectOpts
        } else {
          this.filteredOpts = this.sorted ? this.sort(this.filter(this.selectOpts, value)) : this.filter(this.selectOpts, value)
        }
      })
    }
  }
})
</script>
