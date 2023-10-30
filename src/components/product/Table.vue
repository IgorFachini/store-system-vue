<script setup>

import { date } from 'quasar'
import { useRouter } from 'vue-router'
import { useFirebaseStore } from 'stores/firebase'
import { firebaseMixin } from 'boot/firebase'
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
// import { firebaseGetFile } from 'src/boot/firebase'

const { t } = useI18n({ useScope: 'global' });
const { formatDate } = date
const router = useRouter()

const storeFirebase = useFirebaseStore()
const { products, loadingDatabase } = storeToRefs(storeFirebase);

const columns = computed(() => [
  // { name: 'expand', label: t('recipe'), align: 'left' },
  { name: 'action', label: t('action'), align: 'left' },
  // ADD image
  // { name: 'image', label: t('image'), field: row => { firebaseGetFile(`product-${row.name}`).then((image) => { row.image = image }) }, align: 'left' },
  { name: 'name', label: t('name'), field: 'name', sortable: true },
  { name: 'saleValue', label: t('saleValue'), field: 'saleValue', sortable: true },
  { name: 'purchasePrice', label: t('purchasePrice'), field: 'purchasePrice', sortable: true },
  {
    name: 'currentInventory',
    label: t('currentInventory'),
    field: row => storeFirebase.countProductsStockHistoryById(row.id),
    sortable: true
  },
  { name: 'description', label: t('description'), field: 'description' },
  // {
  //   name: 'category',
  //   label: t('category'),
  //   field: 'category',
  //   format: category => category ? category.name : '',
  //   sortable: true
  // },
  { name: 'code', label: t('code'), field: 'code' },
  {
    name: 'createdAt',
    label: t('createdAt'),
    field: 'createdAt',
    format: val => formatDate(val ? val.toDate() : '', 'DD/MM/YYYY'),
    sortable: true
  },
  {
    name: 'updatedAt',
    label: t('updatedAt'),
    field: ({ updatedAt = null }) => updatedAt ? formatDate(updatedAt.toDate(), 'DD/MM/YYYY') : '',
    sortable: true
  }
])

function edit (row) {
  router.push({
    name: 'products.edit',
    params: { id: row.id }
  })
}

function stockHistory (row) {
  router.push({
    name: 'products.stockHistory',
    params: { id: row.id }
  })
}

function deleteStockHistory (id) {
  firebaseMixin('productsStockHistory').ref().where('productId', '==', id).get().then(snapshot => {
    snapshot.docs.forEach(doc => {
      doc.ref.delete()
    })
  })
}
</script>

<template lang="pug">
v-table-crud(
  :title="$t('product', 2)"
  :rows="products"
  :columns="columns"
  :loading="loadingDatabase"
  @edit="edit"
  @delete="row => firebaseDeleteItem('products', 'product', row).then(() => deleteStockHistory(row.id))"
)
  template(#body-cell-image="props")
    q-img(
      v-if="props.row.image"
      :src="props.row.image"
      style="height: 100px; max-width: 100px"
    )
  template(#action-more="props")
    q-btn(
      :label="$t('stockHistory')"
      dense
      color="blue"
      @click="stockHistory(props.row)"

    )
</template>
