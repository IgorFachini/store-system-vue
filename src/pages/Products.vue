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
        <q-input
          v-model="form.name"
          :label="$t('name')"
          :rules="[
            val => val && val.length || $t('fillTheField', { field: $t('name') }),
            val => !!form.id && nameBefore === val || (!products.map(c => c.name).includes(val) || $t('alredyExist'))]"
        />

        <q-input
          v-model="form.description"
          type="textarea"
          :label="$t('description')"
        />

        <currency-input
          v-model="form.saleValue"
          :label="$t('saleValue')"
        />

        <v-select
          v-model="form.category"
          :loading="loading"
          autocomplete
          sorted
          :label="$t('category')"
          :options="categories.map(c => c.name)"
        />

        <q-input
          v-model="form.code"
          type="number"
          :label="$t('code')"
        />

        <q-input
          v-model="form.currentInventory"
          type="number"
          :label="$t('currentInventory')"
        />

        <currency-input
          v-model="form.purchasePrice"
          :label="$t('purchasePrice')"
        />

        <div class="row q-gutter-md q-mt-md">
          <q-btn
            :label="$t('save')"
            type="submit"
            color="positive"
          />
          <q-btn
            label="Reset"
            @click="reset"
          />
        </div>
      </q-form>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-8">
      <q-table
        v-model:pagination="pagination"
        :title="$tc('product', 2)"
        class="full-width"
        :rows="products"
        :columns="columns"
        style="height: calc(100vh - 100px)"
        binary-state-sort
        :loading="loading"
        :filter="filter"
        :rows-per-page-label="$t('recordsPerPage')"
      >
        <template #top-right>
          <q-input
            v-model="filter"
            borderless
            dense
            debounce="300"
            :placeholder="$t('search')"
          >
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template #body-cell-action="{ row }">
          <q-td>
            <div class="row no-wrap q-gutter-md">
              <q-btn
                :label="$t('edit')"
                dense
                color="primary"
                @click="edit(row)"
              />
              <q-btn
                :label="$t('delete')"
                dense
                color="negative"
                :loading="row.loading"
                @click="deleteAction(row)"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>

import { date } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date
import CurrencyInput from 'components/common/CurrencyInput.vue'
import VSelect from 'components/common/VSelect.vue'

export default defineComponent({
  name: 'Products',

  components: {
    CurrencyInput,
    VSelect
  },

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
      filter: '',
      pagination: {
        page: 1,
        rowsPerPage: 5,
        sortBy: 'updatedAt',
        descending: true
      },
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
      this.$bind('products', this.firebaseMixinInstance.ref()),
      this.$bind('categories', this.firebaseMixin('categories').ref())
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
      row.loading = true
      this.firebaseMixinInstance.id(row.id).delete().finally(() => {
        row.loading = false
      })
    }
  }
})
</script>
