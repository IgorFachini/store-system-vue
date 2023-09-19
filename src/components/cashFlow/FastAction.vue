<template>
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
            :label="$t('purchaseDath')"
            date
          />
          <div class="row justify-between q-my-md">
            <q-btn
              :label="$t('quickExit')"
              color="red"
              icon="arrow_downward"
              :disable="total <= 0"
              @click="save(false)"
            />
            <q-btn
              :label="$t('shoppingCart')"
              color="blue"
              icon="shopping_cart"
              @click="$router.push('/cart-shop')"
            />
            <q-btn
              :label="$t('fastSale')"
              color="green"
              icon="arrow_upward"
              :disable="total <= 0"
              @click="save(true)"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-card>
  </div>
</template>

<script>

import { date, Dialog, Notify } from 'quasar'
const { formatDate } = date
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FastAction',

  data () {
    return {
      total: 0,
      description: '',
      date: ''
    }
  },

  created () {
    this.date = formatDate(Date.now(), 'YYYY/MM/DD HH:mm')
  },

  mounted () {
    this.firebaseMixinInstance = this.firebaseMixin('cashFlow')
  },

  methods: {
    save (fastSale) {
      Dialog.create({
        title: this.$t('confirm') + '?',
        message: fastSale ? this.$t('fastSale') : this.$t('quickExit'),
        persistent: true,
        cancel: true
      }).onOk(() => {
        const sale = {
          type: fastSale ? 'fastSale' : 'quickExit',
          description: this.description,
          date: this.date,
          total: this.total
        }
        this.firebaseMixin('cashFlow').add(sale)
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
    }
  }
})
</script>

<style lang="scss">
  .table-cart-shop .q-table__grid-content {
    flex: unset !important
  }
</style>
