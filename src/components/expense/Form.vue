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
      :loading="loading"
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
          {{ $t('expenseProduct', 2) }}
        </div>
      </q-card-section>
      <q-separator />

      <q-card-section
        v-if="!viewMode"
      >
        <q-form
          ref="expenseProductForm"
          class="row"
          @submit="saveExpenseProduct"
        >
          <v-select
            v-model="expenseProductForm.id"
            reactive-rules
            class="col-12"
            autocomplete
            sorted
            :label="$t('product')"
            :options="expenseProductsOptions"
            :rules="[
              val => !expenseProductForm.quantity || !!val.length,
              val => !form.expenseProducts.map(c => c.id).includes(val) || $t('alredyExist')
            ]"
          />
          <v-input
            v-model="expenseProductForm.quantity"
            reactive-rules
            class="col-12"
            type="number"
            :label="$t('quantity')"
            :rules="[ val => (expenseProductForm.id.length && val > 0) || !expenseProductForm.id ]"
            :hint="`${$t('weightType')}: ${weightLabel}`"
          />

          <q-checkbox
            v-model="expenseProductForm.increaseStock"
            :label="$t('increaseStock')"
            left-label
          />

          <v-input
            v-model="expenseProductForm.value"
            class="col-12"
            :label="$t('value')"
            currency
          />

          <div
            class="row full-width justify-between"
          >
            <q-btn
              label="Reset"
              @click="resetExpenseProductForm"
            />
            <q-btn
              :label="$t('add')"
              :disable="!expenseProductForm.id"
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
              v-for="expenseProduct in form.expenseProducts"
              :key="expenseProduct.id"
              v-ripple
              clickable
            >
              <q-item-section>
                <label>
                  {{ expenseProduct.name }}
                </label>
                <label>
                  {{ $t('increaseStock') }} : {{ expenseProduct.increaseStock ? $t('yes') : $t('no') }}
                </label>
                <label>
                  {{ $t('quantity') }}: {{ expenseProduct.quantity }}
                </label>
                <label> {{ $t('weightType') }}: {{ expenseProduct.weightType }} </label>
                <label> {{ $t('value') }}: {{ expenseProduct.value }} </label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  v-if="!viewMode"
                  :label="$t('delete')"
                  dense
                  color="negative"
                  @click="form.expenseProducts = form.expenseProducts.filter(p => p.id !== expenseProduct.id)"
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
      expenseProducts,
      loadingDatabase,
      suppliers
    } = storeToRefs(storeFirebase)

    return {
      expenses,
      expenseProducts,
      loadingDatabase,
      suppliers,
      modelForm: {
        date: '',
        description: '',
        quantity: 0,
        expenseProducts: [],
        supplier: '',
        total: 0
      },

      modelExpenseProductForm: {
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
      expenseProductForm: {},
      viewMode: false
    }
  },

  computed: {
    weightLabel () {
      return this.expenseProductForm.id ? this.expenseProducts.find(e => e.id === this.expenseProductForm.id).weightType : ''
    },
    expenseProductsOptions () {
      return this.expenseProducts.map(e => ({ label: e.name, value: e.id }))
    }
  },

  watch: {
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
    this.expenseProductForm = { ...this.modelExpenseProductForm }
    this.firebaseMixinInstance = this.firebaseMixin('expenses')
    if (this.$route.params.id && !this.loadingDatabase) {
      this.checkExists(this.$route.params.id)
    }
    if (this.loadingDatabase) {
      this.globalLoading = true
    }
  },

  methods: {
    saveExpenseProduct () {
      const expenseProduct = this.expenseProducts.find(e => e.id === this.expenseProductForm.id)
      this.form.expenseProducts.push({
        ...this.expenseProductForm,
        name: expenseProduct.name,
        weightType: expenseProduct.weightType
      })
      this.form.total = this.form.expenseProducts.reduce((acc, cur) => acc + cur.value, 0)
      this.resetExpenseProductForm()
    },
    resetExpenseProductForm () {
      this.expenseProductForm = { ...this.modelExpenseProductForm }
      this.$nextTick(() => {
        this.$refs.expenseProductForm?.resetValidation()
      })
    },
    reset () {
      this.form = { ...this.modelForm, expenseProducts: [] }
      this.form.date = formatDate(Date.now(), 'YYYY/MM/DD HH:mm')

      this.$nextTick(() => {
        this.$refs.form?.resetValidation()
      })
    },
    save () {
      const ref = this.firebaseMixinInstance
      const form = { ...this.form, expenseProducts: this.form.expenseProducts.map(({ id, value, quantity, name, weightType }) => ({ id, value, quantity, name, weightType })) }
      const expenseProducts = this.form.expenseProducts
      const action = form.id
        ? ref.id(form.id).update : ref.add

      if (this.form.supplier) {
        const idSupplier = this.suppliers.find(c => c.name === this.form.supplier).id
        this.form.supplier = this.firebaseMixin('suppliers').id(idSupplier).doc()
      }
      action(form).then(() => {
        expenseProducts.forEach(item => {
          if (item.increaseStock) {
            this.firebaseMixin('expenseProductsStockHistory').add({
              expenseProductId: item.id,
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
