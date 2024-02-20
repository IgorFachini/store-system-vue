<template>
  <q-form
    ref="form"
    class="full-width"
    @submit="save"
  >
    <v-input
      v-model="form.name"
      :label="$t('name')"
      :rules="[
        val => val && val.length || $t('fillTheField', { field: $t('name') }),
        val => !!form.id && nameBefore === val || (!categories.map(c => c.name.toLowerCase()).includes(val.toLowerCase()) || $t('alredyExist'))
      ]"
      :disable="viewMode"
    />

    <v-input
      v-model="form.description"
      type="textarea"
      :label="$t('description')"
      :disable="viewMode"
    />

    <div class="row q-gutter-md q-mt-md justify-between">
      <q-btn
        label="Reset"
        @click="reset"
      />
      <q-btn
        :label="$t('save')"
        type="submit"
        color="positive"
      />
    </div>
  </q-form>
</template>

<script>

import { Notify } from 'quasar'
import { defineComponent } from 'vue'

import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'CategoriesForm',

  emits: ['done'],

  setup () {
    const storeFirebase = useFirebaseStore()
    const { categories, loadingDatabase } = storeToRefs(storeFirebase)

    return {
      categories,
      loadingDatabase,
      modelForm: {
        name: '',
        description: ''
      }
    }
  },

  data () {
    return {
      // firebaseMixinInstance: null,
      // categories: [],
      // loading: false,
      form: {},
      nameBefore: '',
      viewMode: false
    }
  },

  watch: {
    loadingDatabase (val) {
      if (this.$route.params.id && !val) {
        this.globalLoading = false
        this.checkExists(this.$route.params.id)
      }
    }
  },

  created () {
    this.form = { ...this.modelForm }
    if (this.$route.params.id && !this.loadingDatabase) {
      this.checkExists(this.$route.params.id)
    }
    if (this.loadingDatabase) {
      this.globalLoading = true
    }
  },

  mounted () {
    // this.loading = true
    this.firebaseMixinInstance = this.firebaseMixin('categories')

    // this.firebaseMixinInstance.bindField('categories').finally(() => {
    //   this.loading = false
    //   if (this.$route.params.id) {
    //     this.checkExists(this.$route.params.id)
    //   }
    // })
  },

  methods: {
    reset () {
      this.viewMode = false
      this.form = { ...this.modelForm }
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
    },
    save () {
      const ref = this.firebaseMixinInstance
      const action = this.form.id
        ? ref.id(this.form.id).update : ref.add
      action(this.form).catch((err) => {
        console.log('err', err)
      })
      Notify.create({
        message: this.$t('savedOperation'),
        color: 'positive',
        closeBtn: true
      })
      this.reset()
      this.$emit('done')
    },
    checkExists (id) {
      const row = this.categories.find(p => p.id === id)

      if (!row) {
        Notify.create({
          message: this.$t('notExist'),
          color: 'negative',
          closeBtn: true
        })
        this.$router.push('/categories')
        return
      }
      const isView = this.$route.name === 'categories.view'
      this[isView ? 'view' : 'edit'](row)
    },
    edit (row) {
      this.viewMode = false
      this.nameBefore = row.name
      this.form = { ...row, id: row.id }
    },

    view (row) {
      this.viewMode = true
      this.nameBefore = row.name
      this.form = { ...row, id: row.id }
    }
  }
})
</script>
