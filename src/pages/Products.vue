<template>
  <q-page
    class="row q-col-gutter-md"
    padding
  >
    <div class="col-xs-12 col-sm-12 col-md-4">
      <q-form
        ref="form"
        @submit="save"
      >
        <v-input
          v-model="form.name"
          :label="$t('name')"
          :rules="[
            val => val && val.length || $t('fillTheField', { field: $t('name') }),
            val => !!form.id && nameBefore === val || (!products.map(c => c.name).includes(val) || $t('alredyExist'))]"
        />

        <v-input
          v-model="form.description"
          type="textarea"
          :label="$t('description')"
        />

        <v-input
          v-model="form.saleValue"
          :label="$t('saleValue')"
          currency
        />

        <v-select
          v-model="form.category"
          :loading="loading"
          autocomplete
          sorted
          :label="$t('category')"
          :options="categories.map(c => c.name)"
        />

        <v-input
          v-model="form.code"
          type="number"
          :label="$t('code')"
        />

        <v-input
          v-model="form.currentInventory"
          type="number"
          :label="$t('currentInventory')"
        />

        <v-input
          v-model="form.purchasePrice"
          :label="$t('purchasePrice')"
          currency
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
    </div>
    <div class="col-xs-12 col-sm-12 col-md-8">
      <v-table-crud
        :title="$tc('product', 2)"
        :rows="products"
        :columns="columns"
        :loading="loading"
        @edit="edit"
        @delete="deleteAction"
      />
    </div>
  </q-page>
</template>

<script>

import { date, Dialog } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date

export default defineComponent({
  name: 'Products',

  setup () {
    return {
      modelForm: {
        name: '',
        description: '',
        saleValue: 0,
        category: '',
        code: '',
        currentInventory: 0,
        purchasePrice: 0
      }
    }
  },

  data () {
    return {
      form: {},
      loading: false,
      saving: false,
      products: [],
      firebaseMixinInstance: null,
      categories: [],
      nameBefore: ''
    }
  },

  computed: {
    columns () {
      return [
        { name: 'name', label: this.$t('name'), field: 'name', sortable: true },
        { name: 'description', label: this.$t('description'), field: 'description' },
        { name: 'saleValue', label: this.$t('saleValue'), field: 'saleValue', sortable: true },
        {
          name: 'category',
          label: this.$t('category'),
          field: 'category',
          format: category => category ? category.name : '',
          sortable: true
        },
        { name: 'code', label: this.$t('code'), field: 'code' },
        { name: 'currentInventory', label: this.$t('currentInventory'), field: 'currentInventory', sortable: true },
        { name: 'purchasePrice', label: this.$t('purchasePrice'), field: 'purchasePrice', sortable: true },
        {
          name: 'createdAt',
          label: this.$t('createdAt'),
          field: 'createdAt',
          format: val => formatDate(val ? val.toDate() : '', 'DD/MM/YYYY'),
          sortable: true
        },
        {
          name: 'updatedAt',
          label: this.$t('updatedAt'),
          field: ({ updatedAt = null }) => updatedAt ? formatDate(updatedAt.toDate(), 'DD/MM/YYYY') : '',
          sortable: true
        },
        { name: 'action', label: this.$t('action'), align: 'left' }
      ]
    }
  },

  created () {
    this.form = { ...this.modelForm }
  },

  mounted () {
    this.loading = true
    this.firebaseMixinInstance = this.firebaseMixin('products')
    Promise.all([
      this.firebaseMixinInstance.bindField('products'),
      this.firebaseMixin('categories').bindField('categories')
    ])
      .finally(() => {
        this.loading = false
      })
  },

  methods: {
    setAdress ({ logradouro, bairro, localidade, uf }) {
      this.form.publicPlace = logradouro
      this.form.district = bairro
      this.form.city = localidade
      this.form.state = uf
    },
    reset () {
      this.form = { ...this.modelForm }
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
    },
    save () {
      const ref = this.firebaseMixinInstance
      if (this.form.category) {
        const idCategory = this.categories.find(c => c.name === this.form.category).id
        this.form.category = this.firebaseMixin('categories').id(idCategory).doc()
      }
      const action = this.form.id
        ? ref.id(this.form.id).update : ref.add
      action(this.form).catch((err) => {
        console.log('err', err)
      })
      this.reset()
    },
    edit (row) {
      this.form = { ...row, id: row.id, category: row.category ? row.category.name : '' }
      this.nameBefore = row.name
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
    },

    deleteAction (row) {
      Dialog.create({
        title: `${this.$q.lang.label.remove} ${this.$t('product')}`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        row.loading = true
        this.firebaseMixinInstance.id(row.id).delete().finally(() => {
          row.loading = false
        })
      })
    }
  }
})
</script>
