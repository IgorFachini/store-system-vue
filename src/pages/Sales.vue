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
          <v-input
            v-model="form.date"
            :label="$t('date')"
            :rules="['date']"
            date
          />

          <v-select
            v-model="form.customer"
            :loading="loading"
            autocomplete
            sorted
            :label="$t('customer')"
            :options="customersOptions"
          />

          <v-input
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
                <v-input
                  v-model="productForm.quantity"
                  reactive-rules
                  class="col-6"
                  type="number"
                  :label="$t('quantity')"
                  :rules="[ val => (productForm.id.length && val > 0) || !productForm.id ]"
                />

                <v-input
                  v-model="productForm.unitaryValue"
                  class="col-6"
                  :label="$t('unitaryValue')"
                  currency
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
                <transition-group
                  appear
                  enter-active-class="animated fadeIn"
                  leave-active-class="animated fadeOut"
                >
                  <product-sale-info
                    v-for="product in form.products"
                    :key="product.id"
                    :product="product"
                    @remove="val => form.products = form.products.filter(p => p.id !== val.id)"
                  />
                </transition-group>
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
              <v-input
                v-model="form.additional"
                :label="$t('additional')"
                currency
              />
              <v-input
                v-model="form.discount"
                :label="$t('discount')"
                currency
              />
              <v-input
                :model-value="(totalProducts + form.additional - form.discount).toFixed(2)"
                label="Total"
                currency
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
      <v-table-crud
        :title="$tc('sale', 2)"
        :rows="sales"
        :columns="columns"
        :loading="loadingTable"
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
import { currencyToFloat } from 'utils/'
import ProductSaleInfo from 'components/product/ProductSaleInfo.vue'

export default defineComponent({
  name: 'Sales',

  components: {
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
      productForm: {},
      form: {},
      loading: false,
      loadingTable: true,
      saving: false,
      sales: [],
      firebaseMixinInstance: null,
      customers: [],
      products: []
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
          format: customer => customer ? customer.name : '',
          sortable: true
        },
        { name: 'additional', label: this.$t('additional'), field: 'additional', sortable: true },
        { name: 'discount', label: this.$t('discount'), field: 'discount', sortable: true },
        { name: 'total', label: 'Total', field: 'total', sortable: true },
        {
          name: 'createdAt',
          label: this.$t('createdAt'),
          field: 'createdAt',
          format: val => formatDate(val.toDate(), 'DD/MM/YYYY HH:mm'),
          sortable: true
        },
        {
          name: 'updatedAt',
          label: this.$t('updatedAt'),
          field: ({ updatedAt = null }) => updatedAt ? formatDate(updatedAt.toDate(), 'DD/MM/YYYY HH:mm') : '',
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
    this.firebaseMixinInstance = this.firebaseMixin('sales')

    Promise.all([
      this.firebaseMixinInstance.bindField('sales'),
      this.firebaseMixin('customers').bindField('customers'),
      this.firebaseMixin('products').bindField('products')
    ])
      .finally(() => {
        this.loading = false
        this.loadingTable = false
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
      if (this.form.customer) {
        this.form.customer = this.firebaseMixin('customers').id(this.form.customer).doc()
      }
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
      this.form = { ...row, id: row.id, customer: row.customer ? row.customer.id : '' }
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
    },

    deleteAction (row) {
      Dialog.create({
        title: `${this.$q.lang.label.remove} ${this.$t('sale')}`,
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
