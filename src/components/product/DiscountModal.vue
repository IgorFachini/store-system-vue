<template>
  <q-dialog
    v-model="open"
  >
    <q-card>
      <q-card-section class="q-py-md">
        {{ options.title }}
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="q-gutter-sm row">
          <q-radio
            v-model="discountObject.type"
            val="value"
            :label="$t('value')"
          />
          <q-radio
            v-model="discountObject.type"
            val="percentage"
            :label="$t('percentage')"
          />
        </div>
        <v-input
          v-if="render"
          v-model="discountObject.discount"
          class="full-width"
          :label="$t('discount')"
          currency
        />
        <div class="row justify-between q-my-md">
          <q-btn
            class="col-5"
            color="red"
            :label="$t('cancel')"
            @click="cancel"
          />
          <q-btn
            class="col-5"
            color="green"
            :label="$t('confirm')"
            @click="confirm"
          />
        </div>
        <q-item>
          <q-item-section>
            <q-item-label> {{ $t('productValue') }}</q-item-label>
          </q-item-section>

          <q-item-section
            side
          >
            <q-item-label
              caption
              class="text-blue"
            >
              {{ options.value.toFixed(2) }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label> {{ $t('discount') }}</q-item-label>
          </q-item-section>

          <q-item-section
            side
          >
            <q-item-label
              caption
              class="text-red"
            >
              -{{ discountLabel }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label> {{ $t('finalValue') }}</q-item-label>
          </q-item-section>

          <q-item-section
            side
          >
            <q-item-label
              caption
              class="text-green"
            >
              {{ finalValueLabel }}
            </q-item-label>
          </q-item-section>
        </q-item>
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
</template>
<script>

export default {
  name: 'DiscountModal',

  emits: ['cancel', 'confirm'],

  data () {
    return {
      open: false,
      options: {
        title: '',
        id: '',
        value: 0
      },
      discountObject: {
        type: 'value',
        discount: 0
      }
    }
  },

  computed: {
    discountLabel () {
      return this.discountObject.discount + ' ' + (this.discountObject.type === 'value' ? '$' : '%')
    },
    finalValueLabel () {
      return this.discountObject.type === 'value' ? (this.options.value - this.discountObject.discount).toFixed(2) : this.options.value - (this.options.value * this.discountObject.discount / 100).toFixed(2)
    }
  },

  watch: {
    'discountObject.type' () {
      this.discountObject.discount = 0
    },
    'discountObject.discount' (value) {
      if (this.discountObject.type === 'value' && value > this.options.value) {
        this.discountObject.discount = this.options.value
        this.$nextTick(() => {
          this.forceRerender()
        })
      }
      if (this.discountObject.type === 'percentage' && value > 100) {
        this.discountObject.discount = 100
        this.$nextTick(() => {
          this.forceRerender()
        })
      }
    }
  },

  methods: {
    openModal (options, discountObject) {
      this.discountObject = (discountObject?.type && discountObject) || {
        type: 'value',
        discount: 0
      }
      this.open = true
      this.options = options
    },
    cancel () {
      this.open = false
      this.$emit('cancel', { options: this.options })
    },
    confirm () {
      this.open = false
      this.$emit('confirm', { options: this.options, discountObject: this.discountObject })
    }
  }
}
</script>
<style lang="scss">
</style>
