<script setup>
import { computed, onMounted, ref } from 'vue';
import { useFirebaseStore } from 'stores/firebase';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { date } from 'quasar';
import moment from 'moment';

const { formatDate } = date;
const { t } = useI18n({ useScope: 'global' });
const { cashFlow, expenses } = storeToRefs(useFirebaseStore());

const dateFrom = ref('');
const dateTo = ref('');

const dateFromFormatedToIso = computed(() => {
  const date = moment(dateFrom.value, 'DD/MM/YYYY');
  if (date.isValid()) {
    return date.format('YYYY-MM-DD');
  }
  return ''
});

const dateToFormatedToIso = computed(() => {
  const date = moment(dateTo.value, 'DD/MM/YYYY');
  if (date.isValid()) {
    return date.format('YYYY-MM-DD');
  }
  return ''
});
const cashFlowFilterDateRange = computed(() => {
  if (!dateFromFormatedToIso.value || !dateToFormatedToIso.value) {
    return cashFlow.value;
  }
  const startDate = new Date(dateFromFormatedToIso.value);
  const endDate = new Date(dateToFormatedToIso.value);
  return cashFlow.value.filter(c => {
    const date = typeof c.date === 'object' ? new Date(c.date.toDate()) : c.date;
    return (date >= startDate && date <= endDate);
  });
});

const expensesFilterDateRange = computed(() => {
  if (!dateFromFormatedToIso.value || !dateToFormatedToIso.value) {
    return expenses.value;
  }
  const startDate = new Date(dateFromFormatedToIso.value);
  const endDate = new Date(dateToFormatedToIso.value);
  return expenses.value.filter(c => {
    const date = typeof c.date === 'object' ? new Date(c.date.toDate()) : c.date;
    return (date >= startDate && date <= endDate);
  });
});

const totalPurchasePaid = computed(() => {
  return cashFlowFilterDateRange.value.filter(c => c.type === 'purchase' && c.purchasePayed === true).reduce((total, item) => {
    return total + item.total;
  }, 0);
});

const totalPurchaseUnpaid = computed(() => {
  return cashFlowFilterDateRange.value.filter(c => c.type === 'purchase' && c.purchasePayed === false).reduce((total, item) => {
    return total + item.total;
  }, 0);
});

const totalFastsale = computed(() => {
  return cashFlowFilterDateRange.value.filter(c => c.type === 'fastSale').reduce((total, item) => {
    return total + item.total;
  }, 0);
});

const totalPayment = computed(() => {
  return cashFlowFilterDateRange.value.filter(c => c.type === 'payment').reduce((total, item) => {
    return total + item.total;
  }, 0);
});

const totalQuickExit = computed(() => {
  return cashFlowFilterDateRange.value.filter(c => c.type === 'quickExit').reduce((total, item) => {
    return total + item.total;
  }, 0);
});

const totalEntry = computed(() => {
  return totalFastsale.value + totalPayment.value + totalPurchasePaid.value;
});

const totalExit = computed(() => {
  return totalQuickExit.value + totalExpenses.value + totalPurchaseUnpaid.value;
});

const finalValue = computed(() => {
  return totalEntry.value - totalExit.value;
});

const totalExpenses = computed(() => {
  return expensesFilterDateRange.value.reduce((a, b) => a + (b.total || 0), 0);
});

const customersCashFlowGrouped = computed(() => {
  return cashFlowFilterDateRange.value.filter(c => c.customer && c.type === 'purchase')
    .reduce((acc, item) => {
      const customerIndex = acc.findIndex(c => c.id === item.customer.id);
      if (customerIndex < 0) {
        acc.push({
          ...item.customer,
          cashFlow: [item],
          total: item.total,
          totalPurchaseUnpaid: item.purchasePayed === false ? 1 : 0
        });
      } else {
        const customer = acc[customerIndex];
        customer.total += item.total;
        customer.cashFlow.push(item);
        if (item.purchasePayed === false) {
          customer.totalPurchaseUnpaid += 1;
        }
      }
      return acc;
    }, []);
});

const customersCashFlowGroupedColumns = computed(() => {
  return [
    { name: 'name', label: t('name'), field: 'name', sortable: true },
    { name: 'total', label: 'Total', field: 'total', format: value => value.toFixed(2), sortable: true },
    { name: 'totalPurchaseUnpaid', label: 'Total ' + t('unpaidPurchase', 2), field: 'totalPurchaseUnpaid', sortable: true, align: 'left', format: val => val !== undefined ? val : '-' },
    { name: 'expand', label: t('cashFlow') }
  ];
});

