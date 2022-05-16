import { store } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import { PiniaFirestoreSync } from 'pinia-plugin-firestore-sync'

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
