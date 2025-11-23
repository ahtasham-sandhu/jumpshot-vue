<template>
  <q-page class="flex row flex-center bg-grey-1">
    <q-card class="col-11 col-sm-8 col-md-6 col-lg-4 col-xl-3 q-pa-xs q-pa-md-sm q-mb-xl">
      <q-card-section>
        <div class="text-h5 text-center text-primary">Set Password</div>
        <div class="text-subtitle2 text-center text-grey-7 q-mt-sm">
          Set a secure password for your account to gain access.
        </div>
      </q-card-section>

      <q-card-section v-if="!tokenExpired">
        <q-form @submit.prevent="onSubmit" class="full-width">
          <!-- Password -->
          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            outlined
            class="q-mb-md"
            :rules="passwordRules"
            :disable="loading"
            lazy-rules
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- Password Requirements -->
          <div class="q-mb-md q-px-sm">
            <div class="text-caption text-grey-7 q-mb-xs">Password must contain:</div>
            <div
              v-for="(req, index) in passwordRequirements"
              :key="index"
              class="text-caption q-mb-xs"
              :class="req.met ? 'text-positive' : 'text-grey-6'"
            >
              <q-icon :name="req.met ? 'check_circle' : 'radio_button_unchecked'" size="xs" />
              {{ req.label }}
            </div>
          </div>

          <!-- Confirm Password -->
          <q-input
            v-model="passwordConfirm"
            :type="showPasswordConfirm ? 'text' : 'password'"
            label="Confirm Password"
            outlined
            lazy-rules
            :rules="confirmPasswordRules"
            class="q-mb-lg"
            :disable="loading"
          >
            <template v-slot:append>
              <q-icon
                :name="showPasswordConfirm ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPasswordConfirm = !showPasswordConfirm"
              />
            </template>
          </q-input>

          <!-- Set password Button -->
          <q-btn
            label="Set Password"
            color="primary"
            type="submit"
            class="full-width"
            :loading="loading"
            :disable="loading || !isPasswordValid"
          />
        </q-form>
      </q-card-section>

      <!-- Token Expired Message -->
      <q-card-section v-else>
        <div class="text-center">
          <q-icon name="error_outline" color="negative" size="3rem" />
          <div class="text-h6 q-mt-md text-negative">Link Expired</div>
          <div class="text-body2 text-grey-7 q-mt-sm q-mb-md">
            This password reset link has expired or is invalid.
          </div>
          <q-btn
            label="Request New Link"
            color="primary"
            flat
            @click="$router.push('/forgot-password')"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const token = ref(route.params.token)
const uidb64 = ref(route.params.uidb64)

const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const loading = ref(false)
const tokenExpired = ref(false)

// Password validation rules matching backend requirements
const passwordRules = [
  (v) => !!v || 'Password is required',
  (v) => (v && v.length >= 8) || 'Must be at least 8 characters',
  (v) => (v && v.length <= 100) || 'Must be at most 100 characters',
  (v) => (v && /[A-Z]/.test(v)) || 'Must contain at least one uppercase letter',
  (v) => (v && /[a-z]/.test(v)) || 'Must contain at least one lowercase letter',
  (v) => (v && /[0-9]/.test(v)) || 'Must contain at least one digit',
  (v) =>
    (v && /[!@#$%&()\-_[\]{};:"./<>?^*` ~',|=+]/.test(v)) ||
    'Must contain at least one special character (!@#$%&...)',
  (v) =>
    (v && /^[a-zA-Z0-9!@#$%&()\-_[\]{};:"./<>?^*` ~',|=+]+$/.test(v)) ||
    'Contains invalid characters',
]

const confirmPasswordRules = [
  (v) => !!v || 'Please confirm your password',
  (v) => v === password.value || 'Passwords do not match',
]

// Computed password requirements with visual feedback
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
  {
    label: 'Only valid characters',
    met: /^[a-zA-Z0-9!@#$%&()\-_[\]{};:"./<>?^*` ~',|=+]*$/.test(password.value),
  },
])

// Check if password meets all requirements
const isPasswordValid = computed(() => {
  return passwordRequirements.value.every((req) => req.met) && password.value === passwordConfirm.value
})

// Validate token on mount
onMounted(() => {
  if (!token.value || !uidb64.value) {
    tokenExpired.value = true
  }
})

// Submit password
async function onSubmit() {
  if (!isPasswordValid.value) {
    return
  }

  loading.value = true

  try {
    const success = await authStore.setPassword(token.value, uidb64.value, {
      password: password.value,
    })

    if (success) {
      // Account verified and password set successfully
      // The handleAuthRequest already shows success notification and redirects to dashboard
    }
  } catch (error) {
    // Check if error is due to expired or invalid token
    if (error.message && (error.message.includes('Invalid') || error.message.includes('token'))) {
      tokenExpired.value = true
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
  