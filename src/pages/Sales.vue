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
        <v-input-date-picker
          v-model="form.date"
          :label="$t('date')"
          :rules="['date']"
        />

        <v-select
          v-model="form.customer"
          :loading="loading"
          autocomplete
          sorted
          :label="$t('customer')"
          :options="customersOptions"
        />

        <q-input
          v-model="form.observation"
          type="textarea"
          :label="$t('observation')"
        />

        <q-card
          class="col-12"
        >
          <q-card-section>
            <div class="text-h6">
              {{ $tc('product', 2) }}
            </div>
          </q-card-section>
          <q-separator />

          <q-card-section>
            <q-form
              ref="productForm"
              @submit="saveProduct"
            >
              <v-select
                v-model="productForm.id"
                reactive-rules
                class="col-12"
                :loading="loading"
                autocomplete
                sorted
                :label="$t('product')"
                :options="productsOptions"
                :rules="[ val => !productForm.quantity || !!val.length ]"
              />
              <q-input
                v-model="productForm.quantity"
                reactive-rules
                class="col-6"
                type="number"
                :label="$t('quantity')"
                :rules="[ val => (productForm.id.length && val > 0) || !productForm.id ]"
              />

              <currency-input
                v-model="productForm.unitaryValue"
                class="col-6"
                :label="$t('unitaryValue')"
              />

              <q-btn
                :label="$t('add')"
                :disable="!productForm.id"
                type="submit"
                color="positive"
              />
              <q-btn
                label="Reset"
                @click="resetProduct"
              />
            </q-form>
          </q-card-section>

          <q-separator
            inset
          />

          <q-card-section>
            <q-list
              bordered
              separator
            >
              <product-sale-info
                v-for="product in form.products"
                :key="product.id"
                :product="product"
                @remove="val => form.products = form.products.filter(p => p.id !== val.id)"
              />
            </q-list>
          </q-card-section>
        </q-card>

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
        :title="$tc('sale', 2)"
        class="full-width"
        :rows="sales"
        :columns="columns"
        style="height: calc(100vh - 100px)"
        binary-state-sort
        :loading="loading"
        :filter="filter"
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
import VInputDatePicker from 'components/common/VInputDatePicker.vue'
import ProductSaleInfo from 'components/product/ProductSaleInfo.vue'

export default defineComponent({
  name: 'Sales',

  components: {
    CurrencyInput,
    VSelect,
    VInputDatePicker,
    ProductSaleInfo
  },

  setup () {
    return {
      modelForm: {
        date: '',
        name: '',
        description: '',
        saleValue: 0,
        customer: '',
        code: '',
        currentInventory: 0,
        purchasePrice: 0,
        products: []
      },
      modelProductForm: {
        id: '',
        quantity: 0,
        unitaryValue: 0
      }
    }
  },

  data () {
    return {
      filter: '',
      productForm: {},
      pagination: {
        page: 1,
        rowsPerPage: 5,
        sortBy: 'updatedAt',
        descending: true
      },
      form: {},
      loading: false,
      saving: false,
      sales: [],
      firebaseMixinInstance: null,
      customers: [],
      products: [],
      nameBefore: ''
    }
  },

  computed: {
    customersOptions () {
      return this.customers.map(c => ({ label: c.name, value: c.id }))
    },
    productsOptions () {
      return this.products.map(c => ({ label: c.name, value: c.id }))
    },
    columns () {
      return [
        { name: 'name', label: this.$t('name'), field: 'name', sortable: true },
        { name: 'description', label: this.$t('description'), field: 'description' },
        { name: 'saleValue', label: this.$t('saleValue'), field: 'saleValue', sortable: true },
        {
          name: 'customer',
          label: this.$t('customer'),
          field: 'customer',
          format: customer => {
            const c = this.customers.find(c => c.id === customer)
            if (c) return c.name
          },
          sortable: true
        },
        { name: 'code', label: this.$t('code'), field: 'code' },
        { name: 'currentInventory', label: this.$t('currentInventory'), field: 'currentInventory', sortable: true },
        { name: 'purchasePrice', label: this.$t('purchasePrice'), field: 'purchasePrice', sortable: true },
        {
          name: 'createdAt',
          label: this.$t('createdAt'),
          field: 'createdAt',
          format: val => formatDate(val, 'DD/MM/YYYY'),
          sortable: true
        },
        {
          name: 'updatedAt',
          label: this.$t('updatedAt'),
          field: ({ updatedAt = null }) => updatedAt ? formatDate(updatedAt, 'DD/MM/YYYY') : '',
          sortable: true
        },
        { name: 'action', label: this.$t('action'), align: 'left' }
      ]
    }
  },

  created () {
    this.modelForm.date = formatDate(Date.now(), 'DD/MM/YY')
    this.form = { ...this.modelForm }
    this.productForm = { ...this.modelProductForm }
  },

  mounted () {
    this.loading = true
    this.firebaseMixinInstance = this.firebaseMixin('sales', true)
    Promise.all([
      this.firebaseMixinInstance.bindField('sales'),
      this.firebaseMixin('customers').bindField('customers'),
      this.firebaseMixin('products').bindField('products')
    ])
      .finally(() => {
        this.loading = false
      })
  },

  methods: {
    t (a) {
      console.log('a', a)
    },
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
    resetProduct () {
      this.productForm = { ...this.modelProductForm }
      this.$nextTick(() => {
        this.$refs.productForm.resetValidation()
      })
    },
    save () {
      const ref = this.firebaseMixinInstance
      const action = this.form.id
        ? ref.id(this.form.id).update : ref.add
      action(this.form).catch((err) => {
        console.log('err', err)
      })
      this.reset()
    },
    saveProduct () {
      console.log('t', this.productForm)
      this.form.products.push(this.productForm)
      this.resetProduct()
    },
    edit (row) {
      this.form = { ...row, id: row['.key'] }
      this.nameBefore = row.name
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
    },

    deleteAction (row) {
      row.loading = true
      this.firebaseMixinInstance.id(row['.key']).delete().finally(() => {
        row.loading = false
      })
    }
  }
})
</script>
