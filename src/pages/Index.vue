<script setup>
import { computed, onMounted, ref } from 'vue';
import { useFirebaseStore } from 'stores/firebase';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { date } from 'quasar';

const { formatDate } = date;
const { t } = useI18n({ useScope: 'global' });
const { cashFlow, expenses } = storeToRefs(useFirebaseStore());

const modelData = ref({
  from: '',
  to: ''
});

const cashFlowFilterDateRange = computed(() => {
  if (!modelData.value.from || !modelData.value.to) {
    return cashFlow.value;
  }
  const startDate = new Date(modelData.value.from);
  const endDate = new Date(modelData.value.to);
  return cashFlow.value.filter(c => {
    const date = typeof c.date === 'object' ? new Date(c.date.toDate()) : c.date;
    return (date >= startDate && date <= endDate);
  });
});

const expensesFilterDateRange = computed(() => {
  if (!modelData.value.from || !modelData.value.to) {
    return expenses.value;
  }
  const startDate = new Date(modelData.value.from);
  const endDate = new Date(modelData.value.to);
  return expenses.value.filter(c => {
    const date = typeof c.date === 'object' ? new Date(c.date.toDate()) : c.date;
    return (date >= startDate && date <= endDate);
  });
});

const totalPurchase = computed(() => {
  return cashFlowFilterDateRange.value.filter(c => c.type === 'purchase').reduce((total, item) => {
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
  return totalFastsale.value + totalPayment.value;
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
          total: item.total
        });
      } else {
        const customer = acc[customerIndex];
        customer.total += item.total;
        customer.cashFlow.push(item);
      }
      return acc;
    }, []);
});

const customersCashFlowGroupedColumns = computed(() => {
  return [
    { name: 'name', label: t('name'), field: 'name' },
    { name: 'total', label: 'Total', field: 'total', format: value => value.toFixed(2), sortable: true },
    { name: 'expand', label: t('cashFlow') }
  ];
});

const customersCashFlowGroupedCashFlowColumns = computed(() => {
  return [
    { name: 'total', label: 'Total', field: 'total', format: value => value.toFixed(2), sortable: true },
    { name: 'description', label: t('description'), field: 'description' },
    {
      name: 'date',
      label: t('date'),
      field: 'date',
      format: val => formatDate(val ? val.toDate() : '', 'DD/MM/YYYY'),
      sortable: true
    },
    { name: 'expand', label: t('product', 2), disable: (row) => !row.products || !row.products.length }
  ];
});

const customersCashFlowGroupedProductColumns = computed(() => {
  return [
    { name: 'name', label: t('name'), field: 'name' },
    { name: 'quantity', label: t('quantity'), field: 'quantity', sortable: true },
    { name: 'unitaryValue', label: t('unitaryValue'), field: 'unitaryValue', sortable: true },
    { name: 'total', label: 'Total', field: (row) => row.quantity * row.unitaryValue, sortable: true }
  ];
});

function loadCurrentMonth () {
  const date = new Date(), y = date.getFullYear(), m = date.getMonth();
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);
  modelData.value.from = formatDate(firstDay, 'YYYY/MM/DD');
  modelData.value.to = formatDate(lastDay, 'YYYY/MM/DD');
}

onMounted(() => {
  loadCurrentMonth();
});

</script>

<template lang="pug">
q-page(class="q-col-gutter-md" padding)
  v-input(v-model="modelData" :label="t('purchaseDath')" date range clearable)
  div(class="row q-col-gutter-md")
    div.col-6
      q-field(:label="t('sold')" readonly stack-label)
        div.text-blue {{ totalPurchase.toFixed(2) }}
      q-field(:label="t('receveid')" readonly stack-label)
        div.text-green {{ totalPayment.toFixed(2) }}
      q-field(:label="t('fastSale')" readonly stack-label)
        div.text-green {{ totalFastsale.toFixed(2) }}
      q-field(:label="t('totalEntry')" readonly stack-label)
        div.text-green {{ totalEntry.toFixed(2) }}
    div.col-6
      q-field(:label="t('expense', 2)" readonly stack-label)
        div.text-red {{ totalExpenses.toFixed(2) }}
      q-field(:label="t('quickExit')" readonly stack-label)
        div.text-red {{ totalQuickExit.toFixed(2) }}
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
