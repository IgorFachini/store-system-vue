<template>
  <q-page class="q-col-gutter-md">
    <q-field
      :label="$t('date')"
      stack-label
    >
      <template #control>
        {{ sale.date }}
      </template>
    </q-field>
    <q-field
      :label="$t('customer')"
      stack-label
    >
      <template #control>
        {{ sale.customer.name }}
      </template>
    </q-field>
    <q-field
      :label="$t('document')"
      stack-label
    >
      <template #control>
        {{ sale.customer.document }}
      </template>
    </q-field>
    <div class="row q-col-gutter-md">
      <q-field
        :label="$t('publicPlace')"
        stack-label
        class="col-6"
      >
        <template #control>
          {{ sale.customer.publicPlace }}
        </template>
      </q-field>
      <q-field
        :label="$t('number')"
        stack-label
        class="col-2"
      >
        <template #control>
          {{ sale.customer.number }}
        </template>
      </q-field>
      <q-field
        :label="$t('district')"
        stack-label
        class="col-4"
      >
        <template #control>
          {{ sale.customer.district }}
        </template>
      </q-field>
    </div>
    <div class="row q-col-gutter-md">
      <q-field
        label="CEP"
        stack-label
        class="col-4"
      >
        <template #control>
          {{ sale.customer.cep }}
        </template>
      </q-field>
      <q-field
        :label="$t('city')"
        stack-label
        class="col-6"
      >
        <template #control>
          {{ sale.customer.city }}
        </template>
      </q-field>
      <q-field
        :label="$t('state')"
        stack-label
        class="col-2"
      >
        <template #control>
          {{ sale.customer.state }}
        </template>
      </q-field>
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
                <q-field
                  :label="$t('additional')"
                  stack-label
                  class="col-4"
                >
                  <template #control>
                    {{ sale.additional }}
                  </template>
                </q-field>
                <q-field
                  :label="$t('discount')"
                  stack-label
                  class="col-4"
                >
                  <template #control>
                    {{ sale.discount }}
                  </template>
                </q-field>
                <q-field
                  label="Total"
                  stack-label
                  class="col-4"
                >
                  <template #control>
                    {{ sale.total }}
                  </template>
                </q-field>
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
                this.print()
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

    async print () {
      // Pass the element id here
      window.print()
      // await this.$htmlToPaper('html')
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
