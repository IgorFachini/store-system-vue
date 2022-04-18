import { boot } from 'quasar/wrappers'
import VInput from '../components/common/VInput.vue'
import VSelect from '../components/common/VSelect.vue'
import VTableCrud from '../components/common/VTableCrud.vue'
import ProductStockHistoryCount from '../components/product/ProductStockHistoryCount.vue'

export default boot(({ app }) => {
  app.component('VInput', VInput)
  app.component('VSelect', VSelect)
  app.component('VTableCrud', VTableCrud)
  app.component('ProductStockHistoryCount', ProductStockHistoryCount)
})

export { }
