<template>
  <q-page
    class="row q-col-gutter-md"
    padding
  >
    <div class="col-xs-12 col-sm-12 col-md-4">
      <q-form
        ref="form"
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
    </div>
    <div class="col-xs-12 col-sm-12 col-md-8">
      <v-table-crud
        :title="$tc('customer', 2)"
        :rows="customers"
        :columns="columns"
        :loading="loading"
        @view="view"
        @edit="edit"
        @delete="deleteAction"
      />
    </div>
  </q-page>
</template>

<script>

import { date, Dialog, Notify } from 'quasar'
import VInputCep from 'src/components/common/VInputCep.vue'
import { defineComponent } from 'vue'
const { formatDate } = date

export default defineComponent({
  name: 'Customers',
  components: { VInputCep },

  setup () {
    return {
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
      firebaseMixinInstance: null,
      form: {},
      loading: false,
      saving: false,
      customers: [],
      nameBefore: '',
      viewMode: false
    }
  },

  computed: {
    columns () {
      return [
        { name: 'actionView', label: this.$t('view'), align: 'left' },
        { name: 'name', label: this.$t('name'), field: 'name' },
        { name: 'cellphone', label: this.$t('cellphone'), field: 'cellphone' },
        { name: 'phone', label: this.$t('phone'), field: 'phone' },
        { name: 'observation', label: this.$t('observation'), field: 'observation' },
        { name: 'document', label: this.$t('document'), field: 'document' },
        { name: 'cep', label: 'CEP', field: 'cep' },
        { name: 'publicPlace', label: this.$t('publicPlace'), field: 'publicPlace' },
        { name: 'number', label: this.$t('number'), field: 'number' },
        { name: 'district', label: this.$t('district'), field: 'district' },
        { name: 'city', label: this.$t('city'), field: 'city' },
        { name: 'complement', label: this.$t('complement'), field: 'complement' },
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

  created () {
    this.form = { ...this.modelForm }
  },

  mounted () {
    this.loading = true
    this.firebaseMixinInstance = this.firebaseMixin('customers')

    this.firebaseMixinInstance.bindField('customers').finally(() => {
      this.loading = false
    })
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
    },
    edit (row) {
      this.viewMode = false
      this.nameBefore = row.name
      this.form = { ...row, id: row.id }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    view (row) {
      this.viewMode = true
      this.nameBefore = row.name
      this.form = { ...row, id: row.id }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    deleteAction (row) {
      Dialog.create({
        title: `${this.$q.lang.label.remove} ${this.$t('customer')}`,
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
