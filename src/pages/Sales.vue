<template>
  <q-page
    class="row q-col-gutter-md"
    padding
  >
    <div class="col-xs-12 col-sm-12 col-md-4">
      <q-card class="q-pa-md">
        <q-form
          ref="form"
          class="q-gutter-md"
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

          <q-card>
            <q-card-section>
              <div class="text-h6">
                {{ $tc('product', 2) }}
              </div>
            </q-card-section>
            <q-separator />

            <q-card-section>
              <q-form
                ref="productForm"
                class="row q-col-gutter-md"
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
                  @update:model-value="val => productForm.unitaryValue = currencyToFloat(products.find(p => p.id === val).saleValue)"
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

                <div
                  class="row full-width justify-between"
                >
                  <q-btn
                    label="Reset"
                    @click="resetProduct"
                  />
                  <q-btn
                    :label="$t('add')"
                    :disable="!productForm.id"
                    type="submit"
                    color="positive"
                  />
                </div>
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

          <q-card>
            <q-card-section>
              <div class="text-h6">
                Total
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <currency-input
                v-model="form.additional"
                :label="$t('additional')"
              />
              <currency-input
                v-model="form.discount"
                :label="$t('discount')"
              />
              <currency-input
                :model-value="(totalProducts + form.additional - form.discount).toFixed(2)"
                label="Total"
                disable
                @change="val => form.total = val"
              />
            </q-card-section>
          </q-card>

          <div class="row q-gutter-md q-mt-md justify-between">
            <q-btn
              label="Reset"
              @click="reset"
            />
            <q-btn
              :label="$t('save')"
              type="submit"
              color="positive"
              :disable="!form.products.length"
            />
          </div>
        </q-form>
      </q-card>
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
        :loading="loadingTable"
        :filter="filter"
        row-key=".key"
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
        <template #body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.value }}
              <q-btn
                v-if="col.name === 'expand'"
                size="sm"
                color="accent"
                round
                dense
                :icon="props.expand ? 'remove' : 'add'"
                @click="props.expand = !props.expand"
              />
              <div
                v-if="col.name === 'action'"
                class="row no-wrap q-gutter-md"
              >
                <q-btn
                  :label="$t('edit')"
                  dense
                  color="primary"
                  @click="edit(props.row)"
                />
                <q-btn
                  :label="$t('delete')"
                  dense
                  color="negative"
                  :loading="props.row.loading"
                  @click="deleteAction(props.row)"
                />
              </div>
            </q-td>
          </q-tr>
          <q-tr
            v-show="props.expand"
            :props="props"
          >
            <q-td colspan="100%">
              <q-list
                bordered
                separator
              >
                <product-sale-info
                  v-for="product in props.row.products"
                  :key="product.id"
                  :product="product"
                  hide-remove
                  @remove="val => form.products = form.products.filter(p => p.id !== val.id)"
                />
              </q-list>
            </q-td>
          </q-tr>
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
import { currencyToFloat } from 'utils/'

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
        observation: '',
        customer: '',
        products: [],
        additional: 0,
        discount: 0,
        total: 0
      },
      modelProductForm: {
        id: '',
        name: '',
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
        rowsPerPage: 10,
        sortBy: 'createdAt',
        descending: true
      },
      form: {},
      loading: false,
      loadingTable: true,
      saving: false,
      sales: [],
      firebaseMixinInstance: null,
      customers: [],
      products: [],
      nameBefore: ''
    }
  },

  computed: {
    totalProducts () {
      return this.form.products.reduce((pv, cv) => cv.quantity ? (Number(cv.quantity) * parseFloat(cv.unitaryValue)) + pv : 0, 0)
    },
    customersOptions () {
      return this.customers.map(c => ({ label: c.name, value: c.id }))
    },
    productsOptions () {
      return this.products.map(p => ({ label: `${p.name} - ${p.saleValue}`, value: p.id }))
    },
    columns () {
      return [
        { name: 'expand', label: this.$tc('product', 2), align: 'left' },
        { name: 'date', label: this.$t('date'), field: 'date', sortable: true },
        { name: 'observation', label: this.$t('observation'), field: 'observation' },
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
        { name: 'additional', label: this.$t('additional'), field: 'additional', sortable: true },
        { name: 'discount', label: this.$t('discount'), field: 'discount', sortable: true },
        { name: 'total', label: 'Total', field: 'total', sortable: true },
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
    this.firebaseMixinInstance.bindField('sales').finally(() => {
      this.loadingTable = false
    })
    Promise.all([
      this.firebaseMixin('customers').bindField('customers'),
      this.firebaseMixin('products').bindField('products')
    ])
      .finally(() => {
        this.loading = false
      })
  },

  methods: {
    currencyToFloat,
    setAdress ({ logradouro, bairro, localidade, uf }) {
      this.form.publicPlace = logradouro
      this.form.district = bairro
      this.form.city = localidade
      this.form.state = uf
    },
    reset () {
      this.form = { ...this.modelForm, products: [], total: 0 }
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
      this.form.products.push({ ...this.productForm, name: this.products.find(p => p.id === this.productForm.id).name })
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
