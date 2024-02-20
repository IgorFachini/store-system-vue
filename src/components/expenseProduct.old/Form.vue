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
      :loading="loading"
      autocomplete
      sorted
      :label="$t('weightType')"
      :options="['GR', 'ML', 'UN']"
      :rules="[ val => val && val.length || $t('fillTheField', { field: $t('weightType') })]"
      :disable="viewMode"
    />

    <v-input
      v-model="currentInventory"
      type="number"
      :label="$t('currentInventory')"
      :disable="!!form.id"
    />

    <div
      v-if="form.id"
      class="row"
    >
      <q-btn
        :label="$t('stockHistory')"
        dense
        color="blue"
        class="full-width"
        @click="stockHistory()"
      />
    </div>

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
import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'ExpenseProductsForm',

  emits: ['done'],

  setup () {
    const storeFirebase = useFirebaseStore()
    const { expenseProducts, countExpenseProductsStockHistoryById, loadingDatabase } = storeToRefs(storeFirebase)

    return {
      expenseProducts,
      countExpenseProductsStockHistoryById,
      loadingDatabase,
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
      nameBefore: '',
      viewMode: false,
      currentInventory: 0
    }
  },

  watch: {
    loadingDatabase (val) {
      if (this.$route.params.id && !val) {
        this.globalLoading = false
        this.checkExists(this.$route.params.id)
      }
    }
  },

  created () {
    this.form = { ...this.modelForm }
    if (this.$route.params.id && !this.loadingDatabase) {
      this.checkExists(this.$route.params.id)
    }
    if (this.loadingDatabase) {
      this.globalLoading = true
    }
  },

  mounted () {
    // this.loading = true
    this.firebaseMixinInstance = this.firebaseMixin('expenseProducts')
    // if (this.$route.params.id) {
    //   this.checkExists(this.$route.params.id)
    // }

    // this.firebaseMixinInstance.bindField('expenseProducts').finally(() => {
    //   this.loading = false
    //   if (this.$route.params.id) {
    //     this.checkExists(this.$route.params.id)
    //   }
    // })
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
      const description = this.$t('entry')
      const ref = this.firebaseMixinInstance
      const form = { ...this.form }
      const currentInventory = this.currentInventory
      const action = form.id
        ? ref.id(form.id).update : ref.add
      action(form).then((res) => {
        if (!form.id && currentInventory !== 0) {
          this.firebaseMixin('stockHistory').add({
            expenseProductId: res.id,
            quantity: currentInventory,
            description
          })
        }
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
      this.currentInventory = this.countExpenseProductsStockHistoryById(row.id)
      // this.stockHistoryCount(row).then(count => {
      //   this.currentInventory = count
      // })
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
    },

    stockHistory () {
      this.$router.push({
        name: 'expenseProducts.stockHistory',
        params: { id: this.form.id }
      })
    },

    stockHistoryCount (row) {
      return this.firebaseMixin('expenseProductStockHistory').ref().where('expenseProductId', '==', row.id).get().then(snapshot => snapshot.docs.map(doc => doc.data()).reduce((acc, item) => {
        return acc + item.quantity
      }, 0))
    }
  }
})
</script>
