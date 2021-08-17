import { boot } from 'quasar/wrappers'
import VInput from '../components/common/VInput.vue'
import VSelect from '../components/common/VSelect.vue'
import VTableCrud from '../components/common/VTableCrud.vue'
import VueHtmlToPaper from '../plugins/VueHtmlToPaper'

export default boot(({ app }) => {
  app.component('VInput', VInput)
  app.component('VSelect', VSelect)
  app.component('VTableCrud', VTableCrud)
  app.use(VueHtmlToPaper)
})

export { }
