import { defineStore } from 'pinia'
// import { collection, getFirestore } from 'firebase/firestore'
import { getFirestore, CollectionReference, collection, onSnapshot } from 'firebase/firestore'
import type { DocumentData } from '@firebase/firestore-types'
import { Customer } from 'src/models/models'

// This is just a helper to add the type to the db responses
const createCollection = <T = DocumentData>(collectionName: string) => {
  const firestore = getFirestore()
  return collection(firestore, collectionName) as CollectionReference<T>
}

const collectionsName = [
  'customers'
  // 'products',
  // 'expenses',
  // 'expenseProducts',
  // 'categories',
  // 'productsStockHistory',
  // 'expenseProductsStockHistory',
  // 'cashFlow',
  // 'suppliers'
]
interface State {
  loadingDatabase: boolean;
  customers: CollectionReference<Customer>;
  [key: string]: unknown;
}

export const useFirebaseStore = defineStore('firebase', {
  state: (): State => ({
    loadingDatabase: false,
    customers: createCollection<Customer>('customers')
    // ...collectionsName.reduce((prev, curr) => {
    //   prev[curr] = []
    //   return prev
    // }, {})
  }),

  getters: {
    // cashFlowByCustomerIdOrAll: state => customerId => customerId ? state.cashFlow.filter(cashFlow => cashFlow.customer?.id === customerId) : state.cashFlow,
    // customerById: state => customerId => state.customers.find(customer => customer.id === customerId),
    // countProductsStockHistoryById (state) {
    //   return (id) => state.productsStockHistory.filter(item => item.productId === id).reduce((acc, item) => {
    //     return acc + item.quantity
    //   }, 0)
    // },
    // countExpenseProductsStockHistoryById (state) {
    //   return (id) => state.expenseProductsStockHistory.filter(item => item.expenseProductId === id).reduce((acc, item) => {
    //     return acc + item.quantity
    //   }, 0)
    // }
  },

  actions: {
    async setup () {
      this.loadingDatabase = true
      for (let index = 0; index < collectionsName.length; index++) {
        const key = collectionsName[index]
        await new Promise<void>((resolve, reject) => {
          let notified = false
          const firestore = getFirestore()
          onSnapshot(collection(firestore, key), (qs) => {
            const datum = qs.docs.map(d => ({ id: d.id, ...d.data() }))
            // store.$patch((state) => {
            //   state[key] = datum
            // })
            this[key] = datum
            console.log('this[key]', this[key])
            if (!notified) {
              notified = true
              resolve()
            }
          }, (error) => {
            if (!notified) {
              notified = true
              reject(error)
            }
          })
        })
      }
      this.loadingDatabase = false
    }
  }
})
