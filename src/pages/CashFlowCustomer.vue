<template>
  <q-page
    class="row"
    padding
  >
    <cash-flow-table
      v-if="render"
      :customer-id="$route.params.id"
    />
    <div class="row justify-around full-width q-ma-md">
      <q-card
        class="q-table__card col-xs-12 col-sm-12 col-md-6 col-lg-6"
      >
        <q-item>
          <q-item-section>
            <v-input
              v-model="total"
              :label="$t('value')"
              currency
            />
            <v-input
              v-model="description"
              :label="$t('description')"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <v-input
              v-model="date"
              :label="$t('date')"
              date
            />
            <div class="row q-my-md q-col-gutter-x-md q-gutter-y-md">
              <div class="col-4">
                <q-btn
                  color="blue"
                  :label="$t('buildCart')"
                  outline
                  class="full-width"
                  @click="$router.push(`/customers/cart-shop/${$route.params.id}`)"
                />
              </div>
              <div class="col-4">
                <q-btn
                  color="blue"
                  :label="$t('purchase')"
                  :disable="total <= 0"
                  class="full-width"
                  @click="save(true)"
                />
              </div>
              <div class="col-4">
                <q-btn
                  color="green"
                  :label="$t('payment')"
                  :disable="total <= 0"
                  class="full-width"
                  @click="save(false)"
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-card>
    </div>
  </q-page>
</template>

<script>

import { defineComponent } from 'vue'
import { date, Dialog, Notify } from 'quasar'
const { formatDate } = date

import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'CashFlowCustomer',

  setup () {
    const storeFirebase = useFirebaseStore()
    const { loadingDatabase, customerById } = storeToRefs(storeFirebase)

    return {
      customerById,
      loadingDatabase
    }
  },
  data () {
    return {
      total: 0,
      description: '',
      date: ''
    }
  },

  computed: {
    customer () {
      return this.customerById(this.$route.params.id)
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
    this.date = formatDate(Date.now(), 'YYYY/MM/DD HH:mm')
    if (this.loadingDatabase) {
      this.globalLoading = true
    }
  },

  mounted () {
    this.firebaseMixinInstance = this.firebaseMixin('cashFlow')
    if (this.$route.params.id && !this.loadingDatabase) {
      this.checkExists(this.$route.params.id)
    }
  },

  methods: {
    checkExists (id) {
      if (!this.customer) {
        Notify.create({
          message: this.$t('notExist'),
          color: 'negative',
          closeBtn: true
        })
        this.$router.push('/customers')
      }
    },
    save (purchase) {
      const customer = this.customer
      const id = this.$route.params.id
      const customerName = `${this.$t('customer')}: ${customer.name}`
      Dialog.create({
        title: this.$t('confirm') + '?',
        message: `${customerName} - ${purchase ? this.$t('purchase') : this.$t('payment')}`,
        persistent: true,
        cancel: true
      }).onOk(() => {
        const sale = {
          type: purchase ? 'purchase' : 'payment',
          description: this.description,
          date: this.date,
          total: this.total,
          customer: {
            id,
            name: customer.name
          }
        }
        this.firebaseMixin('cashFlow').add({ ...sale })
        if (purchase) {
          Dialog.create({
            title: this.$t('purchasePayed') + '?',
            cancel: {
              label: this.$t('no')
            },
            ok: {
              label: this.$t('yes')
            },
            persistent: true
          }).onOk(() => {
            this.firebaseMixin('cashFlow').add({
              type: 'payment',
              total: sale.total,
              customer: sale.customer,
              date: sale.date
            })
            this.forceRerender()
          })
        }
        Notify.create({
          message: this.$t('savedOperation'),
          color: 'positive',
          closeBtn: true
        })
        this.reset()
      })
    },
    reset () {
      this.date = formatDate(Date.now(), 'YYYY/MM/DD HH:mm')
      this.total = 0
      this.description = ''
      this.forceRerender()
    }
  }
})
</script>
