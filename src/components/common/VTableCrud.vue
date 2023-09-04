<template lang="pug">
q-table(
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
)
  template(#top-right)
    div(class="row full-width justify-center")
      q-btn.q-ma-md(
        color="accent"
        :label="$t('add')"
        @click="$router.push(`/${parentName}/add`)"
      )
      q-input.full-width(
        v-model="search"
        dense
        debounce="300"
        :placeholder="$t('search')"
      )
        template(#append)
          q-icon(name="search")

  template(#body="props")
    transition(
      appear
      enter-active-class="animated slideInRight"
      leave-active-class="animated slideInLeft"
    )
      keep-alive
        q-tr(
          appear
          :props="props"
        )
          q-td(
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            :class="col.classes"
          )
            | {{ col.value }}
            q-btn(
              v-if="col.name === 'expand'"
              size="sm"
              color="accent"
              round
              dense
              :disable="col.disable ? col.disable(props.row) : false"
              :icon="props.expand ? 'remove' : 'add'"
              @click="props.expand = !props.expand"
            )
            div(
              v-if="col.name === 'actionView'"
              class="row no-wrap q-gutter-md"
            )
              q-btn(
                :label="$t('view')"
                dense
                color="primary"
                @click="$emit('view', props.row)"
              )
            div(
              v-if="col.name === 'actionChoose'"
              class="row no-wrap q-gutter-md"
            )
              q-btn(
                :label="$t('choose')"
                dense
                color="primary"
                @click="$emit('choose', props.row)"
              )
            q-btn-dropdown(
              v-if="col.name === 'action'"
              dense
              dropdown-icon="menu"
              color="primary"
            )
              q-item.column.no-wrap.q-gutter-md
                q-btn(
                  :label="$t('view')"
                  dense
                  color="primary"
                  @click="$emit('view', props.row)"
                )
                q-btn(
                  :label="$t('edit')"
                  dense
                  color="primary"
                  @click="$emit('edit', props.row)"
                )
                q-btn(
                  :label="$t('delete')"
                  dense
                  color="negative"
                  :loading="props.row.loading"
                  @click="$emit('delete', props.row)"
                )
                slot(
                  name="action-more"
                  v-bind="props"
                )
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
    },
    parentName () {
      return this.$route.name.split('.')[0]
    }
  },

  mounted () {
    this.mounted = true
  }
}
</script>
