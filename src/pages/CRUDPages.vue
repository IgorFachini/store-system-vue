<template>
  <q-page
    class="row q-gutter-y-md"
    padding
  >
    <div
      v-if="isViewMode"
      class="row full-width"
    >
      <q-btn
        :label="$t('edit')"
        dense
        color="primary"
        class="full-width"
        @click="$router.push(`/${parentName}/edit/${id}`)"
      />
    </div>
    <component
      :is="componentName"
      :key="componentName"
      :block="componentName"
      @done="$router.push(`/${parentName}`)"
    />
    <div
      v-if="isTable"
      class="row full-width justify-center"
    >
      <q-btn
        class="q-ma-md"
        color="accent"
        :label="$t('add')"
        @click="$router.push(`/${parentName}/add`)"
      />
    </div>
  </q-page>
</template>

<script>

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageTableList',

  computed: {
    isViewMode () {
      return this.$route.name.includes('view')
    },
    id () {
      return this.$route.params.id
    },
    routerName () {
      return this.$route.name
    },
    parentName () {
      return this.$route.name.split('.')[0]
    },
    isTable () {
      return this.componentName?.includes('table')
    },
    componentName () {
      return this.$route.name.includes('.')
        ? `${this.parentName}-form`
        : `${this.parentName}-table`
    }
  }
})
</script>
