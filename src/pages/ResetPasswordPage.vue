<template>
  <q-page class="flex row flex-center">
    <q-card class="col-11 col-sm-8 col-md-6 col-lg-4 col-xl-3 q-pa-xs q-pa-md-sm q-mb-xl">
      <q-card-section>
        <div class="text-h6 text-center">Reset Your Password</div>
        <div class="text-subtitle2 text-center text-grey-6">
          Please enter your new password
        </div>
      </q-card-section>

      <q-card-section v-if="!tokenExpired">
        <q-form @submit.prevent="onSubmit" class="full-width">
          <!-- Password -->
          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="New Password"
            outlined
            class="q-mb-md"
            :disable="loading"
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- Confirm Password -->
          <q-input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="Confirm Password"
            outlined
            class="q-mb-md"
            :disable="loading"
          >
            <template v-slot:append>
              <q-icon
                :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>

          <!-- Password Requirements -->
          <div class="q-mb-md">
            <div class="text-caption text-weight-medium q-mb-xs">Password requirements:</div>
            <div
              v-for="(requirement, index) in passwordRequirements"
              :key="index"
              class="text-caption q-mb-xs"
              :class="requirement.met ? 'text-positive' : 'text-grey-6'"
            >
              <q-icon
                :name="requirement.met ? 'check_circle' : 'radio_button_unchecked'"
                size="xs"
                class="q-mr-xs"
              />
              {{ requirement.label }}
            </div>
          </div>

          <!-- Reset Password Button -->
          <q-btn
            label="Reset Password"
            color="primary"
            type="submit"
            class="full-width"
            :loading="loading"
            :disable="!isFormValid"
          />

          <!-- Login Link -->
          <div class="text-center q-mt-md">
            <router-link to="/login">Back to login</router-link>
          </div>
        </q-form>
      </q-card-section>

      <!-- Token Expired Message -->
      <q-card-section v-else>
        <div class="text-center">
          <q-icon name="error_outline" size="48px" color="negative" class="q-mb-md" />
          <div class="text-body1 text-weight-medium q-mb-sm">Link Expired</div>
          <div class="text-body2 text-grey-6 q-mb-md">
            This password reset link has expired or is invalid.
          </div>
          <q-btn
            label="Request New Link"
            color="primary"
            outline
            @click="$router.push('/forgot-password')"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const tokenExpired = ref(false)

const token = route.params.token
const uidb64 = route.params.uidb64

// Validate token and uidb64 exist
if (!token || !uidb64) {
  tokenExpired.value = true
}

// Password requirements validation
const passwordRequirements = computed(() => [
  {
    label: '8-100 characters',
    met: password.value.length >= 8 && password.value.length <= 100,
  },
  {
    label: 'One uppercase letter (A-Z)',
    met: /[A-Z]/.test(password.value),
  },
  {
    label: 'One lowercase letter (a-z)',
    met: /[a-z]/.test(password.value),
  },
  {
    label: 'One digit (0-9)',
    met: /[0-9]/.test(password.value),
  },
  {
    label: 'One special character (!@#$%&...)',
    met: /[!@#$%&()\-_[\]{};:"./<>?^*` ~',|=+]/.test(password.value),
  },
])

const isPasswordValid = computed(() => {
  return passwordRequirements.value.every((req) => req.met)
})

const isFormValid = computed(() => {
  return (
    isPasswordValid.value &&
    password.value === confirmPassword.value &&
    confirmPassword.value.length > 0
  )
})

async function onSubmit() {
  if (!isFormValid.value) return

  loading.value = true
  try {
    const success = await authStore.resetPassword(token, uidb64, {
      password: password.value,
    })

    if (success) {
      // Auto-login handled by handleAuthRequest in auth store
      // User will be redirected to dashboard automatically
    }
  } catch (error) {
    // Check if error is due to expired/invalid token
    if (error.response?.status === 400 || error.response?.status === 401) {
      tokenExpired.value = true
    }
  } finally {
    loading.value = false
  }
}
</script>
