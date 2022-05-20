<template>
  <q-page
    class="row q-col-gutter-md"
    padding
  >
    <div class="col-xs-12 col-sm-12 col-md-8">
      <v-table-crud
        :rows="stockHistory"
        :columns="columns"
        :loading="loading"
        @edit="edit"
        @delete="row => firebaseDeleteItem(nameHistory, 'stockHistory', row.id)"
      >
        <template #top-left>
          <div class="q-table__title">
            {{ $t('stockHistory', 2) }}: {{ item.name }}
          </div>
          <div class="row">
            {{ $t('inStock') }}: {{ quantity }}
          </div>
        </template>
      </v-table-crud>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-4">
      <q-form
        ref="form"
        class="q-gutter-sm"
        @submit="save"
      >
        <v-input
          v-model="form.description"
          type="text"
          :label="$t('description')"
        />

        <v-input
          v-model="form.quantity"
          type="number"
          :label="$t('quantity')"
          :rules="[val => val != 0]"
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
    </div>
  </q-page>
</template>

<script>

import { date, Notify } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date
import { useFirebaseStore } from 'stores/firebase'
import { mapState } from 'pinia'

export default defineComponent({
  name: 'StockHistory',

  setup () {
    return {
      referenceIdName: {
        expenseProducts: 'expenseProductId',
        products: 'productId'
      },
      modelForm: {
        description: '',
        quantity: 0
      }
    }
  },

  data () {
    return {
      form: {},
      loading: false,
      saving: false,
      firebaseMixinInstance: null,
      item: {}
    }
  },

  computed: {
    ...mapState(useFirebaseStore, {
      stockHistory (store) {
        return store[this.nameHistory].filter(item => item[this.referenceIdName[this.collectionName]] === this.itemId)
      }
    }),
    nameHistory () {
      return `${this.collectionName}StockHistory`
    },
    collectionName () {
      return this.$route.name.split('.')[0]
    },
    quantity () {
      return this.stockHistory.reduce((acc, item) => {
        return acc + item.quantity
      }, 0)
    },
    itemId () {
      return this.$route.params.id
    },
    columns () {
      return [
        { name: 'description', label: this.$t('description'), field: 'description', sortable: true },
        { name: 'quantity', label: this.$t('quantity'), field: 'quantity', sortable: true, classes: (row) => row.quantity < 0 ? 'text-red' : 'text-green' },
        {
          name: 'createdAt',
          label: this.$t('createdAt'),
          field: 'createdAt',
          format: val => formatDate(val ? val.toDate() : '', 'DD/MM/YYYY HH:mm:ss'),
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
    this.load()
    this.reset()
  },

  methods: {
    load () {
      this.firebaseMixin(this.collectionName).id(this.itemId).doc().get().then(doc => {
        if (!doc.exists) {
          this.$router.back()
          return
        }
        this.item = doc.data()
      })
    },
    reset () {
      this.form = { ...this.modelForm }
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
    },
    save () {
      const ref = this.firebaseMixin(this.nameHistory)
      const action = this.form.id
        ? ref.id(this.form.id).update : ref.add
      const form = {
        ...this.form,
        [this.referenceIdName[this.collectionName]]: this.$route.params.id
      }
      action(form).catch((err) => {
        console.log('err', err)
      })
      Notify.create({
        message: this.$t('savedOperation'),
        color: 'positive',
        closeBtn: true
      })
      this.reset()
      this.load()
    },
    edit (row) {
      this.form = { ...row, id: row.id }
    }
  }
})
</script>
