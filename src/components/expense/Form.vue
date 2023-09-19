<template>
  <q-form
    ref="form"
    class="q-gutter-md"
    @submit="save"
  >
    <v-input
      v-model="form.date"
      :label="$t('date')"
      date
    />

    <v-select
      v-model="form.supplier"
      autocomplete
      sorted
      :label="$t('supplier')"
      :options="suppliers.map(c => c.name)"
      :disable="viewMode"
    />

    <v-input
      v-model="form.description"
      type="textarea"
      :label="$t('description')"
    />

    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ $t('product', 2) }}
        </div>
      </q-card-section>
      <q-separator />

      <q-card-section
        v-if="!viewMode"
      >
        <q-form
          ref="productForm"
          class="row"
          @submit="saveproduct"
        >
          <v-select
            v-model="productForm.id"
            reactive-rules
            class="col-12"
            autocomplete
            sorted
            :label="$t('product')"
            :options="productsOptions"
            :rules="[
              val => !productForm.quantity || !!val.length,
              val => !form.products.map(c => c.id).includes(val) || $t('alredyExist')
            ]"
          />
          <v-input
            v-model="productForm.quantity"
            reactive-rules
            class="col-12"
            type="number"
            :label="$t('quantity')"
            :rules="[ val => (productForm.id.length && val > 0) || !productForm.id ]"
          />

          <q-checkbox
            v-model="productForm.increaseStock"
            :label="$t('increaseStock')"
            left-label
          />

          <v-input
            v-model="productForm.value"
            class="col-12"
            :label="$t('value')"
            currency
          />

          <div
            class="row full-width justify-between"
          >
            <q-btn
              label="Reset"
              @click="resetproductForm"
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
            <q-item
              v-for="product in form.products"
              :key="product.id"
              v-ripple
              clickable
            >
              <q-item-section>
                <label>
                  {{ product.name }}
                </label>
                <label>
                  {{ $t('increaseStock') }} : {{ product.increaseStock ? $t('yes') : $t('no') }}
                </label>
                <label>
                  {{ $t('quantity') }}: {{ product.quantity }}
                </label>
                <label> {{ $t('value') }}: {{ product.value }} </label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  v-if="!viewMode"
                  :label="$t('delete')"
                  dense
                  color="negative"
                  @click="form.products = form.products.filter(p => p.id !== product.id)"
                />
              </q-item-section>
            </q-item>
          </transition-group>
        </q-list>
      </q-card-section>
    </q-card>

    <v-input
      v-model="form.total"
      currency
      label="Total"
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

import { Notify, date } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date
import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'ProductsForm',

  components: {
  },

  emits: ['done'],

  setup () {
    const storeFirebase = useFirebaseStore()
    const {
      expenses,
      products,
      loadingDatabase,
      suppliers
    } = storeToRefs(storeFirebase)

    return {
      expenses,
      products,
      loadingDatabase,
      suppliers,
      modelForm: {
        date: '',
        description: '',
        quantity: 0,
        products: [],
        supplier: '',
        total: 0
      },

      modelproductForm: {
        id: '',
        name: '',
        quantity: 1,
        value: 0,
        increaseStock: true
      }
    }
  },

  data () {
    return {
      form: {},
      productForm: {},
      viewMode: false
    }
  },

  computed: {
    productsOptions () {
      return this.products.map(e => ({ label: e.name, value: e.id }))
    }
  },

  watch: {
    'productForm.id' (val) {
      if (val) {
        this.productForm.value = this.products.find(e => e.id === val).purchasePrice
      }
    },
    loadingDatabase (val) {
      if (!val) {
        this.globalLoading = false
      }
      if (this.$route.params.id) {
        this.checkExists(this.$route.params.id)
      }
    }
  },

  created () {
    this.form = { ...this.modelForm }
    this.form.date = formatDate(Date.now(), 'YYYY/MM/DD HH:mm')
    this.productForm = { ...this.modelproductForm }
    this.firebaseMixinInstance = this.firebaseMixin('expenses')
    if (this.$route.params.id && !this.loadingDatabase) {
      this.checkExists(this.$route.params.id)
    }
    if (this.loadingDatabase) {
      this.globalLoading = true
    }
  },

  methods: {
    saveproduct () {
      const product = this.products.find(e => e.id === this.productForm.id)
      this.form.products.push({
        ...this.productForm,
        name: product.name,
        weightType: product.weightType
      })
      this.form.total = this.form.products.reduce((acc, cur) => acc + cur.value, 0)
      this.resetproductForm()
    },
    resetproductForm () {
      this.productForm = { ...this.modelproductForm }
      this.$nextTick(() => {
        this.$refs.productForm?.resetValidation()
      })
    },
    reset () {
      this.form = { ...this.modelForm, products: [] }
      this.form.date = formatDate(Date.now(), 'YYYY/MM/DD HH:mm')

      this.$nextTick(() => {
        this.$refs.form?.resetValidation()
      })
    },
    save () {
      const ref = this.firebaseMixinInstance
      const form = { ...this.form, products: this.form.products.map(({ id, value, quantity, name }) => ({ id, value, quantity, name })) }
      const products = this.form.products
      const action = form.id
        ? ref.id(form.id).update : ref.add

      if (this.form.supplier) {
        const idSupplier = this.suppliers.find(c => c.name === this.form.supplier).id
        form.supplier = this.firebaseMixin('suppliers').id(idSupplier).doc()
      }
      action(form).then(() => {
        products.forEach(item => {
          if (item.increaseStock) {
            this.firebaseMixin('productsStockHistory').add({
              productId: item.id,
              quantity: item.quantity,
              description: form.description
            })
          }
        })
      }).catch((err) => {
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
      const row = this.expenses.find(p => p.id === id)

      if (!row) {
        Notify.create({
          message: this.$t('notExist'),
          color: 'negative',
          closeBtn: true
        })
        this.$router.push('/expenses')
        return
      }
      const isView = this.$route.name === 'expenses.view'
      this[isView ? 'view' : 'edit'](row)
    },
    view (row) {
      this.viewMode = true
      this.form = {
        ...row,
        id: row.id,
        date: formatDate(row.date.toDate(), 'YYYY/MM/DD HH:mm')
      }
    },
    edit (row) {
      this.viewMode = false
      this.form = {
        ...row,
        id: row.id,
        date: formatDate(row.date.toDate(), 'YYYY/MM/DD HH:mm')
      }
      this.$nextTick(() => {
        this.$refs.form?.resetValidation()
      })
    },

    stockHistory () {
      this.$router.push({
        name: 'products.stockHistory',
        params: { id: this.form.id }
      })
    }
  }
})
</script>
