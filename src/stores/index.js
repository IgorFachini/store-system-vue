import { store } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import { onSnapshot } from 'firebase/firestore'

export const PiniaFirestoreSync = ({ store }) => {
  store.syncCollection = (key, ref) => {
    return new Promise((resolve, reject) => {
      let notified = false

      onSnapshot(ref, (qs) => {
        const datum = qs.docs.map(d => ({ id: d.id, ...d.data() }))
        store.$patch((state) => {
          state[key] = datum
        })
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
}

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store((/* { ssrContext } */) => {
  const pinia = createPinia().use(PiniaFirestoreSync)

  // You can add Pinia plugins here
  // pinia.use(SomePiniaPlugin)

  return pinia
})
