<script setup>

import { useI18n } from 'vue-i18n'
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import { firebaseAuth } from 'boot/firebase'
import { version } from '../../package.json'
const { locale } = useI18n({ useScope: 'global' })
locale.value = 'pt-BR'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const pageTitle = computed(() => {
  return route.meta?.title || ''
})

const leftDrawerOpen = ref(false)
const deploy = process.env.DEPLOY
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const logout = () => {
  firebaseAuth.signOut()
  router.push('/login')
    .catch(error => console.log('error', error))
}

const localeOptions = [
  { value: 'en-US', label: 'English' },
  { value: 'pt-BR', label: 'Portuguese' }
]

watch(locale, (val) => {
  $q.lang.set(val)
})

</script>

<template lang="pug">

q-layout(:view="`lHh Lpr lFf`")
  q-header(elevated)
    q-toolbar
      q-btn(flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer")
      q-toolbar-title {{ pageTitle }}
      div
        q-btn-dropdown(class="ellipsis" split flat no-caps="no-caps" label="User")
          q-list
            q-item(v-close-popup clickable @click="logout")
              q-item-section
                q-item-label Logout

  q-drawer(v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1")
    q-list
      q-item
        q-select(v-model="locale" :options="localeOptions" :label="$t('language')" dense borderless emit-value map-options options-dense style="min-width: 150px")
      q-item(to="/") HOME

      q-separator
      q-item(to="/cart-shop") {{ $t('shoppingCart') }}
      q-item(to="/cash-flow") {{ $t('cashFlow') }}

      q-separator
      q-item(to="/customers") {{ $t('customer', 2) }}

      q-separator
      q-item(to="/products") {{ $t('product', 2) }}
      //- q-item(to="/categories") {{ $t('category', 2) }}

      q-separator
      q-item(to="/suppliers") {{ $t('supplier', 2) }}
      q-item(to="/expenses") {{ $t('expense', 2) }}
      //- q-item(to="/expense-products") {{ $t('expenseProduct', 2) }}

    div(class="absolute-bottom")
      q-separator
      q-item {{ version }} : {{ deploy }}

  q-page-container
    router-view
</template>
