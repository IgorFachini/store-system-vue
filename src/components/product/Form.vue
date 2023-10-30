<template lang="pug">
q-form.q-gutter-sm.full-width(
  ref="form"
  @submit="save"
)
  v-input(
    v-model="form.name"
    :label="$t('name')"
    :rules=`[
      val => val && val.length || $t('fillTheField', { field: $t('name') }),
      val => !!form.id && nameBefore === val || (!products.map(c => c.name.toLowerCase()).includes(val.toLowerCase()) || $t('alredyExist'))
    ]`
    :disable="viewMode"
  )
  v-input(
    v-model="form.description"
    type="textarea"
    :label="$t('description')"
    :disable="viewMode"
  )
  v-input(
    v-model="form.saleValue"
    :label="$t('saleValue')"
    currency
    :disable="viewMode"
  )
  div(
    v-if="!viewMode"
    class="row"
  )
    q-btn(
      color="primary"
      :label="$t('readBarcode')"
      class="full-width"
      @click="openBarcodeReader()"
    )
  v-input(
    v-model="form.code"
    :label="$t('code')"
    :disable="viewMode"
  )
  v-input(
    v-model="currentInventory"
    type="number"
    :label="$t('currentInventory')"
    :disable="!!form.id"
  )
  div(
    v-if="form.id"
    class="row"
  )
    q-btn(
      :label="$t('stockHistory')"
      dense
      color="blue"
      class="full-width"
      @click="stockHistory()"
    )
  v-input(
    v-model="form.purchasePrice"
    :label="$t('purchasePrice')"
    currency
    :disable="viewMode"
  )
  //- TODO add image
  //- div.row.justify-center
  //-   q-img(
  //-     v-if="image"
  //-     :src="image"
  //-     style="height: 280px; max-width: 300px"
  //-   )
  //-     div.absolute-bottom.text-subtitle1.text-center Imagem Atual
  //-   q-uploader(
  //-     label="Imagem"
  //-     hide-upload-btn
  //-     ref="uploader"
  //-   )
  div.row.q-gutter-md.q-mt-md.justify-between
    q-btn(
      label="Reset"
      @click="reset"
    )
    q-btn(
      :label="$t('save')"
      type="submit"
      color="positive"
    )
  barcode-reader-modal(
    ref="barcodeReaderModal"
    @success="setProductCode"
  )
</template>

<script>

import { Notify } from 'quasar'
import { defineComponent } from 'vue'
import BarcodeReaderModal from 'components/common/BarcodeReaderModal.vue'
import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'
import { firebaseUploadFile, firebaseGetFile } from 'src/boot/firebase'

export default defineComponent({
  name: 'ProductsForm',

  components: {
    BarcodeReaderModal
  },

  emits: ['done'],

  setup () {
    const storeFirebase = useFirebaseStore()
    const {
      products,
      countProductsStockHistoryById,
      loadingDatabase
    } = storeToRefs(storeFirebase)

    return {
      products,
      countProductsStockHistoryById,
      loadingDatabase,
      image: '',
      modelForm: {
        name: '',
        description: '',
        saleValue: 0,
        code: '',
        purchasePrice: 0
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
      nameBefore: '',
      currentInventory: 0,
      viewMode: false
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
    this.firebaseMixinInstance = this.firebaseMixin('products')
    if (this.$route.params.id && !this.loadingDatabase) {
      this.checkExists(this.$route.params.id)
    }
    if (this.loadingDatabase) {
      this.globalLoading = true
    }
  },

  methods: {
    openBarcodeReader () {
      this.$refs.barcodeReaderModal.openReader()
    },
    setProductCode (res) {
      const code = res.codeResult.code
      this.form.code = code
    },
    setAdress ({ logradouro, bairro, localidade, uf }) {
      this.form.publicPlace = logradouro
      this.form.district = bairro
      this.form.city = localidade
      this.form.state = uf
    },
    reset () {
      this.form = { ...this.modelForm, recipes: [] }
      this.currentInventory = 0
      this.$nextTick(() => {
        this.$refs.form?.resetValidation()
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
          this.firebaseMixin('productsStockHistory').add({
            productId: res.id,
            quantity: currentInventory,
            description
          })
        }
      }).catch((err) => {
        console.log('err', err)
      })
      // const files = this.$refs.uploader.files
      // if (files.length) {
      //   firebaseUploadFile(files[0], `product-${form.name}`)
      // }
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
      firebaseGetFile(`product-${row.name}`).then((res) => {
        this.image = res
      })
      this.currentInventory = this.countProductsStockHistoryById(row.id)
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
  }
})
</script>
