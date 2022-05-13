<template>
  <q-form
    ref="form"
    class="full-width"
    @submit="save"
  >
    <q-input
      v-model="form.name"
      :label="$t('name')"
      :rules="[
        val => val && val.length || $t('fillTheField', { field: $t('name') }),
        val => !!form.id && nameBefore === val || (!expenseProducts.map(c => c.name.toLowerCase()).includes(val.toLowerCase()) || $t('alredyExist'))
      ]"
      :disable="viewMode"
    />

    <v-select
      v-model="form.weightType"
      reactive-rules
      :loading="loading"
      autocomplete
      sorted
      :label="$t('weightType')"
      :options="['GR', 'ML', 'UN']"
      :rules="[ val => val && val.length ]"
      :disable="viewMode"
    />

    <q-input
      v-model="form.description"
      type="textarea"
      :label="$t('description')"
      :disable="viewMode"
    />

    <div class="row q-gutter-md q-mt-md justify-between">
      <q-btn
        label="Reset"
        @click="reset"
      />
      <q-btn
        :label="$t('save')"
        type="submit"
        color="positive"
      />
    </div>
  </q-form>
</template>

<script>

import { Notify } from 'quasar'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ExpenseProductsForm',

  emits: ['done'],

  setup () {
    return {
      modelForm: {
        name: '',
        description: '',
        weightTYpe: ''
      }
    }
  },

  data () {
    return {
      firebaseMixinInstance: null,
      form: {},
      loading: false,
      expenseProducts: [],
      nameBefore: '',
      viewMode: false
    }
  },

  created () {
    this.form = { ...this.modelForm }
  },

  mounted () {
    this.loading = true
    this.firebaseMixinInstance = this.firebaseMixin('expenseProducts')

    this.firebaseMixinInstance.bindField('expenseProducts').finally(() => {
      this.loading = false
      if (this.$route.params.id) {
        this.checkExists(this.$route.params.id)
      }
    })
  },

  methods: {
    reset () {
      this.viewMode = false
      this.form = { ...this.modelForm }
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
    },
    save () {
      const ref = this.firebaseMixinInstance
      const action = this.form.id
        ? ref.id(this.form.id).update : ref.add
      action(this.form).catch((err) => {
        console.log('err', err)
      })
      Notify.create({
        message: this.$t('savedOperation'),
        color: 'positive',
        closeBtn: true
      })
      this.reset()
      this.$emit('done')
    },
    checkExists (id) {
      const row = this.expenseProducts.find(p => p.id === id)

      if (!row) {
        Notify.create({
          message: this.$t('notExist'),
          color: 'negative',
          closeBtn: true
        })
        this.$router.push('/expense-products')
        return
      }
      const isView = this.$route.name === 'expense-products.view'
      this[isView ? 'view' : 'edit'](row)
    },
    edit (row) {
      this.viewMode = false
      this.nameBefore = row.name
      this.form = { ...row, id: row.id }
    },

    view (row) {
      this.viewMode = true
      this.nameBefore = row.name
      this.form = { ...row, id: row.id }
    }
  }
})
</script>
