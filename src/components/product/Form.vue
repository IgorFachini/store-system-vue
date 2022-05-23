<template>
  <q-form
    ref="form"
    class="q-gutter-sm full-width"
    @submit="save"
  >
    <v-input
      v-model="form.name"
      :label="$t('name')"
      :rules="[
        val => val && val.length || $t('fillTheField', { field: $t('name') }),
        val => !!form.id && nameBefore === val || (!products.map(c => c.name.toLowerCase()).includes(val.toLowerCase()) || $t('alredyExist'))
      ]"
      :disable="viewMode"
    />

    <v-input
      v-model="form.description"
      type="textarea"
      :label="$t('description')"
      :disable="viewMode"
    />

    <v-input
      v-model="form.saleValue"
      :label="$t('saleValue')"
      currency
      :disable="viewMode"
    />

    <v-select
      v-model="form.category"
      :loading="loading"
      autocomplete
      sorted
      :label="$t('category')"
      :options="categories.map(c => c.name)"
      :disable="viewMode"
    />

    <div
      v-if="!viewMode"
      class="row"
    >
      <q-btn
        color="primary"
        :label="$t('readBarcode')"
        class="full-width"
        @click="openBarcodeReader()"
      />
    </div>

    <v-input
      v-model="form.code"
      :label="$t('code')"
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

    <v-input
      v-model="form.purchasePrice"
      :label="$t('purchasePrice')"
      currency
      :disable="viewMode"
    />

    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ $t('recipe') }}
        </div>
        <q-checkbox
          v-model="decreaseStockRecipes"
          :label="`${$t('decreaseStock')} (${$t('recipe', 2)})`"
          left-label
        />
      </q-card-section>
      <q-separator />

      <q-card-section
        v-if="!viewMode"
      >
        <q-form
          ref="recipeForm"
          class="row"
          @submit="saveRecipe"
        >
          <v-select
            v-model="recipeForm.id"
            reactive-rules
            class="col-12"
            :loading="loading"
            autocomplete
            sorted
            :label="$t('expenseProduct')"
            :options="expenseProductsOptions"
            :rules="[
              val => !recipeForm.quantity || !!val.length,
              val => !form.recipes.map(c => c.id).includes(val) || $t('alredyExist')
            ]"
          />
          <v-input
            v-model="recipeForm.quantity"
            reactive-rules
            class="col-12"
            type="number"
            :label="$t('quantity')"
            :rules="[ val => (recipeForm.id.length && val > 0) || !recipeForm.id ]"
            :hint="`${$t('weightType')}: ${weightLabel}`"
          />

          <div
            class="row full-width justify-between"
          >
            <q-btn
              label="Reset"
              @click="resetRecipe"
            />
            <q-btn
              :label="$t('add')"
              :disable="!recipeForm.id"
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
            <product-recipe-info
              v-for="recipe in form.recipes"
              :key="recipe.id"
              :product="recipe"
              :hide-remove="viewMode"
              @remove="val => form.recipes = form.recipes.filter(p => p.id !== val.id)"
            />
          </transition-group>
        </q-list>
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
      />
    </div>
    <barcode-reader-modal
      ref="barcodeReaderModal"
      @success="setProductCode"
    />
  </q-form>
</template>

<script>

