<template>
  <q-page class="q-col-gutter-md">
    <v-input
      :model-value="sale.date"
      :label="$t('date')"
    />
    <v-input
      :model-value="sale.customer.name"
      :label="$t('customer')"
      autogrow
    />
    <div class="row q-col-gutter-md">
      <v-input
        :model-value="sale.customer.publicPlace"
        :label="$t('publicPlace')"
        class="col-6"
        autogrow
      />
      <v-input
        :model-value="sale.customer.number"
        :label="$t('number')"
        class="col-2"
        autogrow
      />
      <v-input
        :model-value="sale.customer.district"
        :label="$t('district')"
        class="col-4"
        autogrow
      />
    </div>
    <div class="row q-col-gutter-md">
      <v-input
        :model-value="sale.customer.cep"
        label="CEP"
        class="col-4"
        autogrow
      />
      <v-input
        :model-value="sale.customer.city"
        :label="$t('city')"
        class="col-6"
        autogrow
      />
      <v-input
        :model-value="sale.customer.state"
        :label="$t('state')"
        class="col-2"
        autogrow
      />
    </div>
    <div class="row">
      <q-table
        ref="table"
        v-model:pagination="paginationInside"
        class="full-width"
        :rows="sale.products"
        :columns="columns"
        binary-state-sort
        :loading="loading"
        row-key="id"
        hide-bottom
      >
        <template #bottom-row>
          <q-tr>
            <q-td colspan="100%">
              <div class="row q-col-gutter-md">
                <v-input
                  :model-value="sale.additional"
                  :label="$t('additional')"
                  class="col-4"
                  autogrow
                />
                <v-input
                  :model-value="sale.discount"
                  :label="$t('discount')"
                  class="col-4"
                  autogrow
                />
                <v-input
                  :model-value="sale.total"
                  label="Total"
                  class="col-4"
                  autogrow
                />
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </q-page>
</template>
<script>
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

export default {
  name: 'SalePrint',

  components: {
  },

  props: {
    id: {
      type: String,
      required: true
    }
  },

  setup () {
    const { locale } = useI18n({ useScope: 'global' })
    return {
      locale
    }
  },

  data () {
    return {
      paginationInside: {
        page: 1,
        rowsPerPage: 20
      },
      sale: {
        date: '',
        customer: {
          name: '',
          publicPlace: '',
          number: 0,
          district: '',
          cep: '',
          city: '',
          document: ''
        },
        products: [],
        additional: 0,
        discount: 0,
        total: 0
      },

      loading: true
    }
  },

  computed: {
    columns () {
      return [
        { name: 'name', label: this.$t('name'), field: 'name', align: 'left' },
        { name: 'quantity', label: this.$t('quantity'), field: 'quantity' },
        { name: 'unitaryValue', label: this.$t('unitaryValue'), field: 'unitaryValue' },
        {
          name: 'total',
          label: 'Total',
          field: row => (row.quantity * row.unitaryValue).toFixed(2)
        }
      ]
    }
  },
  mounted () {
    this.firebaseMixin('sales').id(this.id).doc().get().then((doc) => {
      if (doc.exists) {
        this.sale = doc.data()
        if (doc.data().customer) {
          doc.data().customer.get().then((customerDoc) => {
            if (customerDoc.exists) {
              this.sale.customer = customerDoc.data()
              this.$nextTick(() => {
                this.printPageAfterDOMLoaded()
              })
            }
          })
        }
      }
    }).finally(() => {
      this.loading = false
    })
    this.$q = useQuasar()
    this.locale = this.$q.lang.getLocale()
  },

  methods: {

    printPageAfterDOMLoaded () {
      setTimeout(window.print, 500)
    }
  }
}
</script>
<style lang="scss" scoped>
table.ideia-impressao {
  width: 100%
}

section.ideia {
  min-height: 80vh
}

.break-after {
  break-after: always
}

.break-inside {
  break-inside: avoid
}
</style>
