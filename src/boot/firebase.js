import { boot } from 'quasar/wrappers'
import { firestorePlugin, rtdbPlugin } from 'vuefire'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/database'
import 'firebase/compat/auth'

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

const firebaseApp = firebase.initializeApp(firebaseConfig)
const firebaseAuth = firebase.auth()
firebaseApp.getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}

const fr = firebaseApp.firestore()
const db = firebaseApp.database()
const { Timestamp } = firebase.firestore

fr.settings({ timestampsInSnapshots: true })

fr.enablePersistence()
  .then((res) => {
    console.log('persistenceok', res)
  })
  .catch((err) => {
    console.log('persistenceErr', err)
  })

export default boot(({ app }) => {
  const firebaseMixin = {
    methods: {
      firebaseMixin (refName, rtdb) {
        const refThis = this
        const ref = rtdb ? db.ref(refName) : fr.collection(refName)

        return {
          ref () {
            return ref
          },

          bindField (fieldName) {
            return refThis[rtdb ? '$rtdbBind' : '$bind'](fieldName, ref)
          },

          add (data) {
            const send = { ...data, createdAt: rtdb ? new Date().getTime() : Timestamp.fromDate(new Date()) }
            return ref[rtdb ? 'push' : 'add'](send)
          },

          id (id) {
            return {
              doc () {
                return ref.doc(id)
              },

              set (data) {
                const setRef = rtdb ? db.ref(`${refName}/${id}`) : ref.doc(id)

                return setRef.set({
                  ...data,
                  updatedAt: rtdb ? new Date().getTime() : Timestamp.fromDate(new Date())
                })
              },

              update (data) {
                const updateRef = rtdb ? db.ref(`${refName}/${id}`) : ref.doc(id)
                return updateRef.update({
                  ...data,
                  updatedAt: rtdb ? new Date().getTime() : Timestamp.fromDate(new Date())
                })
              },

              delete () {
                return rtdb ? db.ref(`${refName}/${id}`).remove() : ref.doc(id).delete()
              }
            }
          }
        }
      }
    }
  }
  app.mixin(firebaseMixin)
  app.use(firestorePlugin)
  app.use(rtdbPlugin)
  app.config.globalProperties.$firestore = firebase.firestore()
  app.config.globalProperties.$firebaseAuth = firebaseAuth
})

export { firebaseApp, firebaseAuth, fr, Timestamp }
