<script setup>
import { date, Dialog, Notify } from 'quasar'
import { ref, onMounted } from 'vue'
const { formatDate } = date
import { firebaseMixin } from 'boot/firebase'
import moment from 'moment';
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'global' });
const $t = t
const emit = defineEmits(['done'])

const props = defineProps({
  cashFlowEdit: {
    type: Object,
    default: () => ({})
  }
})

const cashFlowForm = ref({
  total: 0,
  description: '',
  date: ''
})

function save (fastSale) {
  const ref = firebaseMixin('cashFlow')
  const action = props.cashFlowEdit.id
    ? ref.id(props.cashFlowEdit.id).update : ref.add
  Dialog.create({
    title: $t('confirm') + '?',
    message: fastSale ? $t('fastSale') : $t('quickExit'),
    persistent: true,
    cancel: true
  }).onOk(() => {
    const sale = {
      ...cashFlowForm.value,
      type: fastSale ? 'fastSale' : 'quickExit',
      date: moment(cashFlowForm.value.date, 'DD/MM/YYYY').toDate()
    }
    action(sale)
    Notify.create({
      message: $t('savedOperation'),
      color: 'positive',
      closeBtn: true
    })
    reset()
  })
}

function reset () {
  cashFlowForm.value = {
    total: 0,
    description: '',
    date: formatDate(Date.now(), 'DD/MM/YYYY')
  }
  emit('done')
}

onMounted(() => {
  cashFlowForm.value.date = formatDate(Date.now(), 'DD/MM/YYYY')
  if (props.cashFlowEdit.id) {
    cashFlowForm.value = {
      ...props.cashFlowEdit,
      date: formatDate(props.cashFlowEdit.date, 'DD/MM/YYYY')
    }
  }
})

</script>

<template lang="pug">
div.row.justify-around.full-width.q-pa-md
  q-card.q-table__card.col-xs-12.col-sm-12.col-md-6.col-lg-6
    q-item
      q-item-section
        v-input(
          v-model="cashFlowForm.total"
          :label="$t('value')"
          currency
        )
        v-input(
          v-model="cashFlowForm.description"
          :label="$t('description')"
        )
    q-item
      q-item-section
        v-date(
          v-model="cashFlowForm.date"
          :label="$t('purchaseDate')"
        )
        div.row.justify-between.q-my-md
          q-btn(
            v-if="!cashFlowForm.id || cashFlowForm.type === 'quickExit'"
            :label="$t('quickExit')"
            color="red"
            icon="arrow_downward"
            :disable="cashFlowForm.total <= 0"
            @click="save(false)"
          )
          q-btn(
            v-if="!cashFlowForm.id"
            :label="$t('shoppingCart')"
            color="blue"
            icon="shopping_cart"
            @click="$router.push('/cart-shop')"
          )
          q-btn(
            v-if="!cashFlowForm.id || cashFlowForm.type === 'fastSale'"
            :label="$t('fastSale')"
            color="green"
            icon="arrow_upward"
            :disable="cashFlowForm.total <= 0"
            @click="save(true)"
          )

</template>

<style lang="scss">
  .table-cart-shop .q-table__grid-content {
    flex: unset !important
  }
</style>
