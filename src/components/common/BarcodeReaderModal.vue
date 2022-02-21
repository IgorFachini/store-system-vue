<template>
  <q-dialog
    v-model="open"
    maximized
  >
    <q-card>
      <q-card-section class="q-py-md">
        <div id="scan" />
        <q-page-sticky
          position="bottom-right"
          :offset="[18, 18]"
        >
          <q-btn
            icon="cancel"
            @click="onStop"
          />
        </q-page-sticky>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script>
import Quagga from 'quagga'

export default {
  name: 'BarcodeReaderModal',

  emits: ['success'],

  data () {
    return {
      open: false
    }
  },

  methods: {
    openReader () {
      this.open = true
      this.$nextTick(() => {
        this.startReader()
      })
    },
    startReader () {
      Quagga.init({
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: document.querySelector('#scan')
        },
        frequency: 10,
        decoder: {
          readers: [
            'ean_reader'
          ],
          multiple: false
        },
        numOfWorkers: navigator.hardwareConcurrency
      }, (err) => {
        if (err) {
          console.log(err)
          return
        }
        console.log('Initialization finished. Ready to start')
        Quagga.start()
        Quagga.onDetected(this.onDetected)
      })
    },
    onDetected (data) {
      this.$emit('success', data)
      this.onStop()
    },
    onStop () {
      Quagga.stop()
      this.open = false
    }
  }
}
</script>
<style lang="scss">
video {
  width: 100%;
  height: 100%;
}
canvas {
  position: fixed;
}
</style>
