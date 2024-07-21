<template>
  <q-page
    class="fit"
    padding
  >
    <div class="row justify-around">
      <q-tabs
        v-model="tab"
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
        :label="`${$t('discount')} ${$t('shoppingCart')}`"
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
          :label="`${$t('add')} ${$t('product')}`"
          @click="addProductModalOpen = true"
        />
        <q-table
          v-model:pagination="pagination"
          :loading="loadingDatabase"
          class="full-width table-cart-shop"
          :grid="tableType === 'card'"
          grid-header
          :title="$t('product', 2)"
          :rows="products"
          :columns="columnsProduct"
          row-key="name"
          :filter="filter"
          table-header-class="bg-grey-3"
        >
          <template #top-right>
            <div class="q-gutter-x-md">
              <q-radio v-model="tableType" val="table" :label="$t('tableMode')" />
              <q-radio v-model="tableType" val="card" :label="$t('cardMode')" />
              <q-input
                v-model="filter"
                outlined
                debounce="300"
                :placeholder="$t('search')"
                :hint="$t('searchAloneAsYouType')"
                clearable
              >
                <template #append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </template>
          <template #body="props">
            <q-tr
              :class="[{ 'bg-green-2': cartShopProducts[props.row.id] }, 'cursor-pointer']"
              :props="props"
            >
              <q-td
                v-for="col in columnsProduct"
                :key="col.name"
                :props="props"
                @click="col.name !== 'cartQuantity' ? addToCartShop(props.row) : ''"
              >
                <div class="row justify-between items-center">
                  <q-btn
                    v-if="col.name === 'cartQuantity' && cartShopProducts[props.row.id]"
                    icon="remove"
                    color="red"
                    dense
                    @click="cartShopProducts[props.row.id].quantity--, checkCartShopItemQuantityRemove(props.row.id, cartShopProducts[props.row.id].quantity)"
                  />
                  {{ getCollRowValue(col, props.row) }}
                  <q-btn
                    v-if="col.name === 'cartQuantity'"
                    icon="add"
                    color="green"
                    dense
                    @click="addToCartShop(props.row)"
                  />
                </div>
              </q-td>
            </q-tr>
          </template>
          <template #item="props">
            <q-item
              clickable
              :class="[{ 'bg-green-2': cartShopProducts[props.row.id] }, 'q-table__grid-item col-xs-12 col-sm-6 col-md-4 col-lg-3']"
              @click="addToCartShop(props.row)"
            >
              <q-card class="fit">
                <div class="row full-width justify-center q-mb-sm">
                  <q-img
                    fit="contain"
                    class="full-width"
                    v-if="props.row.image"
                    :src="props.row.image"
                    style="height: 200px; width: 200px"
                  />
                  <q-icon
                    v-else
                    name="image"
                    size="200px"
                    class="text-grey"
                  />
                </div>
                <div class="row q-pa-md">
                  <div
                    v-for="col in columnsProduct"
                    :key="col.name"
                    class="col-6"
                  >
                    <div>
                      {{ col.label }}
                    </div>
                    <div :class="`text-h6 ${col.class}`">
                      {{ getCollRowValue(col, props.row) }}
                    </div>
                  </div>
                  <div class="col-12">
                    <div>
                      {{ $t('description') }}
                    </div>
                    <div class="text-h6">
                      {{ props.row.description || '-' }}
                    </div>
                  </div>
                </div>
              </q-card>
            </q-item>
          </template>
        </q-table>
      </q-tab-panel>

      <q-tab-panel
        name="shoppingCart"
        class="q-gutter-y-md"
      >
        <!-- TODO gutter x not work -->
        <div class="row q-gutter-y-md">
          <q-card
            v-for="item of cartShopGroupedArray"
            :key="item.product.id"
            class="col-xs-12 col-sm-12 col-md-6 col-lg-6 row q-pa-md q-gutter-y-sm"
          >
            <q-field
              :label="$t('name')"
              readonly
              stack-label
              class="col-12"
            >
              <div class="text-black">
                {{ item.product.name }}
              </div>
            </q-field>
            <q-field
              :label="$t('currentInventory')"
              readonly
              stack-label
              class="col-12"
            >
              <div class="text-black">
                {{ this.countProductsStockHistoryById(item.product.id) }}
              </div>
            </q-field>
            <q-field
              :label="$t('originalSellValue')"
              readonly
              stack-label
              class="col-6"
            >
              <div :class="item.discountObject ? 'text-grey' : 'text-blue'">
                {{ item.product.saleValue }}
              </div>
            </q-field>
            <v-input
              v-model="cartShopProducts[item.product.id].unitaryValue"
              class="col-6"
              :label="$t('saleValue')"
              currency
            />
            <div
              v-if="item.discountObject"
              class="row full-width"
            >
              <q-field
                :label="$t('discount')"
                readonly
                stack-label
                class="col-12"
              >
                <div class="row full-width justify-between">
                  <div class="text-red">
                    -{{ item.discountObject.type === 'value' ? '$' : '%' }} {{ item.discountObject.discount }}/{{ $t('item') }}
                  </div>
                  <div class="text-blue">
                    {{ calcDiscountResult(item.discountObject, item.unitaryValue).toFixed(2) }}
                  </div>
                </div>
              </q-field>
            </div>
            <div class="row full-width">
              <v-input
                v-model="cartShopProducts[item.product.id].quantity"
                type="number"
                class="col-6"
                :label="$t('quantity')"
                @blur="checkCartShopItemQuantityRemove(item.product.id, cartShopProducts[item.product.id].quantity)"
              />
              <q-btn
                class="col-3"
                icon="remove"
                color="red"
                @click="cartShopProducts[item.product.id].quantity--, checkCartShopItemQuantityRemove(item.product.id, cartShopProducts[item.product.id].quantity)"
              />
              <q-btn
                class="col-3"
                icon="add"
                color="green"
                @click="cartShopProducts[item.product.id].quantity++"
              />
            </div>
            <div class="row full-width">
              <q-field
                label="Total"
                readonly
                stack-label
                class="col-6"
              >
                <div class="text-blue">
                  {{ item.discountObject
                    ? (calcDiscountResult(item.discountObject, item.unitaryValue) * item.quantity).toFixed(2)
                    : (item.unitaryValue * item.quantity).toFixed(2)
                  }}
                </div>
              </q-field>
              <q-checkbox
                v-model="item.decreaseStock"
                :label="$t('decreaseStock')"
                class="col-6"
              />
            </div>
            <q-btn
              :label="`${$t('discount')} ${$t('product')}`"
              icon="local_offer"
              color="green"
              class="col-6"
              outline
              dense
              @click="openDiscountModal(item.product.id)"
            />
            <q-btn
              :label="$t('removeItem')"
              icon="delete"
              color="red"
              class="col-6"
              outline
              dense
              @click="removeItem(item.product.id)"
            />
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
              v-if="subTotalDiscountObject?.type"
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
                  -{{ subTotalDiscountObject.type === 'value' ? '$' : '%' }} {{ subTotalDiscountObject.discount }}
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
                <q-input
                  v-model="description"
                  :label="$t('description')"
                  counter
                  maxlength="100"
                  type="textarea"
                />
                <v-date
                  v-model="date"
                  :label="$t('purchaseDate')"
                  :rules="[val => val && val.length || $t('fillTheField', { field: $t('purchaseDate') })]"
                />
                <q-checkbox
                  v-model="purchasePayed"
                  :label="$t('purchasePayed')"
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
        :label="tab === 'products' ? $t('cancel') : $t('back')"
        @click="back"
      />
      <div class="text-green text-h4">
        {{ total.toFixed(2) }}
      </div>
      <q-btn
        :icon="tab === 'products' ? 'arrow_forward' : 'done'"
        :color="tab === 'products' ? 'blue' : 'green'"
        :label="tab === 'products' ? $t('shoppingCart') : $t('save')"
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
          <products-form
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
      v-model="chooseCustomerModalOpen"
    >
      <q-card>
        <q-card-section>
          <div class="row">
            <q-dialog
              v-model="addCustomerModalOpen"
            >
              <q-card>
                <q-card-section>
                  <div class="row">
                    <customers-form
                      choose-mode
                      @done="addCustomerModalOpen = false"
                    />
                  </div>
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
            <customers-table
              choose-mode
              @choose="val => save(val.id)"
            />
          </div>
          <div class="row full-width justify-center">
            <q-btn
              class="q-ma-md"
              color="accent"
              :label="$t('add')"
              @click="addCustomerModalOpen = true"
            />
          </div>
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
            v-if="!!saleEdit?.customer?.name"
            flat
            class="col-12"
            icon="person"
            align="left"
            :label="`${$t('currentCustomer')} : ${saleEdit?.customer?.name}`"
            @click="save(saleEdit?.customer?.id)"
          />
          <q-btn
            flat
            class="col-12 text-end"
            icon="person_add"
            align="left"
            :label="$t('customer')"
            @click="chooseCustomerModalOpen = true"
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
import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'
import moment from 'moment';

