<template>
  <v-table-crud
    :title="$t('category', 2)"
    :rows="categories"
    :columns="columns"
    :loading="loadingDatabase"
    @edit="edit"
    @delete="row => firebaseDeleteItem('categories', 'category', row.id)"
  />
</template>

<script>

import { date, Dialog, Notify } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date

import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'CategoriesTable',

  setup () {
    const storeFirebase = useFirebaseStore()
    const { categories, loadingDatabase } = storeToRefs(storeFirebase)

    return {
      categories,
      loadingDatabase
    }
  },

  // data () {
  //   return {
  //     firebaseMixinInstance: null,
  //     loading: false,
  //     categories: []
  //   }
  // },

  computed: {
    columns () {
      return [
        { name: 'name', label: this.$t('name'), field: 'name', sortable: true },
        { name: 'description', label: this.$t('description'), field: 'description' },
        {
          name: 'createdAt',
          label: this.$t('createdAt'),
          field: 'createdAt',
          format: val => formatDate(val ? val.toDate() : '', 'DD/MM/YYYY'),
          sortable: true
        },
        {
          name: 'updatedAt',
          label: this.$t('updatedAt'),
          field: ({ updatedAt = null }) => updatedAt ? formatDate(updatedAt.toDate(), 'DD/MM/YYYY') : '',
          sortable: true
        },
        { name: 'action', label: this.$t('action'), align: 'left' }
      ]
    }
  },

  // mounted () {
  //   this.loading = true
  //   this.firebaseMixinInstance = this.firebaseMixin('categories')

  //   this.firebaseMixinInstance.bindField('categories').finally(() => {
  //     this.loading = false
  //   })
  // },

  methods: {
    edit (row) {
      this.$router.push({
        name: 'categories.edit',
        params: { id: row.id }
      })
    },
    deleteAction (row) {
      Dialog.create({
        title: `${this.$q.lang.label.remove} ${this.$t('category')}`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        row.loading = true
        this.firebaseMixinInstance.id(row.id).delete().finally(() => {
          row.loading = false
          Notify.create({
            message: this.$t('savedOperation'),
            color: 'positive',
            closeBtn: true
          })
        })
      })
    }
  }
})
</script>
