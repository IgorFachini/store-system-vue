<template>
  <q-page class="flex flex-center">
    <q-card
      class="bg-grey-2 shadow-8 q-pt-lg q-pa-lg"
      style="border-radius: 15px;"
    >
      <q-form
        ref="form"
        @submit="onSubmit"
      >
        <div class="row justify-center">
          <div class="column">
            <q-img
              class="turbina"
              :src="Logo"
              sizes="500px"
              to="/"
            />
            <p
              class="text-h4 q-my-md"
            >
              Store System
            </p>
          </div>
        </div>
        <v-input
          v-model="form.email"
          class="col-12"
          label="E-mail"
          outlined
          lazy-rules
          :rules="[
            val => val && val.length
          ]"
          tabindex="1"
          success-rules
          @update:model-value="loginValid = true"
        />
        <v-input
          v-model="form.password"
          type="password"
          class="col-12"
          label="Password"
          outlined
          lazy-rules
          :rules="[
            val => val && val.length,
            val => loginValid
          ]"
          tabindex="2"
          @update:model-value="loginValid = true"
        />
        <div class="q-py-lg">
          <q-btn
            class="full-width"
            type="submit"
            label="Submit"
            color="primary"
            size="20px"
            no-caps
            unelevated
            tabindex="3"
            :loading="loading"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script>

import VInput from 'components/common/VInput'

import Screen from 'mixins/Screen'
import Logo from 'assets/quasar-logo-vertical.svg'

export default {
  name: 'PageLogin',

  components: {
    VInput
  },

  mixins: [Screen],

  data () {
    return {
      Logo,
      loginValid: true,
      loading: false,
      form: {
        email: '',
        password: ''
      }
    }
  },

  watch: {
    loginValid () {
      this.validateForm()
    }
  },

  methods: {
    onSubmit () {
      this.loading = true
      this.$firebaseAuth.signInWithEmailAndPassword(this.form.email, this.form.password)
        .then((userCredential) => {
          this.$router.push('/')
        }).catch((e) => {
          this.loginValid = false
          throw e
        }).finally(() => {
          this.loading = false
        })
    },

    validateForm () {
      this.$refs.form.getValidationComponents().forEach(c => {
        c.validate()
      })
    }
  }
}
</script>
