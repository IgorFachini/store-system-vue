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
          :rules="[
            val => val && val.length || $t('fillTheField', { field: $t('name') }),
            val => !!form.id && nameBefore === val || (!expenseProducts.map(c => c.name).includes(val) || $t('alredyExist'))]"
        />

        <q-input
          v-model="form.description"
          type="textarea"
          :label="$t('description')"
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
      <v-table-crud
        :title="$tc('expenseProduct', 2)"
        :rows="expenseProducts"
        :columns="columns"
        :loading="loading"
        @edit="edit"
        @delete="deleteAction"
      />
    </div>
  </q-page>
</template>

<script>

import { date, Dialog } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date
import VTableCrud from 'components/common/VTableCrud.vue'

export default defineComponent({
  name: 'Categories',

  components: {
    VTableCrud
  },

  setup () {
    return {
      modelForm: {
        name: '',
        description: ''
      }
    }
  },

  data () {
    return {
      form: {},
      loading: false,
      saving: false,
      expenseProducts: [],
      firebaseMixinInstance: null,
      nameBefore: ''
    }
  },

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

  created () {
    this.form = { ...this.modelForm }
  },

  mounted () {
    this.loading = true
    this.firebaseMixinInstance = this.firebaseMixin('expenseProducts')
    this.firebaseMixinInstance.bindField('expenseProducts').finally(() => {
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
      this.nameBefore = row.name
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
    },

    deleteAction (row) {
      Dialog.create({
        title: `${this.$q.lang.label.remove} ${this.$t('expenseProduct')}`,
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
