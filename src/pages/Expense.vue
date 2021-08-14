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
            v-model="form.expenseProduct"
            :loading="loading"
            autocomplete
            sorted
            :label="$t('expenseProduct')"
            :options="expenseProductsOptions"
          />

          <v-select
            v-model="form.type"
            reactive-rules
            :loading="loading"
            autocomplete
            sorted
            :label="$t('type')"
            :options="typeOptions"
            :rules="[ val => val && val.length ]"
          />

          <q-input
            v-model="form.observation"
            type="textarea"
            :label="$t('observation')"
          />

          <q-card>
            <q-card-section>
              <div class="text-h6">
                {{ $t('weight') }}
              </div>
            </q-card-section>
            <q-separator />

            <q-card-section class="row q-col-gutter-md">
              <v-select
                v-model="form.weightType"
                reactive-rules
                class="col-6"
                :loading="loading"
                autocomplete
                sorted
                :label="$t('weightType')"
                :options="['GR', 'ML', 'UN']"
                :rules="[ val => val && val.length ]"
              />
              <v-input
                v-model="form.quantity"
                type="number"
                class="col-6"
                :label="$t('quantity')"
                :rules="[ val => val && val.length ]"
              />
            </q-card-section>
          </q-card>

          <currency-input
            v-model="form.total"
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
      </q-card>
    </div>
    <div class="col-xs-12 col-sm-12 col-md-8">
      <v-table-crud
        :title="$tc('expense', 2)"
        :rows="expenses"
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
import CurrencyInput from 'components/common/CurrencyInput.vue'
import VSelect from 'components/common/VSelect.vue'
import VInput from 'components/common/VInput.vue'
import VInputDatePicker from 'components/common/VInputDatePicker.vue'
import VTableCrud from 'components/common/VTableCrud.vue'
import { currencyToFloat } from 'utils/'

export default defineComponent({
  name: 'Sales',

  components: {
    CurrencyInput,
    VSelect,
    VInputDatePicker,
    VTableCrud,
    VInput
  },

  setup () {
    return {
      modelForm: {
        date: '',
        observation: '',
        expenseProduct: '',
        type: '',
        weightType: '',
        quantity: 0,
        total: 0
      }
    }
  },

  data () {
    return {
      form: {},
      loading: false,
      loadingTable: true,
      saving: false,
      expenses: [],
      firebaseMixinInstance: null,
      expenseProducts: []
    }
  },

  computed: {
    typeOptions () {
      return [{ label: this.$t('entry'), value: 'entry' }, { label: this.$t('exit'), value: 'exit' }]
    },
    expenseProductsOptions () {
      return this.expenseProducts.map(c => ({ label: c.name, value: c.id }))
    },
    columns () {
      return [
        { name: 'date', label: this.$t('date'), field: 'date', sortable: true },
        {
          name: 'expenseProduct',
          label: this.$t('expenseProduct'),
          field: 'expenseProduct',
          format: expenseProduct => expenseProduct ? expenseProduct.name : '',
          sortable: true
        },
        {
          name: 'type',
          label: this.$t('type'),
          field: 'type',
          format: value => this.$t(value),
          sortable: true
        },
        { name: 'total', label: 'Total', field: 'total', sortable: true },
        { name: 'weightType', label: this.$t('weightType'), field: 'weightType', sortable: true },
        { name: 'quantity', label: this.$t('quantity'), field: 'quantity', sortable: true },
        { name: 'observation', label: this.$t('observation'), field: 'observation' },
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
  },

  mounted () {
    this.loading = true
    this.firebaseMixinInstance = this.firebaseMixin('expenses')

    Promise.all([
      this.firebaseMixinInstance.bindField('expenses'),
      this.firebaseMixin('expenseProducts').bindField('expenseProducts')
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
      this.form = { ...this.modelForm, total: 0 }
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
    },
    save () {
      const ref = this.firebaseMixinInstance
      if (this.form.expenseProduct) {
        this.form.expenseProduct = this.firebaseMixin('expenseProducts').id(this.form.expenseProduct).doc()
      }
      const action = this.form.id
        ? ref.id(this.form.id).update : ref.add
      action(this.form).catch((err) => {
        console.log('err', err)
      })
      this.reset()
    },
    edit (row) {
      this.form = { ...row, id: row.id, expenseProduct: row.expenseProduct ? row.expenseProduct.id : '' }
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
    },

    deleteAction (row) {
      Dialog.create({
        title: `${this.$q.lang.label.remove} ${this.$t('expense')}`,
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
