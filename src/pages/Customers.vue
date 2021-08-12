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
        <q-input
          v-model="form.name"
          :label="$t('name')"
          :rules="[val => val && val.length || $t('fillTheField', { field: $t('name') })]"
        />

        <q-input
          v-model="form.cellphone"
          :label="$t('cellphone')"
          mask="#"
          reverse-fill-mask
        />

        <q-input
          v-model="form.phone"
          :label="$t('phone')"
          mask="#"
          reverse-fill-mask
        />

        <q-input
          v-model="form.observation"
          type="textarea"
          :label="$t('observation')"
        />

        <q-input
          v-model="form.document"
          :label="$t('document')"
        />

        <v-input-cep
          v-model="form.cep"
          label="CEP"
          @response="setAdress"
        />

        <q-input
          v-model="form.publicPlace"
          :label="$t('publicPlace')"
        />

        <q-input
          v-model="form.number"
          :label="$t('number')"
          type="number"
        />

        <q-input
          v-model="form.district"
          :label="$t('district')"
        />

        <q-input
          v-model="form.city"
          :label="$t('city')"
        />

        <q-input
          v-model="form.state"
          :label="$t('state')"
        />

        <q-input
          v-model="form.complement"
          :label="$t('complement')"
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
    </div>
    <div class="col-xs-12 col-sm-12 col-md-8">
      <q-table
        v-model:pagination="pagination"
        :title="$tc('customer', 2)"
        class="full-width"
        :rows="customers"
        :columns="columns"
        style="height: calc(100vh - 100px)"
        binary-state-sort
        :loading="loading"
        :filter="filter"
        :rows-per-page-label="$t('recordsPerPage')"
      >
        <template #top-right>
          <q-input
            v-model="filter"
            borderless
            dense
            debounce="300"
            :placeholder="$t('search')"
          >
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template #body-cell-acoes="{ row }">
          <q-td>
            <div class="row no-wrap q-gutter-md">
              <q-btn
                :label="$t('edit')"
                dense
                color="primary"
                @click="edit(row)"
              />
              <q-btn
                :label="$t('delete')"
                dense
                color="negative"
                :loading="row.loading"
                @click="deleteAction(row)"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>

import { date, Dialog } from 'quasar'
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
      filter: '',
      pagination: {
        page: 1,
        rowsPerPage: 5,
        sortBy: 'createdAt',
        descending: true
      },
      form: {},
      loading: false,
      saving: false,
      customers: []
    }
  },

  computed: {
    columns () {
      return [
        { name: 'name', label: this.$t('name'), field: 'name' },
        { name: 'cellphone', label: this.$t('cellphone'), field: 'cellphone' },
        { name: 'phone', label: this.$t('phone'), field: 'phone' },
        { name: 'observation', label: this.$t('observation'), field: 'observation' },
        { name: 'document', label: this.$t('document'), field: 'document' },
        { name: 'publicPlace', label: this.$t('publicPlace'), field: 'publicPlace' },
        { name: 'number', label: this.$t('number'), field: 'number' },
        { name: 'district', label: this.$t('district'), field: 'district' },
        { name: 'city', label: this.$t('city'), field: 'city' },
        { city: 'complement', label: this.$t('complement'), field: 'complement' },
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
        { name: 'acoes', label: this.$t('action'), align: 'left' }
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
      this.reset()
    },
    edit (row) {
      this.form = { ...row, id: row.id }
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
        })
      })
    }
  }
})
</script>
