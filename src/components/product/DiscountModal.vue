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
            v-model="type"
            val="value"
            :label="$t('value')"
          />
          <q-radio
            v-model="type"
            val="percentage"
            :label="$t('percentage')"
          />
        </div>
        <v-input
          v-if="render"
          v-model="discountValue"
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
              {{ options.value }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label> {{ $t('discountValue') }}</q-item-label>
          </q-item-section>

          <q-item-section
            side
          >
            <q-item-label
              caption
              class="text-red"
            >
              -{{ discountValueLabel }}
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
      type: 'value',
      discountValue: 0,
      options: {
        title: '',
        value: 0,
        id: ''
      }
    }
  },

  computed: {
    discountValueLabel () {
      return this.discountValue + ' ' + (this.type === 'value' ? '$' : '%')
    },
    finalValueLabel () {
      return this.type === 'value' ? (this.options.value - this.discountValue).toFixed(2) : this.options.value - (this.options.value * this.discountValue / 100).toFixed(2)
    }
  },

  watch: {
    type () {
      this.discountValue = 0
    },
    discountValue (value) {
      if (this.type === 'value' && value > this.options.value) {
        this.discountValue = this.options.value
        this.$nextTick(() => {
          this.forceRerender()
        })
      }
    }
  },

  methods: {
    openModal (options) {
      this.type = 'value'
      this.discountValue = options.discount || 0
      this.open = true
      this.options = options
    },
    cancel () {
      this.open = false
      this.$emit('cancel', { id: this.options.id })
    },
    confirm () {
      this.open = false
      this.$emit('confirm', { id: this.options.id, discount: this.discountValue })
    }
  }
}
</script>
<style lang="scss">
</style>
