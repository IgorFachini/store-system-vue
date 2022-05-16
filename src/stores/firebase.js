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
    ...collectionsName.reduce((prev, curr) => {
      prev[curr] = []
      return prev
    }, {})
  }),

  getters: {
  },

  actions: {
    countProductsStockHistoryById (id) {
      return this.productsStockHistory.filter(item => item.productId === id).reduce((acc, item) => {
        return acc + item.quantity
      }, 0)
    },
    countExpenseProductsStockHistoryById (id) {
      return this.expenseProductsStockHistory.filter(item => item.expenseProductId === id).reduce((acc, item) => {
        return acc + item.quantity
      }, 0)
    },
    setup () {
      const store = getFirestore()
      collectionsName.forEach(name => {
        this.sync(name, collection(store, name))
      })
    }
  }
})