import { Notify } from 'quasar'
import { defineComponent } from 'vue'
import ProductRecipeInfo from 'components/product/ProductRecipeInfo.vue'
import BarcodeReaderModal from 'components/common/BarcodeReaderModal.vue'
import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'ProductsForm',

  components: {
    ProductRecipeInfo,
    BarcodeReaderModal
  },

  emits: ['done'],

  setup () {
    const storeFirebase = useFirebaseStore()
    const {
      products,
      countProductsStockHistoryById,
      categories,
      expenseProducts,
      loadingDatabase
    } = storeToRefs(storeFirebase)

    return {
      products,
      countProductsStockHistoryById,
      categories,
      expenseProducts,
      loadingDatabase,
      modelForm: {
        name: '',
        description: '',
        saleValue: 0,
        category: '',
        code: '',
        purchasePrice: 0,
        recipes: []
      },

      modelRecipeForm: {
        id: '',
        quantity: 0
      }
    }
  },

  data () {
    return {
      decreaseStockRecipes: true,
      form: {},
      recipeForm: {},
      loading: false,
      saving: false,
      firebaseMixinInstance: null,
      // products: [],
      // categories: [],
      // expenseProducts: [],
      nameBefore: '',
      currentInventory: 0,
      viewMode: false
    }
  },

  computed: {
    weightLabel () {
      return this.recipeForm.id ? this.expenseProducts.find(e => e.id === this.recipeForm.id).weightType : ''
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
    this.recipeForm = { ...this.modelRecipeForm }
    this.firebaseMixinInstance = this.firebaseMixin('products')
    if (this.$route.params.id && !this.loadingDatabase) {
      this.checkExists(this.$route.params.id)
    }
    if (this.loadingDatabase) {
      this.globalLoading = true
    }
  },

  // mounted () {
  // this.loading = true
  // this.firebaseMixinInstance = this.firebaseMixin('products')
  // Promise.all([
  //   this.firebaseMixinInstance.bindField('products'),
  //   this.firebaseMixin('categories').bindField('categories'),
  //   this.firebaseMixin('expenseProducts').bindField('expenseProducts')
  // ]).then(() => {
  // if (this.$route.params.id) {
  //   this.checkExists(this.$route.params.id)
  // }
  // }).finally(() => {
  //   this.loading = false
  // })
  // },

  methods: {
    openBarcodeReader () {
      this.$refs.barcodeReaderModal.openReader()
    },
    setProductCode (res) {
      const code = res.codeResult.code
      this.form.code = code
    },
    saveRecipe () {
      this.form.recipes.push(this.recipeForm)
      this.resetRecipe()
    },
    resetRecipe () {
      this.recipeForm = { ...this.modelRecipeForm }
      this.$nextTick(() => {
        this.$refs.recipeForm?.resetValidation()
      })
    },
    setAdress ({ logradouro, bairro, localidade, uf }) {
      this.form.publicPlace = logradouro
      this.form.district = bairro
      this.form.city = localidade
      this.form.state = uf
    },
    reset () {
      this.resetRecipe()
      this.form = { ...this.modelForm, recipes: [] }
      this.currentInventory = 0
      this.decreaseStockRecipes = true
      this.$nextTick(() => {
        this.$refs.form?.resetValidation()
      })
    },
    save () {
      const description = this.$t('entry')
      const ref = this.firebaseMixinInstance
      const form = { ...this.form }
      const currentInventory = this.currentInventory
      const decreaseStockRecipes = this.decreaseStockRecipes
      if (this.form.category) {
        const idCategory = this.categories.find(c => c.name === this.form.category).id
        this.form.category = this.firebaseMixin('categories').id(idCategory).doc()
      }
      const action = form.id
        ? ref.id(form.id).update : ref.add
      action(form).then((res) => {
        if (!form.id && currentInventory !== 0) {
          this.firebaseMixin('productsStockHistory').add({
            productId: res.id,
            quantity: currentInventory,
            description
          })
          if (decreaseStockRecipes) {
            form.recipes.forEach(item => {
              this.firebaseMixin('expenseProductsStockHistory').add({
                expenseProductId: item.id,
                quantity: -Math.abs(item.quantity * currentInventory),
                description: `${this.$t('increaseStock')}: ${form.name}`
              })
            })
          }
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
      const row = this.products.find(p => p.id === id)

      if (!row) {
        Notify.create({
          message: this.$t('notExist'),
          color: 'negative',
          closeBtn: true
        })
        this.$router.push('/products')
        return
      }
      this.currentInventory = this.countProductsStockHistoryById(row.id)
      // this.stockHistoryCount(row).then(count => {
      //   this.currentInventory = count
      // })
      const isView = this.$route.name === 'products.view'
      this[isView ? 'view' : 'edit'](row)
    },
    view (row) {
      this.viewMode = true
      this.nameBefore = row.name
      this.form = { ...row, id: row.id }
    },
    edit (row, id) {
      this.viewMode = false
      this.form = {
        ...row,
        id: row.id,
        category: row.category ? row.category.name : '',
        recipes: row.recipes ? row.recipes : []
      }
      this.nameBefore = row.name
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

    // stockHistoryCount (row) {
    //   return this.firebaseMixin('stockHistory').ref().where('productId', '==', row.id).get().then(snapshot => snapshot.docs.map(doc => doc.data()).reduce((acc, item) => {
    //     return acc + item.quantity
    //   }, 0))
    // }
  }
})
</script>
