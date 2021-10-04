<template>
  <q-page
    class="row q-col-gutter-md"
    padding
  >
    <div class="col-xs-12 col-sm-12 col-md-4">
      <q-form
        ref="form"
        class="q-gutter-sm"
        @submit="save"
      >
        <v-input
          v-model="form.name"
          :label="$t('name')"
          :rules="[
            val => val && val.length || $t('fillTheField', { field: $t('name') }),
            val => !!form.id && nameBefore === val || (!products.map(c => c.name.toLowerCase()).includes(val.toLowerCase()) || $t('alredyExist'))]"
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

        <q-card>
          <q-card-section>
            <div class="text-h6">
              {{ $t('recipe') }}
            </div>
          </q-card-section>
          <q-separator />

          <q-card-section>
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
                :label="$t('product')"
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
      >
        <template #expand="props">
          <q-list
            bordered
            separator
          >
            <product-recipe-info
              v-for="recipe in props.row.recipes"
              :key="recipe.id"
              :product="recipe"
              hide-remove
            />
          </q-list>
        </template>
      </v-table-crud>
    </div>
  </q-page>
</template>

<script>

import { date, Dialog, Notify } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date
import ProductRecipeInfo from 'components/product/ProductRecipeInfo.vue'

export default defineComponent({
  name: 'Products',

  components: {
    ProductRecipeInfo
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
      form: {},
      recipeForm: {},
      loading: false,
      saving: false,
      firebaseMixinInstance: null,
      products: [],
      categories: [],
      expenseProducts: [],
      nameBefore: ''
    }
  },

  computed: {
    weightLabel () {
      return this.recipeForm.id ? this.expenseProducts.find(e => e.id === this.recipeForm.id).weightType : ''
    },
    expenseProductsOptions () {
      return this.expenseProducts.map(e => ({ label: e.name, value: e.id }))
    },
    columns () {
      return [
        { name: 'expand', label: this.$tc('recipe'), align: 'left' },
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
    this.recipeForm = { ...this.modelRecipeForm }
  },

  mounted () {
    this.loading = true
    this.firebaseMixinInstance = this.firebaseMixin('products')
    Promise.all([
      this.firebaseMixinInstance.bindField('products'),
      this.firebaseMixin('categories').bindField('categories'),
      this.firebaseMixin('expenseProducts').bindField('expenseProducts')
    ])
      .finally(() => {
        this.loading = false
      })
  },

  methods: {
    saveRecipe () {
      this.form.recipes.push(this.recipeForm)
      this.resetRecipe()
    },
    resetRecipe () {
      this.recipeForm = { ...this.modelRecipeForm }
      this.$nextTick(() => {
        this.$refs.recipeForm.resetValidation()
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
      Notify.create({
        message: this.$t('savedOperation'),
        color: 'positive',
        closeBtn: true
      })
      this.reset()
    },
    edit (row) {
      this.form = {
        ...row,
        id: row.id,
        category: row.category ? row.category.name : '',
        recipes: row.recipes ? row.recipes : []
      }
      this.nameBefore = row.name
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
          Notify.create({
            message: this.$t('savedOperation'),
            color: 'positive',
            closeBtn: true
          })
        })
      })
    }
  }
})
</script>
