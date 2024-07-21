<script setup>
import { date, Dialog } from 'quasar'
import { ref, computed } from 'vue'
const { formatDate } = date
import { useRouter } from 'vue-router'
const router = useRouter()
import { firebaseMixin } from 'boot/firebase'
import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'global' });
const $t = t
const storeFirebase = useFirebaseStore()
const { loadingDatabase, productsStockHistory, products } = storeToRefs(storeFirebase)

const cashFlowToEditDialog = ref({})
const dialogOpen = ref(false)

const props = defineProps({
  customerId: {
    type: String,
    default: ''
  }
})

const search = ref('')
const paginationInside = ref({
  page: 1,
  rowsPerPage: 25,
  sortBy: 'date',
  descending: true
})
const selected = ref([])
const typesOptions = ref([
  $t('quickExit'),
  $t('payment'),
  $t('fastSale'),
  $t('purchase')
])

const customer = computed(() => {
  return storeFirebase.customerById(props.customerId)
})

const cashFlow = computed(() => {
  return storeFirebase.cashFlowByCustomerIdOrAll(props.customerId).map(item => {
    item.date = getDate(item.date)
    return item
  })
})

const debt = computed(() => {
  return cashFlow.value.reduce((acc, row) => {
    if (row.type === 'fastSale' || row.type === 'payment' || row.purchasePayed === true) {
      return acc + row.total
    }
    if (row.purchasePayed === false || row.type === 'quickExit') {
      return acc - row.total
    }

    return acc
  }, 0)
})

const columnsCashFlow = computed(() => {
  return [
    {
      name: 'description',
      label: $t('description'),
      align: 'left'
    },
    { name: 'customer', label: $t('customer'), field: 'customer', sortable: true, align: 'left', format: val => val !== undefined ? val.name : '-' },
    { name: 'total', label: 'Total', field: 'total', classes: row => getClassColor(row.type), sortable: true },
    { name: 'purchasePayed', label: $t('purchasePayed'), field: 'purchasePayed', sortable: true, align: 'left', format: val => val !== undefined ? $t(val ? 'yes' : 'no') : '-' },
    { name: 'type', label: $t('type'), field: 'type', sortable: true, align: 'left', format: val => $t(val) },
    { name: 'date', label: $t('purchaseDate'), field: 'date', sortable: true, align: 'left', format: val => formatDate(val, 'DD/MM/YYYY') },
    {
      name: 'createdAt',
      label: $t('createdAt'),
      field: 'createdAt',
      format: val => formatDate(val ? val.toDate() : '', 'DD/MM/YYYY'),
      sortable: true
    },
    { name: 'action', label: $t('action') }
  ]
})

function edit (row) {
  console.log('row', row)
  if (row.type === 'purchase' || row.products) {
    router.push({ name: 'cartShop.edit', params: { id: row.id } })
    return
  }
  this.cashFlowToEditDialog = row
  this.dialogOpen = true
}

function deleteSelected () {
  Dialog.create({
    title: `${$t('remove')} ${$t('selected', selected.value.length)} ?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    selected.value.forEach(row => {
      firebaseMixin('cashFlow').id(row.id).delete()
      deleteProductStockHistory(row)
    })
    selected.value = []
  })
}

function deleteProductStockHistory (row) {
  productsStockHistory.value.filter(item => item.refId === row.id).forEach(item => {
    firebaseMixin('productsStockHistory').id(item.id).delete()
  })
}

function makeAllPurchasePayed () {
  Dialog.create({
    title: `${$t('pay')} ${$t('selected', selected.value.filter(({ type }) => type === 'purchase').length)} ?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    selected.value.filter(({ type }) => type === 'purchase').forEach(row => {
      if (row.type === 'purchase' && !row.purchasePayed) {
        update({ ...row, purchasePayed: true })
      }
    })
    selected.value = []
  })
}

function sumProductsWithDiscountValue (products) {
  return products.reduce((acc, item) => acc + (item.discountObject
    ? calcDiscountResult(item.discountObject, item.unitaryValue) * item.quantity
    : item.unitaryValue * item.quantity) || 0, 0)
}

function calcDiscountResult (discountObject, value) {
  if (!discountObject?.type) {
    return 0
  }
  return discountObject.type === 'value'
    ? (value - discountObject.discount)
    : value - (value * discountObject.discount / 100)
}

