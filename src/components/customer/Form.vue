<template>
  <q-form
    ref="form"
    class="full-width"
    @submit="save"
  >
    <v-input
      v-model="form.name"
      :label="$t('name')"
      :disable="viewMode"
      :rules="[
        val => val && val.length || $t('fillTheField', { field: $t('name') }),
        val => !!form.id && nameBefore === val || (!customers.map(c => c.name.toLowerCase()).includes(val.toLowerCase()) || $t('alredyExist'))
      ]"
    />

    <v-input
      v-model="form.cellphone"
      :label="$t('cellphone')"
      :disable="viewMode"
      mask="#"
      reverse-fill-mask
    />

    <v-input
      v-model="form.phone"
      :label="$t('phone')"
      :disable="viewMode"
      mask="#"
      reverse-fill-mask
    />

    <v-input
      v-model="form.observation"
      type="textarea"
      :label="$t('observation')"
      :disable="viewMode"
    />

    <q-input
      v-model="form.document"
      :label="$t('document')"
      :disable="viewMode"
    />

    <v-input-cep
      v-model="form.cep"
      label="CEP"
      :disable="viewMode"
      @response="setAdress"
    />

    <v-input
      v-model="form.publicPlace"
      :label="$t('publicPlace')"
      :disable="viewMode"
    />

    <v-input
      v-model="form.number"
      :label="$t('number')"
      :disable="viewMode"
      type="number"
    />

    <v-input
      v-model="form.district"
      :label="$t('district')"
      :disable="viewMode"
    />

    <v-input
      v-model="form.city"
      :label="$t('city')"
      :disable="viewMode"
    />

    <v-input
      v-model="form.state"
      :label="$t('state')"
      :disable="viewMode"
    />

    <v-input
      v-model="form.complement"
      :label="$t('complement')"
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
        :disable="viewMode"
      />
    </div>
  </q-form>
</template>

<script>

import { Notify } from 'quasar'
import { defineComponent } from 'vue'
import VInputCep from 'src/components/common/VInputCep.vue'

import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'CustomersForm',

  components: {
    VInputCep
  },

  emits: ['done'],

  setup () {
    const storeFirebase = useFirebaseStore()
    const { customers, loadingDatabase } = storeToRefs(storeFirebase)
    return {
      customers,
      loadingDatabase,
      modelForm: {
        name: '',
        cellphone: '',
        phone: '',
        observation: '',
        document: '',
        publicPlace: '',
        number: '',
        district: '',
        city: '',
        state: '',
        complement: ''
      }
    }
  },

  data () {
    return {
      // customers: [],
      firebaseMixinInstance: null,
      form: {},
      loading: false,
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
    this.firebaseMixinInstance = this.firebaseMixin('customers')

    // this.firebaseMixinInstance.bindField('customers').finally(() => {
    //   this.loading = false
    //   if (this.$route.params.id) {
    //     this.checkExists(this.$route.params.id)
    //   }
    // })
  },

  methods: {
    setAdress ({ logradouro, bairro, localidade, uf }) {
      this.form.publicPlace = logradouro
      this.form.district = bairro
      this.form.city = localidade
      this.form.state = uf
    },
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
      const row = this.customers.find(p => p.id === id)

      if (!row) {
        Notify.create({
          message: this.$t('notExist'),
          color: 'negative',
          closeBtn: true
        })
        this.$router.push('/customers')
        return
      }
      const isView = this.$route.name === 'customers.view'
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
