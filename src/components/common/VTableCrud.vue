<template>
  <q-table
    ref="table"
    v-model:pagination="paginationInside"
    :title="title"
    class="full-width"
    :rows="rows"
    :columns="columns"
    style="height: calc(100vh - 100px)"
    binary-state-sort
    :loading="loading"
    :filter="search"
    row-key="id"
  >
    <template #top-right>
      <q-input
        v-model="search"
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
    <template #body="props">
      <transition
        appear
        enter-active-class="animated slideInRight"
        leave-active-class="animated slideInLeft"
      >
        <keep-alive>
          <q-tr
            appear
            :props="props"
          >
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.value }}
              <q-btn
                v-if="col.name === 'expand'"
                size="sm"
                color="accent"
                round
                dense
                :icon="props.expand ? 'remove' : 'add'"
                @click="props.expand = !props.expand"
              />
              <div
                v-if="col.name === 'action'"
                class="row no-wrap q-gutter-md"
              >
                <q-btn
                  :label="$t('edit')"
                  dense
                  color="primary"
                  @click="$emit('edit', props.row)"
                />
                <q-btn
                  :label="$t('delete')"
                  dense
                  color="negative"
                  :loading="props.row.loading"
                  @click="$emit('delete', props.row)"
                />
              </div>
            </q-td>
          </q-tr>
        </keep-alive>
      </transition>
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <q-tr
          v-if="props.expand"
          :props="props"
        >
          <q-td colspan="100%">
            <q-list
              bordered
              separator
            >
              <product-sale-info
                v-for="product in props.row.products"
                :key="product.id"
                :product="product"
                hide-remove
              />
            </q-list>
          </q-td>
        </q-tr>
      </transition>
    </template>
  </q-table>
</template>
<script>
import { QTable } from 'quasar'
import ProductSaleInfo from 'components/product/ProductSaleInfo.vue'

export default {
  name: 'VTableCrud',

  components: {
    ProductSaleInfo
  },

  mixins: [QTable],

  props: {
  },

  emits: ['edit', 'delete'],

  data () {
    return {
      mounted: false,
      search: '',
      paginationInside: {
        page: 1,
        rowsPerPage: 10,
        sortBy: 'createdAt',
        descending: true
      }
    }
  },

  computed: {
    table () {
      if (this.mounted) {
        return this.$refs.table
      }
      return {}
    }
  },

  mounted () {
    this.mounted = true
  }
}
</script>