function getDiscountValue (discountObject, value) {
  if (!discountObject?.type) {
    return 0
  }
  return discountObject.type === 'value'
    ? discountObject.discount
    : (value * discountObject.discount / 100)
}

function update (row) {
  firebaseMixin('cashFlow').id(row.id).update(row)
}

function getDate (val) {
  return typeof val === 'object' ? formatDate(val.toDate(), 'YYYY/MM/DD HH:mm') : val
}

function getClassColor (type) {
  const colorMapType = {
    quickExit: 'text-red',
    payment: 'text-green',
    fastSale: 'text-green',
    purchase: 'text-blue'
  }
  return colorMapType[type]
}

function resetDialog () {
  dialogOpen.value = false
  cashFlowToEditDialog.value = {}
}

async function printSale (row) {
  console.log('printSale', row, getPrinterLines(row))
  // example of row
  // {
  //   "id": "1710281236255",
  //   "createdAt": {
  //       "seconds": 1710281236,
  //       "nanoseconds": 255000000
  //   },
  //   "total": 80,
  //   "updatedAt": {
  //       "seconds": 1710281236,
  //       "nanoseconds": 255000000
  //   },
  //   "customer": {
  //       "id": "pUSqvf7pRcNpXIy3DlQO",
  //       "name": "mercado são joão"
  //   },
  //   "products": [{
  //       "id": "product_1702162203881",
  //       "unitaryValue": 40,
  //       "name": "aaa11",
  //       "quantity": 2
  //   }],
  //   "purchasePayed": true,
  //   "date": "2024/03/12 00:00",
  //   "type": "purchase"
  // }
  let printerDevice;
  let printerServer;
  let printerService;
  let printerCharacteristic;
  // https://github.com/lucianopereira86/Quasar-PWA-Bluetooth-Printer/blob/master/src/pages/Index.vue
  try {
    printerDevice = await navigator.bluetooth.requestDevice({
      filters: [{
        services: ['000018f0-0000-1000-8000-00805f9b34fb']
      }],
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'],
      characteristic: '00002af1-0000-1000-8000-00805f9b34fb'
    });

    printerServer = await printerDevice.gatt.connect();
    const services = await printerServer.getPrimaryServices();

    if (services.length > 0) {
      console.log('Serviços encontrados:');
      services.forEach(service => console.log(service.uuid));

      // Tente conectar ao primeiro serviço encontrado
      printerService = services[0];
      const characteristics = await printerService.getCharacteristics();

      if (characteristics.length > 0) {
        console.log('Características encontradas:');
        characteristics.forEach(characteristic => console.log(characteristic.uuid));

        // Conectar à primeira característica encontrada
        printerCharacteristic = characteristics[1];
        console.log('Conectado à impressora 3D!');

        if (!printerCharacteristic) {
          alert('Você precisa se conectar à impressora primeiro!');
          return;
        }

        const gcodeCommands = getPrinterLines(row);

        for (const command of gcodeCommands) {
          const commandBuffer = new TextEncoder().encode(command + '\n');
          try {
            await printerCharacteristic.writeValue(commandBuffer);
            await new Promise(resolve => setTimeout(resolve,
              500)); // Aguarde um pouco antes de enviar o próximo comando
          } catch (error) {
            console.error('Erro ao enviar comando G-code: ', error);
          }
        }
        console.log('Comandos enviados à impressora!');
        // desconectar da impressora
        await printerServer.disconnect();
      } else {
        throw new Error('Nenhuma característica encontrada no serviço selecionado.');
      }
    } else {
      throw new Error('Nenhum serviço encontrado no dispositivo selecionado.');
    }
  } catch (error) {
    console.error('Erro ao conectar à impressora 3D: ', error);
  }
}

