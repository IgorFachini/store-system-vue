<script setup lang="ts">
import { useFirebaseStore } from 'stores/firebase'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { Notify } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import { Customer } from 'src/models/models'
import { methods } from 'boot/firebase'

const { firebaseMixin } = methods

const firebaseMixinInstance = firebaseMixin('customers')

const router = useRouter()
const route = useRoute()

const formData = ref<Customer>({
  id: '',
  city: '',
  cep: '',
  number: 0,
  createdAt: 0,
  phone: '',
  publicPlace: '',
  district: '',
  cellphone: '',
  state: '',
  observation: '',
  document: '',
  complement: '',
  name: '',
  updatedAt: 0
})

const { t } = useI18n({ useScope: 'global' })
const storeFirebase = useFirebaseStore()
const { customers, loadingDatabase } = storeToRefs(storeFirebase)
const viewMode = ref(false)
const nameBefore = ref('')

watch(loadingDatabase, (val) => {
  if (route.params.id && !val) {
    checkExists(route.params.id)
  }
})

function checkExists (id: string|string[]) {
  const row = storeFirebase.customers.find(p => p.id === id)

  if (!row) {
    Notify.create({
      message: t('notExist'),
      color: 'negative',
      closeBtn: true
    })
    router.push('/customers')
  }

  const isView = route.name === 'customers.view'
  if (!isView) {
    edit(row)
  }
}

function edit (row: Customer) {
  viewMode.value = false
  nameBefore.value = row.name
  formData.value = { ...row, id: row.id }
}

if (route.params.id && !storeFirebase.loadingDatabase) {
  checkExists(route.params.id)
}

function save () {
  const ref = firebaseMixinInstance
  const action = formData.value.id
    ? ref.id(formData.value.id).update : ref.add
  action(formData.value).catch((err) => {
    console.log('err', err)
  })
  Notify.create({
    message: t('savedOperation'),
    color: 'positive',
    closeBtn: true
  })
  reset()
  router.push('/customers')
}

function setAdress ({ logradouro, bairro, localidade, uf }) {
  formData.value.publicPlace = logradouro
  formData.value.district = bairro
  formData.value.city = localidade
  formData.value.state = uf
}

function reset () {
  viewMode.value = false
  formData.value = {}
  // $nextTick(() => {
  //   $refs.formData.resetValidation()
  // })
}

function teste (val) {
  console.log(val)
  console.log((!customers.value.map(c => c.name.toLowerCase()).includes(val.toLowerCase()) || t('alredyExist')))
  console.log(customers.value.map(c => c.name.toLowerCase()).includes(val.toLowerCase()))
}

</script>

<template>

<q-form
    ref="form"
    class="full-width"
    @submit="save"
  >
    <q-input
      v-model="formData.name"
      :label="t('name')"
      :disable="viewMode"
      :rules="[
        val => val && val.length || t('fillTheField', { field: t('name') }),
        val => !!formData.id && nameBefore === val || (!customers.map(c => c.name.toLowerCase()).includes(val.toLowerCase()) || t('alredyExist')),
        val => teste(val)
      ]"
    />

    <v-input
      v-model="formData.cellphone"
      :label="t('cellphone')"
      :disable="viewMode"
      mask="#"
      reverse-fill-mask
    />

    <v-input
      v-model="formData.phone"
      :label="t('phone')"
      :disable="viewMode"
      mask="#"
      reverse-fill-mask
    />

    <v-input
      v-model="formData.observation"
      type="textarea"
      :label="t('observation')"
      :disable="viewMode"
    />

    <q-input
      v-model="formData.document"
      :label="t('document')"
      :disable="viewMode"
    />

    <q-input
      v-model="formData.cnpj"
      label="CNPJ"
      :disable="viewMode"
    />

    <q-input
      v-model="formData.stateRegistration"
      :label="t('stateRegistration')"
      :disable="viewMode"
    />

    <q-card class="q-pa-md q-mt-md">
      <div class="text-h6">
        {{ t('adress') }}
      </div>
      <v-input-cep
        v-model="formData.cep"
        label="CEP"
        :disable="viewMode"
        @response="setAdress"
      />

      <v-input
        v-model="formData.publicPlace"
        :label="t('publicPlace')"
        :disable="viewMode"
      />

      <v-input
        v-model="formData.number"
        :label="t('number')"
        :disable="viewMode"
        type="number"
      />

      <v-input
        v-model="formData.district"
        :label="t('district')"
        :disable="viewMode"
      />

      <v-input
        v-model="formData.city"
        :label="t('city')"
        :disable="viewMode"
      />

      <v-input
        v-model="formData.state"
        :label="t('state')"
        :disable="viewMode"
      />

      <v-input
        v-model="formData.complement"
        :label="t('complement')"
        :disable="viewMode"
      />
    </q-card>

    <div class="row q-gutter-md q-mt-md justify-between">
      <q-btn
        label="Reset"
        @click="reset"
      />
      <q-btn
        :label="t('save')"
        type="submit"
        color="positive"
        :disable="viewMode"
      />
    </div>
  </q-form>
</template>
