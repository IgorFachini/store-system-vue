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

        <div class="row q-gutter-md q-mt-md">
          <q-btn
            :label="$t('save')"
            type="submit"
            color="positive"
          />
          <q-btn
            label="Reset"
            @click="reset"
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
      >
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

import { date } from 'quasar'
import { defineComponent } from 'vue'
const { formatDate } = date

export default defineComponent({
  name: 'customers',

  setup () {
    return {
      modelForm: {
        name: ''
      }
    }
  },

  data () {
    return {
      pagination: {
        page: 1,
        rowsPerPage: 5,
        sortBy: 'updatedAt',
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
        { name: 'name', label: this.$t('name'), field: 'name', sortable: true },
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
    this.$bind('customers', this.firebaseMixin('customers').ref()).finally(() => {
      this.loading = false
    })
  },

  methods: {
    reset () {
      this.form = { ...this.modelForm }
      this.$nextTick(() => {
        this.$refs.form.resetValidation()
      })
    },
    save () {
      const ref = this.firebaseMixin('customers')
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
      row.loading = true
      this.firebaseMixin('customers').id(row.id).delete().finally(() => {
        row.loading = false
      })
    }
  }
})
</script>
