<template>
  <q-page
    class="q-gutter-y-md"
    padding
  >
    <div
      v-if="isViewMode"
      class="full-width"
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
      return this.$route.meta
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
