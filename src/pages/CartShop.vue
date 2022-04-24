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
        <q-btn
          class="q-ma-md"
          color="accent"
          :label="$t('add')"
          @click="addProductModalOpen = true"
        />
        <q-table
          v-model:pagination="pagination"
          class="full-width table-cart-shop"
          grid
          grid-header
          :title="$t('product', 2)"
          :rows="products"
          :columns="columnsProduct"
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
                  v-for="col in columnsProduct"
                  :key="col.name"
                  class="q-table__grid-item-row"
                >
                  <div class="q-table__grid-item-title">
                    {{ col.label }}
                  </div><div class="q-table__grid-item-value">
                    {{ col.format ? col.format(props.row[col.field]) : props.row[col.field] }}
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
                  :class="item.discountObject ? 'text-grey' : 'text-blue'"
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
            <q-item v-if="item.discountObject">
              <q-item-section>
                <q-item-label class="text-red">
                  -{{ item.discountObject.type === 'value' ? '$' : '%' }} {{ item.discountObject.discount }}
                </q-item-label>
              </q-item-section>

              <q-item-section
                side
              >
                <q-item-label
                  caption
                  class="text-blue"
                >
                  {{ calcDiscountResult(item.discountObject, item.unitaryValue).toFixed(2) }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <div class="row">
                  <v-input
                    v-model="cartShopProducts[item.product.id].quantity"
                    type="number"
                    class="col-3"
                    :label="$t('quantity')"
                    @update:model-value="val => updateCartShopItemQuantity(item.product.id, val)"
                  />
                  <q-btn
                    icon="local_offer"
                    color="green"
                    class="col-2"
                    flat
                    @click="openDiscountModal(item.product.id)"
                  />
                  <q-btn
                    icon="delete"
                    color="red"
                    class="col-2"
                    flat
                    @click="removeItem(item.product.id)"
                  />
                  <q-checkbox
                    v-model="item.decreaseStock"
                    :label="$t('decreaseStock')"
                    left-label
                  />
                </div>
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
              v-if="subtotalDiscountObject?.type"
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
                  -{{ subtotalDiscountObject.type === 'value' ? '$' : '%' }} {{ subtotalDiscountObject.discount }}
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
            <q-item>
              <q-item-section>
                <v-input
                  v-model="date"
                  :label="$t('date')"
                  :rules="['date']"
                  date
                />
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
    <q-dialog
      v-model="addProductModalOpen"
    >
      <q-card>
        <q-card-section>
          <products-add-edit-form
            @done="addProductModalOpen = false"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            :label="$t('close')"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="saveDialogOpen"
      position="bottom"
    >
      <q-card style="width: 250px">
        <q-card-section class="row">
          <div>
            {{ $t('select') }}
          </div>
          <q-btn
            flat
            class="col-12 text-end"
            icon="person"
            align="left"
            :label="$t('customer')"
          />
          <q-btn
            flat
            class="col-12"
            icon="arrow_upward"
            align="left"
            :label="$t('fastSale')"
            @click="save()"
          />
          <q-btn
            v-close-popup
            flat
            class="col-12"
            icon="close"
            align="left"
            :label="$t('cancel')"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>

import { date, Dialog, Notify } from 'quasar'
const { formatDate } = date
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageCartShop',

  data () {
    return {
      tab: 'products',
      loading: false,
      saving: false,
      filter: '',
      firebaseMixinInstance: null,
      products: [],
      pagination: {
        rowsPerPage: 0,
        sortBy: 'createdAt',
        descending: true
      },
      cartShopProducts: {},
      subtotalDiscountObject: {},
      addProductModalOpen: false,
      saveDialogOpen: false,
      date: ''
    }
  },

  computed: {
    cartShopGroupedArray () {
      return Object.keys(this.cartShopProducts).map(key => this.cartShopProducts[key])
    },
    columnsProduct () {
      return [
        { name: 'name', label: this.$t('name'), field: 'name', sortable: true },
        { name: 'saleValue', label: this.$t('saleValue'), field: 'saleValue', sortable: true },
        { name: 'productStockHistoryCount', label: this.$t('currentInventory') },
        {
          name: 'createdAt',
          label: this.$t('createdAt'),
          field: 'createdAt',
          format: val => formatDate(val ? val.toDate() : '', 'DD/MM/YYYY'),
          sortable: true
        }
      ]
    },
    cartShopGroupedArrayDiscountSum () {
      return this.cartShopGroupedArray.reduce((acc, item) => acc + this.getDiscountValue(item.discountObject, item.unitaryValue) || 0, 0)
    },
    subtotal () {
      return this.cartShopGroupedArray.reduce((acc, item) => acc + item.unitaryValue * item.quantity, 0)
    },
    totalProductsWithDiscount () {
      return this.cartShopGroupedArrayDiscountSum ? this.cartShopGroupedArray.reduce((acc, item) => acc + item.unitaryValue * item.quantity, 0) - this.cartShopGroupedArrayDiscountSum : 0
    },
    discountSubTotalValue () {
      return this.calcDiscountResult(this.subtotalDiscountObject.discount, this.totalProductsWithDiscount)
    },
    totalDiscount () {
      return (this.cartShopGroupedArrayDiscountSum + this.discountSubTotalValue)
    },
    total () {
      return this.cartShopGroupedArrayDiscountSum ? this.totalProductsWithDiscount - this.getDiscountValue(this.subtotalDiscountObject, this.totalProductsWithDiscount) : this.subtotal
    }
  },

  created () {
    this.date = formatDate(Date.now(), 'DD/MM/YY')
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
    calcDiscountResult (discountObject, value) {
      if (!discountObject?.type) {
        return 0
      }
      return discountObject.type === 'value'
        ? (value - discountObject.discount)
        : value - (value * discountObject.discount / 100)
    },
    getDiscountValue (discountObject, value) {
      if (!discountObject?.type) {
        return 0
      }
      return discountObject.type === 'value'
        ? discountObject.discount
        : (value * discountObject.discount / 100)
    },
    setDiscount (result, cancel) {
      if (cancel && this.cartShopProducts[result.options.id]) {
        delete this.cartShopProducts[result.options.id].discountObject
        return
      }
      if (result.options.id === 'subtotalDiscountObject') {
        if (cancel) {
          this.subtotalDiscountObject = {}
          return
        }
        this.subtotalDiscountObject = result.discountObject
        return
      }
      this.cartShopProducts[result.options.id].discountObject = result.discountObject
    },
    updateCartShopItemQuantity (id, quantity) {
      if (quantity < 1) {
        this.removeItem(id)
      }
    },
    removeItem (id) {
      Dialog.create({
        title: `${this.$t('removeItem')}?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        delete this.cartShopProducts[id]
      }).onCancel(() => {
        this.cartShopProducts[id].quantity = 1
      })
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
        if (this.$route.params.customerId) {
          this.save(this.$route.params?.customerId)
          return
        }
        this.saveDialogOpen = true
      }
    },
    openDiscountModal (itemId) {
      const options = {
        title: this.$t('discountInSubtotal'),
        value: this.total,
        id: 'subtotalDiscountObject'
      }
      let discountObject = this.subtotalDiscountObject
      if (itemId) {
        const cartShopProduct = this.cartShopProducts[itemId]
        options.title = cartShopProduct.product.name
        options.value = cartShopProduct.unitaryValue
        options.id = itemId
        discountObject = cartShopProduct.discountObject
      }
      this.$refs.discountModal.openModal(options, discountObject)
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
          quantity: 1,
          decreaseStock: true
        }
      }
    },
    save (customerId) {
      this.saveDialogOpen = false
      if (this.$route.params.customerId) {
        return
      }
      const sale = {
        type: 'fastSale',
        ...(this.subtotalDiscountObject?.type) && { subtotalDiscountObject: this.subtotalDiscountObject },
        date: this.date,
        total: this.total,
        products: this.cartShopGroupedArray.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unitaryValue: item.unitaryValue,
          ...(item.discountObject?.type) && { discountObject: item.discountObject }
        }))
      }
      this.firebaseMixin('cashFlow').add(sale)
      this.cartShopGroupedArray.forEach(item => {
        if (item.decreaseStock) {
          const productRef = this.firebaseMixin('products').id(item.product.id).doc()
          this.firebaseMixin('stockHistory').add({
            product: productRef,
            quantity: -Math.abs(item.quantity),
            description: `${this.$t('boughtBy')} fastSale`
          })
        }
      })

      Notify.create({
        message: this.$t('savedOperation'),
        color: 'positive',
        closeBtn: true
      })
      this.reset()
      console.log(sale)
    },
    reset () {
      this.date = formatDate(Date.now(), 'DD/MM/YY')
      this.cartShopProducts = {}
      this.subtotalDiscountObject = {}
      this.tab = 'products'
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
