import { defineStore } from 'pinia'
import { collection, getFirestore } from 'firebase/firestore'

const collectionsName = [
  'customers',
  'products',
  'expenses',
  'expenseProducts',
  'categories',
  'productsStockHistory',
  'expenseProductsStockHistory'
]

export const useFirebaseStore = defineStore('firebase', {
  state: () => ({
    loadingDatabase: false,
    ...collectionsName.reduce((prev, curr) => {
      prev[curr] = []
      return prev
    }, {})
  }),

  getters: {
    countProductsStockHistoryById (state) {
      return (id) => state.productsStockHistory.filter(item => item.productId === id).reduce((acc, item) => {
        return acc + item.quantity
      }, 0)
    },
    countExpenseProductsStockHistoryById (state) {
      return (id) => state.expenseProductsStockHistory.filter(item => item.expenseProductId === id).reduce((acc, item) => {
        return acc + item.quantity
      }, 0)
    }
  },

  actions: {
    async setup () {
      const store = getFirestore()
      this.loadingDatabase = true
      for (let index = 0; index < collectionsName.length; index++) {
        const name = collectionsName[index]
        await this.syncCollection(name, collection(store, name))
      }
      this.loadingDatabase = false
    }
  }
})
