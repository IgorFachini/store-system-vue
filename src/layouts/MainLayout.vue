<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          {{ deploy }}
        </q-toolbar-title>

        <div>
          <q-btn-dropdown
            class="ellipsis"
            split
            flat
            no-caps="no-caps"
            label="User"
          >
            <q-list>
              <q-item
                v-close-popup
                clickable
                @click="logout"
              >
                <q-item-section>
                  <q-item-label>Logout</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-1"
    >
      <q-list>
        <q-item>
          <q-select
            v-model="locale"
            :options="localeOptions"
            :label="$t('language')"
            dense
            borderless
            emit-value
            map-options
            options-dense
            style="min-width: 150px"
          />
        </q-item>

        <q-item to="/">
          <q-item-label>
            HOME
          </q-item-label>
        </q-item>

        <q-item to="/customers">
          <q-item-label>
            {{ $t('customer', 2) }}
          </q-item-label>
        </q-item>

        <q-item to="/categories">
          <q-item-label>
            {{ $t('category', 2) }}
          </q-item-label>
        </q-item>

        <q-item to="/products">
          <q-item-label>
            {{ $t('product', 2) }}
          </q-item-label>
        </q-item>

        <!-- <q-item to="/sales">
          <q-item-label>
            {{ $t('sale', 2) }}
          </q-item-label>
        </q-item> -->

        <q-item to="/expense-products">
          <q-item-label>
            {{ $t('expenseProduct', 2) }}
          </q-item-label>
        </q-item>

        <q-item to="/expenses">
          <q-item-label>
            {{ $t('expense', 2) }}
          </q-item-label>
        </q-item>

        <q-item to="/cart-shop">
          <q-item-label>
            {{ $t('shoppingCart') }}
          </q-item-label>
        </q-item>

        <q-item to="/cash-flow">
          <q-item-label>
            {{ $t('cashFlow') }}
          </q-item-label>
        </q-item>

        <q-btn-dropdown
          class="ellipsis"
          split
          flat
          no-caps="no-caps"
          label="About"
        >
          <q-item-label
            header
            class="text-grey-8"
          >
            About
          </q-item-label>

          <EssentialLink
            v-for="link in essentialLinks"
            :key="link.title"
            v-bind="link"
          />
          <div>Quasar framework v{{ $q.version }}</div>
        </q-btn-dropdown>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'
import { useI18n } from 'vue-i18n'

const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
]

import { defineComponent, ref } from 'vue'
export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup () {
    const leftDrawerOpen = ref(false)
    const { locale } = useI18n({ useScope: 'global' })
    return {
      locale,
      localeOptions: [
        { value: 'en-US', label: 'English' },
        { value: 'pt-BR', label: 'Portuguese' }
      ],
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  },

  data () {
    return {
      $q: null,
      deploy: ''
    }
  },

  watch: {
    locale (val) {
      this.$q.lang.set(val)
    }
  },

  mounted () {
    this.deploy = process.env.DEPLOY
  },

  methods: {
    logout () {
      this.$firebaseAuth.signOut()
      this.$router.push('/login')
        .catch(error => console.log('error', error))
    }
  }
})
</script>
