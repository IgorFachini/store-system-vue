<template>
  <q-page
    class="fit"
    padding
  >
    <div class="row justify-around">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab
          name="products"
          :label="$t('product', 2)"
        />
        <q-tab
          name="shoppingCart"
          :label="$t('shoppingCart')"
        />
      </q-tabs>
      <q-btn
        icon="local_offer"
        color="green"
        @click="openDiscountModal()"
      />
    </div>
    <q-tab-panels
      v-model="tab"
      animated
      keep-alive
    >
      <q-tab-panel name="products">
        <q-table
          v-model:pagination="pagination"
          class="full-width table-cart-shop"
          grid
          grid-header
          :title="$t('product', 2)"
          :rows="products"
          :columns="columns"
          row-key="name"
          :filter="filter"
          hide-header
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
          <template #item="props">
            <q-item
              clickable
              class="q-table__grid-item col-xs-6 col-sm-6 col-md-4 col-lg-3"
              @click="addToCartShop(props.row)"
            >
              <div class="q-table__grid-item-card q-table__card fit">
                <div
                  v-for="col in columns"
                  :key="col.name"
                  class="q-table__grid-item-row"
                >
                  <div class="q-table__grid-item-title">
                    {{ col.label }}
                  </div><div class="q-table__grid-item-value">
                    {{ props.row[col.field] }}
                    <product-stock-history-count
                      v-if="col.name === 'productStockHistoryCount'"
                      :product="props.row"
                    />
                  </div>
                </div>
              </div>
            </q-item>
          </template>
        </q-table>
      </q-tab-panel>

      <q-tab-panel
        name="shoppingCart"
        class="fit q-gutter-y-md"
      >
        <div class="row q-gutter-y-md">
          <q-card
            v-for="item of cartShopGroupedArray"
            :key="item.product.id"
            class="q-table__card col-xs-12 col-sm-12 col-md-6 col-lg-6"
          >
            <q-item class="full-width justify-between">
              <q-item-section>
                <q-item-label> {{ item.product.name }}</q-item-label>
              </q-item-section>

              <q-item-section
                side
              >
                <q-item-label
                  caption
                  :class="item.discount ? 'text-grey' : 'text-blue'"
                >
                  {{ item.product.saleValue }}
                  <v-input
                    v-model="cartShopProducts[item.product.id].unitaryValue"
                    class="full-width"
                    :label="$t('saleValue')"
                    currency
                  />
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="item.discount">
              <q-item-section>
                <q-item-label class="text-red">
                  {{ item.discount }}
                </q-item-label>
              </q-item-section>

              <q-item-section
                side
              >
                <q-item-label
                  caption
                  class="text-blue"
                >
                  {{ (item.unitaryValue - item.discount).toFixed(2) }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <v-input
                  v-model="cartShopProducts[item.product.id].quantity"
                  type="number"
                  :label="$t('quantity')"
                  @update:model-value="val => updateCartShopItemQuantity(item.product.id, val)"
                />
                <q-btn
                  icon="local_offer"
                  color="green"
                  @click="openDiscountModal(item.product.id)"
                />
              </q-item-section>

              <q-item-section
                side
              >
                <q-item-label
                  caption
                  class="text-blue"
                >
                  {{ item.product.saleValue }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card>
        </div>
        <div class="row justify-around">
          <q-card
            class="q-table__card col-xs-12 col-sm-12 col-md-6 col-lg-6"
          >
            <q-item class="full-width justify-between">
              <q-item-section>
                <q-item-label>Subtotal:</q-item-label>
              </q-item-section>

              <q-item-section
                side
              >
                <q-item-label
                  caption
                  :class="totalProductsWithDiscount ? 'text-grey' : 'text-blue'"
                >
                  {{ subtotal }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              v-if="cartShopGroupedArrayDiscountSum"
              class="full-width justify-between"
            >
              <q-item-section>
                <q-item-label>{{ $t('discountInProducts') }}:</q-item-label>
              </q-item-section>

              <q-item-section
                side
              >
                <q-item-label
                  caption
                  class="text-red"
                >
                  {{ cartShopGroupedArrayDiscountSum.toFixed(2) }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              v-if="totalProductsWithDiscount"
              class="full-width justify-between"
            >
              <q-item-section>
                <q-item-label>{{ $t('new') }} Subtotal:</q-item-label>
              </q-item-section>

              <q-item-section
                side
              >
                <q-item-label
                  caption
                  class="text-blue"
                >
                  {{ totalProductsWithDiscount.toFixed(2) }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              v-if="subtotalDiscount"
              class="full-width justify-between"
            >
              <q-item-section>
                <q-item-label>{{ $t('discountIn') }} Subtotal:</q-item-label>
              </q-item-section>

              <q-item-section
                side
              >
                <q-item-label
                  caption
                  class="text-red"
                >
                  {{ subtotalDiscount }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              v-if="totalDiscount"
              class="full-width justify-between"
            >
              <q-item-section>
                <q-item-label>{{ $t('totalDiscount') }}:</q-item-label>
              </q-item-section>

              <q-item-section
                side
              >
                <q-item-label
                  caption
                  class="text-red"
                >
                  {{ totalDiscount }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              class="full-width justify-between"
            >
              <q-item-section>
                <q-item-label>Total:</q-item-label>
              </q-item-section>

              <q-item-section
                side
              >
                <q-item-label
                  caption
                  class="text-green"
                >
                  {{ total.toFixed(2) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>
    <q-footer
      elevated
      class="row justify-around bg-grey-2 q-pa-sm"
    >
      <q-btn
        :icon="tab === 'products' ? 'close' : 'arrow_back'"
        :color="tab === 'products' ? 'red' : 'blue'"
        round
        @click="back"
      />
      <div class="text-green text-h4">
        {{ total.toFixed(2) }}
      </div>
      <q-btn
        :icon="tab === 'products' ? 'arrow_forward' : 'done'"
        :color="tab === 'products' ? 'blue' : 'green'"
        round
        @click="foward"
      />
    </q-footer>
    <discount-modal
      ref="discountModal"
      @cancel="val => setDiscount(val, true)"
      @confirm="setDiscount"
    />
  </q-page>
</template>

<script>

import { Dialog, Notify } from 'quasar'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageCartShop',

  data () {
    return {
      tab: 'products',
      form: {},
      loading: false,
      saving: false,
      filter: '',
      firebaseMixinInstance: null,
      products: [],
      pagination: {
        rowsPerPage: 0
      },
      cartShopProducts: {},
      subtotalDiscount: 0
    }
  },

  computed: {
    cartShopGroupedArray () {
      return Object.keys(this.cartShopProducts).map(key => this.cartShopProducts[key])
    },
    columns () {
      return [
        { name: 'name', label: this.$t('name'), field: 'name', sortable: true },
        { name: 'saleValue', label: this.$t('saleValue'), field: 'saleValue', sortable: true },
        { name: 'productStockHistoryCount', label: this.$t('currentInventory') }
      ]
    },
    cartShopGroupedArrayDiscountSum () {
      return this.cartShopGroupedArray.reduce((acc, item) => acc + item.discount || 0, 0)
    },
    subtotal () {
      return this.cartShopGroupedArray.reduce((acc, item) => acc + item.unitaryValue * item.quantity, 0)
    },
    totalProductsWithDiscount () {
      return this.cartShopGroupedArrayDiscountSum ? this.cartShopGroupedArray.reduce((acc, item) => acc + item.unitaryValue * item.quantity, 0) - this.cartShopGroupedArrayDiscountSum : 0
    },
    totalDiscount () {
      return (this.cartShopGroupedArrayDiscountSum + this.subtotalDiscount)
    },
    total () {
      return this.cartShopGroupedArrayDiscountSum ? (this.totalProductsWithDiscount - this.subtotalDiscount) : this.subtotal
    }
  },

  created () {
    this.form = { ...this.modelForm }
  },

  mounted () {
    this.loading = true
    this.firebaseMixinInstance = this.firebaseMixin('products')
    Promise.all([
      this.firebaseMixinInstance.bindField('products')
    ])
      .finally(() => {
        this.loading = false
      })
  },

  methods: {
    setDiscount (item, cancel) {
      if (cancel && this.cartShopProducts[item.id]) {
        delete this.cartShopProducts[item.id].discount
      }
      if (item.id === 'subtotalDiscount') {
        if (cancel) {
          this.subtotalDiscount = 0
          return
        }
        this.subtotalDiscount = item.discount
        return
      }
      this.cartShopProducts[item.id].discount = item.discount
    },
    updateCartShopItemQuantity (id, quantity) {
      delete this.cartShopProducts[id].discount
      if (quantity < 1) {
        Dialog.create({
          title: `${this.$t('removeItem')}?`,
          cancel: true,
          persistent: true
        }).onOk(() => {
          delete this.cartShopProducts[id]
        }).onCancel(() => {
          this.cartShopProducts[id].quantity = 1
        })
      }
    },
    back () {
      if (this.tab === 'products') {
        Dialog.create({
          title: `${this.$t('shopCancel')}?`,
          cancel: true,
          persistent: true
        }).onOk(() => {
        })
      } else {
        this.tab = 'products'
      }
    },
    foward () {
      if (this.tab === 'products') {
        this.tab = 'shoppingCart'
      } else {
        this.save()
      }
    },
    openDiscountModal (itemId) {
      const options = {
        title: this.$t('discountInSubtotal'),
        value: this.total,
        discount: this.subtotalDiscount,
        id: 'subtotalDiscount'
      }
      if (itemId) {
        options.title = this.cartShopProducts[itemId].product.name
        options.value = this.cartShopProducts[itemId].unitaryValue
        options.discount = this.cartShopProducts[itemId].discount || 0
        options.id = itemId
      }
      this.$refs.discountModal.openModal(options)
    },
    addToCartShop (product) {
      if (this.cartShopProducts[product.id]) {
        this.cartShopProducts[product.id].quantity++
      } else {
        this.cartShopProducts[product.id] = {
          product: {
            id: product.id,
            ...product
          },
          unitaryValue: product.saleValue,
          quantity: 1
        }
      }
    },
    save () {

    },
    deleteAction (row) {
      Dialog.create({
        title: `${this.$q.lang.label.remove} ${this.$t('product')}`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        row.loading = true
        this.firebaseMixin('stockHistory').ref().where('product', '==', this.firebaseMixinInstance.id(row.id).doc()).get().then(snapshot => {
          snapshot.docs.forEach(doc => {
            doc.ref.delete()
          })
        })
        this.firebaseMixinInstance.id(row.id).delete().finally(() => {
          row.loading = false
          Notify.create({
            message: this.$t('savedOperation'),
            color: 'positive',
            closeBtn: true
          })
        })
      })
    }
  }
})
</script>

<style lang="scss">
  .table-cart-shop .q-table__grid-content {
    flex: unset !important
  }
</style>