const customersCashFlowGroupedCashFlowColumns = computed(() => {
  return [
    { name: 'total', label: 'Total', field: 'total', format: value => value.toFixed(2), sortable: true },
    { name: 'description', label: t('description'), field: 'description' },
    { name: 'purchasePayed', label: t('purchasePayed'), field: 'purchasePayed', sortable: true, align: 'left', format: val => val !== undefined ? t(val ? 'yes' : 'no') : '-' },
    {
      name: 'date',
      label: t('date'),
      field: 'date',
      format: val => formatDate(typeof val === 'object' ? new Date(val.toDate()) : val, 'DD/MM/YYYY'),
      sortable: true
    },
    { name: 'expand', label: t('product', 2), disable: (row) => !row.products || !row.products.length }
  ];
});

const customersCashFlowGroupedProductColumns = computed(() => {
  return [
    { name: 'name', label: t('name'), field: 'name', sortable: true },
    { name: 'quantity', label: t('quantity'), field: 'quantity', sortable: true },
    { name: 'unitaryValue', label: t('unitaryValue'), field: 'unitaryValue', sortable: true },
    { name: 'total', label: 'Total', field: (row) => row.quantity * row.unitaryValue, sortable: true }
  ];
});

function loadCurrentMonth () {
  const date = new Date(), y = date.getFullYear(), m = date.getMonth();
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);
  dateFrom.value = formatDate(firstDay, 'DD/MM/YYYY');
  dateTo.value = formatDate(lastDay, 'DD/MM/YYYY');
}

onMounted(() => {
  loadCurrentMonth();
});

</script>

<template lang="pug">
q-page(class="q-col-gutter-md" padding)
  div.row.q-gutter-md
    v-date(v-model="dateFrom" label="Data de compra inicio")
    v-date(v-model="dateTo" label="Data de compra fim")
  div(class="row q-col-gutter-md")
    div.col-6
      q-field(:label="t('paidPurchase', 2)" readonly stack-label)
        div.text-blue {{ totalPurchasePaid.toFixed(2) }}
      q-field(:label="t('payment', 2)" readonly stack-label)
        div.text-green {{ totalPayment.toFixed(2) }}
      q-field(:label="t('fastSale')" readonly stack-label)
        div.text-green {{ totalFastsale.toFixed(2) }}
      q-field(:label="t('totalEntry')" readonly stack-label, :hint="`${t('paidPurchase', 2)} + ${t('payment', 2)} + ${t('fastSale')}`")
        div.text-green {{ totalEntry.toFixed(2) }}
    div.col-6
      q-field(:label="t('unpaidPurchase', 2)" readonly stack-label)
        div.text-blue {{ totalPurchaseUnpaid.toFixed(2) }}
      q-field(:label="t('expense', 2)" readonly stack-label)
        div.text-red {{ totalExpenses.toFixed(2) }}
      q-field(:label="t('quickExit')" readonly stack-label)
        div.text-red {{ totalQuickExit.toFixed(2) }}
      q-field(:label="t('totalExit')" readonly stack-label, :hint="`${t('unpaidPurchase', 2)} + ${t('expense', 2)} + ${t('quickExit')}`")
        div.text-red {{ totalExit.toFixed(2) }}
  div.row.q-gutter-md
    div.col-12
      q-field(:label="t('finalValue')" readonly stack-label, :hint="`${t('totalEntry', 2)} - ${t('totalExit', 2)} `")
        div(:class="finalValue < 0 ? 'text-red' : 'text-green'") {{ finalValue.toFixed(2) }}
  div
    v-table-crud(
      :title="t('purchase', 2) + ' - ' + t('customer', 2)"
      :rows="customersCashFlowGrouped"
      :columns="customersCashFlowGroupedColumns"
      hide-add
    )
      template(v-slot:expand="propsCashFlow")
        v-table-crud(
          :title="t('cashFlow') + ': ' + propsCashFlow.row.name"
          :rows="propsCashFlow.row.cashFlow"
          :columns="customersCashFlowGroupedCashFlowColumns"
          hide-add
        )
          template(v-slot:expand="propsProducs")
            v-table-crud(
              :title="t('product', 2) + ': ' + propsCashFlow.row.name"
              :rows="propsProducs.row.products"
              :columns="customersCashFlowGroupedProductColumns"
              hide-add
            )
</template>