// construir cada linha do pedido na mini impressora 3d conforme exemplo abaixo
// deve conter
// Impresso em dd/mm/yyyy hh:mm
// -----------------------
// Emissao: dd/mm/yyyy
// -----------------------
// # QTD UN VL UN R$
// -----------------------
// 001 (codigo do produto) (nome do produto)
//     2 UN X 10,00                            20,00
// 002 (codigo do produto) (nome do produto)
//     1 UN X 5,00                              5,00
// -----------------------
// Total: R$                                   25,00
function getPrinterLines (row) {
  return [
    `Impresso em ${formatDate(new Date(), 'DD/MM/YYYY HH:mm')}`,
    '-----------------------',
    `Emissao: ${formatDate(row.date, 'DD/MM/YYYY')}`,
    '-----------------------',
    '# QTD UN VL UN R$',
    '-----------------------',
    ...row.products.map((product, index) => {
      const productIndex = index + 1;
      const productCode = products.value.find(p => p.id === product.id)?.code || '-';
      const productName = product.name;
      const productQuantity = product.quantity;
      const productUnitaryValue = product.unitaryValue;
      const productTotalValue = productQuantity * productUnitaryValue;

      return `${productIndex} ${productCode} ${productName}\n    ${productQuantity} UN X ${productUnitaryValue.toFixed(2)} = ${productTotalValue.toFixed(2)}`;
    }),
    '-----------------------',
    `Total: R$ ${row.total.toFixed(2)}`,
    '',
    '',
    ''
  ]
}

</script>

<template lang="pug">
q-dialog(
  style="width: 90vw; max-width: 600px"
  v-model="dialogOpen"
)
  fast-action(
    :cash-flow-edit="cashFlowToEditDialog"
    @done="resetDialog"
  )

q-table(
  v-model:pagination="paginationInside"
  :rows="cashFlow"
  :columns="columnsCashFlow"
  :loading="loadingDatabase"
  class="full-width"
  :filter="search"
  row-key="id"
  v-model:selected="selected"
  selection="multiple"
)
  template(
    #top-left
  )
    div.q-gutter-y-sm
      div.q-table__title
        | {{ $t('cashFlow') }}
      div(v-if="customerId" class="q-table__title")
        | {{ $t('customer') }}: {{ customer.name }}
      div.row
        q-field(:label="t('debt')" readonly stack-label, :hint="`(${$t('fastSale')} + ${$t('payment')} + ${$t('purchasePayed')}) - (${$t('unpaidPurchase')} + ${$t('quickExit')})`")
          div(:class="debt < 0 ? 'text-red' : 'text-green'") {{ debt.toFixed(2) }}
  template(
    #top-right
  )
    div.row.q-gutter-md
      q-btn(
        label="Pagar compras"
        color="green"
        :disabled="!selected.filter(({ type }) => type === 'purchase').length"
        @click="makeAllPurchasePayed"
      )
      q-btn(
        label="Deletar"
        color="negative"
        :disabled="!selected.length"
        @click="deleteSelected"
      )
      q-select(
        style="width: 150px"
        v-model="search"
        :label="$t('type')"
        :options="typesOptions"
        emit-value
        map-options
        clearable
      )
      q-input(
        v-model="search"
        debounce="300"
        :placeholder="$t('search')"
      )
        template#append
          q-icon(name="search")
  template(
    #body-cell-description="{ row }"
  )
    q-td(:class="getClassColor(row.type)")
      div
        | {{ row.description || $t(row.type) }}
      div(v-for="product in row.products" :key="product.name")
        div(v-if="product.discountObject")
          | {{ product.name }}: {{ product.unitaryValue }} {{ $t('by') }} {{ calcDiscountResult(product.discountObject, product.unitaryValue).toFixed(2) }} x  {{ product.quantity }} = {{ (calcDiscountResult(product.discountObject, product.unitaryValue) * product.quantity).toFixed(2) }}
        div(v-else)
          | {{ product.name }}: {{ product.unitaryValue }} x {{ product.quantity }} = {{ (product.unitaryValue * product.quantity) }}
      div(v-if="row.subTotalDiscountObject")
        | {{ $t('discount') }}: {{ getDiscountValue(row.subTotalDiscountObject, sumProductsWithDiscountValue(row.products)) }}
  template(
    #body-cell-action="{ row }"
  )
    q-td
      q-btn-dropdown(
        dense
        dropdown-icon="menu"
        color="primary"
      )
        q-item(
          class=" column no-wrap q-gutter-md"
        )
          q-btn(
            :label="$t('edit')"
            dense
            color="primary"
            @click="edit(row)"
          )
          q-btn(
            v-if="row.type === 'purchase' || row.products"
            :label="$t('printOrderBluetoothPrinter')"
            dense
            color="primary"
            @click="printSale(row)"
          )
          q-btn(
            :label="$t('delete')"
            dense
            color="negative"
            :loading="row.loading"
            @click="firebaseDeleteItem('cashFlow', 'cashFlow', row.id).then(() => deleteProductStockHistory(row))"
          )

</template>
