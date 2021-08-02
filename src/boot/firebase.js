import { boot } from 'quasar/wrappers'
import { firestorePlugin } from 'vuefire'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  // databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

const firebaseApp = firebase.initializeApp(firebaseConfig)
const firebaseAuth = firebaseApp.auth()

const db = firebaseApp.firestore()
const { Timestamp } = firebase.firestore

db.settings({ timestampsInSnapshots: true })
db.enablePersistence()
  .then((res) => {
    console.log('persistenceok', res)
  })
  .catch((err) => {
    console.log('persistenceErr', err)
  })

export default boot(({ app }) => {
  const firebaseMixin = {
    methods: {
      firebaseMixin (refName) {
        const ref = db.collection(refName)

        return {
          ref () {
            return ref
          },

          syncToField (fieldName) {
            this[fieldName] = ref
          },

          add (data) {
            return ref.add({
              ...data,
              createdAt: Timestamp.fromDate(new Date())
            })
          },

          id (id) {
            return {
              set (data) {
                return ref.doc(id).set({
                  ...data,
                  updatedAt: Timestamp.fromDate(new Date())
                })
              },

              update (data) {
                return ref.doc(id).update({
                  ...data,
                  updatedAt: Timestamp.fromDate(new Date())
                })
              },

              delete (params) {
                return ref.doc(id).delete()
              }
            }
          }
        }
      }
    }
  }
  app.mixin(firebaseMixin)
  app.use(firestorePlugin)
  app.config.globalProperties.$firestore = firebase.firestore()
  app.config.globalProperties.$firebaseAuth = firebaseAuth
})

export { firebaseAuth, db, Timestamp }
