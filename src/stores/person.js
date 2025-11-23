import { defineStore, acceptHMRUpdate } from 'pinia'
import { Notify } from 'quasar'
import axios from 'config/axios'

export const usePersonStore = defineStore('person', {
  state: () => ({
    person: null,
    loading: false,
  }),

  getters: {
    currentPerson: (state) => state.person?.person || null,
  },

  actions: {
    /**
     * Show error notification
     */
    showErrorNotification(message = 'An unknown error occurred') {
      Notify.create({
        message,
        color: 'negative',
        position: 'top',
        timeout: 5000,
      })
    },

    /**
     * Show success notification
     */
    showSuccessNotification(message) {
      Notify.create({
        message,
        color: 'positive',
        position: 'top',
        timeout: 3000,
      })
    },

    /**
     * Handle API errors consistently
     */
    handleApiError(error, defaultMessage = 'An unknown error occurred') {
      const message = error.response?.data?.message || error.message || defaultMessage
      this.showErrorNotification(message)
      throw new Error(message)
    },

    /**
     * Fetch current user's person data
     */
    async fetchPerson() {
      this.loading = true
      try {
        const response = await axios.get('/person/me')

        if (response.data?.success) {
          this.person = response.data
          return true
        } else {
          throw new Error(response.data?.message || 'Failed to fetch person data')
        }
      } catch (error) {
        this.handleApiError(error, 'Failed to fetch person data')
      } finally {
        this.loading = false
      }
    },

    /**
     * Update current user's person data
     * @param {Object} payload - { first_name?: string, last_name?: string }
     */
    async updatePerson(payload) {
      this.loading = true
      try {
        const response = await axios.put('/person/me', payload)

        if (response.data?.success) {
          this.person = response.data
          this.showSuccessNotification('Profile updated successfully')
          return true
        } else {
          throw new Error(response.data?.message || 'Failed to update person data')
        }
      } catch (error) {
        this.handleApiError(error, 'Failed to update person data')
      } finally {
        this.loading = false
      }
    },
  },
})

// Hot Module Replacement support
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePersonStore, import.meta.hot))
}
