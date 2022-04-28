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
              <template
                v-if="col.name === 'productStockHistoryCount'"
              >
                <product-stock-history-count
                  :product="props.row"
                />
              </template>
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
                v-if="col.name === 'actionView'"
                class="row no-wrap q-gutter-md"
              >
                <q-btn
                  :label="$t('view')"
                  dense
                  color="primary"
                  @click="$emit('view', props.row)"
                />
              </div>
              <div
                v-if="col.name === 'actionChoose'"
                class="row no-wrap q-gutter-md"
              >
                <q-btn
                  :label="$t('choose')"
                  dense
                  color="primary"
                  @click="$emit('choose', props.row)"
                />
              </div>
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
                <slot
                  name="action-more"
                  v-bind="props"
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
            <slot
              name="expand"
              v-bind="props"
            />
          </q-td>
        </q-tr>
      </transition>
    </template>
    <template
      v-for="propSlot in Object.keys($slots)"
      #[propSlot]="props"
    >
      <slot
        :name="propSlot"
        v-bind="props"
      />
    </template>
  </q-table>
</template>
<script>
import { QTable } from 'quasar'

export default {
  name: 'VTableCrud',

  mixins: [QTable],

  emits: ['view', 'edit', 'delete', 'choose'],

  data () {
    return {
      mounted: false,
      search: '',
      paginationInside: {
        page: 1,
        rowsPerPage: 25,
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