export default defineComponent({
  name: 'PageCartShop',

  setup () {
    const storeFirebase = useFirebaseStore()
    const { products, cashFlow, productsStockHistory, countProductsStockHistoryById, loadingDatabase, customerById } = storeToRefs(storeFirebase)

    return {
      products,
      cashFlow,
      countProductsStockHistoryById,
      loadingDatabase,
      customerById,
      productsStockHistory
    }
  },

  data () {
    return {
      tab: 'products',
      tableType: 'table',
      filter: '',
      firebaseMixinInstance: null,
      pagination: {
        rowsPerPage: 0,
        sortBy: 'createdAt',
        descending: true
      },
      cartShopProducts: {},
      subTotalDiscountObject: {},
      addProductModalOpen: false,
      saveDialogOpen: false,
      chooseCustomerModalOpen: false,
      addCustomerModalOpen: false,
      date: null,
      purchasePayed: true,
      saleEdit: null,
      description: ''
    }
  },

  computed: {
    cartShopGroupedArray () {
      return Object.keys(this.cartShopProducts).map(key => this.cartShopProducts[key]).sort((a, b) =>
        a.product.name > b.product.name ? 1 : ((b.product.name > a.product.name) ? -1 : 0)
      )
    },
    columnsProduct () {
      return [
        { name: 'name', label: this.$t('name'), field: 'name', sortable: true, class: 'text-green', align: 'left' },
        { name: 'saleValue', label: this.$t('saleValue'), field: 'saleValue', sortable: true, align: 'left' },
        {
          name: 'currentInventory',
          label: this.$t('currentInventory'),
          field: row => this.countProductsStockHistoryById(row.id),
          sortable: true,
          align: 'left'
        },
        {
          name: 'cartQuantity',
          label: this.$t('cartQuantity'),
          field: row => this.cartShopProducts[row.id] ? this.cartShopProducts[row.id].quantity : 0,
          sortable: true,
          align: 'left'
        },
        {
          name: 'description',
          label: this.$t('description'),
          field: 'description',
          sortable: true,
          align: 'left'
        },
        {
          name: 'code',
          label: this.$t('code'),
          field: 'code',
          sortable: true,
          align: 'left'
        },
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
      return this.cartShopGroupedArray.reduce((acc, item) => acc + (this.getDiscountValue(item.discountObject, item.unitaryValue) * item.quantity) || 0, 0)
    },
    subtotal () {
      return this.cartShopGroupedArray.reduce((acc, item) => acc + item.unitaryValue * item.quantity, 0)
    },
    totalProductsWithDiscount () {
      return this.cartShopGroupedArrayDiscountSum ? this.cartShopGroupedArray.reduce((acc, item) => acc + item.unitaryValue * item.quantity, 0) - this.cartShopGroupedArrayDiscountSum : 0
    },
    // TODO cartshop % discount not working
    discountSubTotalValue () {
      return this.calcDiscountResult(this.subTotalDiscountObject, this.totalProductsWithDiscount)
    },
    totalDiscount () {
      return (this.cartShopGroupedArrayDiscountSum + this.subTotalDiscountObject?.discount || 0)
    },
    total () {
      return this.cartShopGroupedArrayDiscountSum ? this.totalProductsWithDiscount - this.getDiscountValue(this.subTotalDiscountObject, this.totalProductsWithDiscount) : this.subtotal - this.totalDiscount
    }
  },

  watch: {
    loadingDatabase (val) {
      if (!val) {
        this.globalLoading = false
      }
      if (this.$route.params.customerId) {
        this.checkCustomerExists(this.$route.params.customerId)
      }
      if (this.$route.params.id && !val) {
        this.checkExistsAndIsPurchase(this.$route.params.id)
      }
    }
  },

  created () {
    this.date = formatDate(Date.now(), 'DD/MM/YYYY')
    if (this.loadingDatabase) {
      this.globalLoading = true
    }
  },

  mounted () {
    if (this.$route.params.customerId && !this.loadingDatabase) {
      this.checkCustomerExists(this.$route.params.customerId)
    }
    if (this.$route.params.id) {
      this.checkExistsAndIsPurchase(this.$route.params.id)
    }
  },

  methods: {
    checkExistsAndIsPurchase (id) {
      const sale = this.cashFlow.find(item => item.id === id)
      if (!sale) {
        Notify.create({
          message: `${this.$t('sale')} ${this.$t('notExist')}`,
          color: 'negative',
          closeBtn: true
        })
        this.$router.push('/cart-shop')
      }
      if (sale?.type !== 'purchase' && !sale.products) {
        Notify.create({
          message: `${this.$t('sale')} ${this.$t('notExist')}`,
          color: 'negative',
          closeBtn: true
        })
        this.$router.push('/cash-flow')
      }
      this.saleEdit = sale
      this.description = sale.description
      this.date = formatDate(sale.date, 'DD/MM/YYYY')
      sale.products.forEach(item => {
        this.cartShopProducts[item.id] = {
          product: {
            id: item.id,
            ...item
          },
          unitaryValue: item.unitaryValue,
          quantity: item.quantity,
          decreaseStock: true,
          ...(item.discountObject?.type) && { discountObject: item.discountObject }
        }
        this.subTotalDiscountObject = sale.subTotalDiscountObject || {}
      })
      console.log('sale', sale)
    },
    getCollRowValue (col, row) {
      if (typeof col.field === 'function') {
        return col.field(row)
      }
      return col.format ? col.format(row[col.field]) : row[col.field]
    },
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
      if (result.options.id === 'subTotalDiscountObject') {
        if (cancel) {
          this.subTotalDiscountObject = {}
          return
        }
        this.subTotalDiscountObject = result.discountObject
        return
      }
      this.cartShopProducts[result.options.id].discountObject = result.discountObject
    },
    checkCartShopItemQuantityRemove (id, quantity) {
      if (quantity < 1) {
        this.removeItem(id)
      }
    },
    removeItem (id) {
      Dialog.create({
        title: `${this.$t('removeItem')}?`,
        message: this.cartShopProducts[id].product.name,
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
          this.reset()
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
        id: 'subTotalDiscountObject'
      }
      let discountObject = this.subTotalDiscountObject
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
    checkCustomerExists (id) {
      const customer = this.customerById(id)
      if (!customer) {
        Notify.create({
          message: `${this.$t('customer')} ${this.$t('notExist')}`,
          color: 'negative',
          closeBtn: true
        })
        this.$router.push('/customers')
      }
    },
    save (customerId) {
      this.chooseCustomerModalOpen = false
      this.saveDialogOpen = false
      if (customerId) {
        this.checkCustomerExists(customerId)
      }
      const customer = this.customerById(customerId)
      Dialog.create({
        title: this.$t('confirmPurchase') + '?',
        message: customerId ? `${this.$t('customer')}: ${customer.name}` : this.$t('fastSale'),
        persistent: true,
        cancel: true
      }).onOk(async () => {
        const sale = {
          type: customer?.name ? 'purchase' : 'fastSale',
          description: this.description,
          ...(this.subTotalDiscountObject?.type) && { subTotalDiscountObject: this.subTotalDiscountObject },
          date: moment(this.date, 'DD/MM/YYYY').toDate(),
          total: this.total,
          ...customerId && {
            customer: {
              id: customerId,
              name: customer.name
            }
          },
          products: this.cartShopGroupedArray.map(item => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            unitaryValue: item.unitaryValue,
            ...(item.discountObject?.type) && { discountObject: item.discountObject }
          }))
        }
        if (customer?.name) {
          sale.purchasePayed = this.purchasePayed
        }

        const saleId = this.saleEdit?.id ? this.saleEdit.id : `${Date.now()}`

        const ref = this.firebaseMixin('cashFlow')
        const action = this.saleEdit
          ? ref.id(this.saleEdit.id).update : ref.id(saleId).set

        action({ ...sale })

        if (this.saleEdit) {
          this.productsStockHistory.filter(item => item.refId === this.saleEdit.id).forEach(item => {
            this.firebaseMixin('productsStockHistory').id(item.id).delete()
          })
        }
        this.cartShopGroupedArray.forEach(item => {
          if (item.decreaseStock) {
            this.firebaseMixin('productsStockHistory').add({
              productId: item.product.id,
              quantity: -Math.abs(item.quantity),
              description: `${this.$t('boughtBy')} ` + (customerId ? `${this.$t('customer')}: ${customer?.name}` : this.$t('fastSale')),
              refId: saleId
            })
          }
        })
        this.reset()

        Notify.create({
          message: this.$t('savedOperation'),
          color: 'positive',
          closeBtn: true
        })
      })
    },
    reset () {
      this.date = formatDate(Date.now(), 'DD/MM/YYYY')
      this.cartShopProducts = {}
      this.subTotalDiscountObject = {}
      this.saleEdit = null
      this.tab = 'products'
      if (this.$route.params.id) {
        this.$router.push('/cash-flow')
      }
    }
  }
})
</script>

<style lang="scss">
  .table-cart-shop .q-table__grid-content {
    flex: unset !important
  }
</style>
