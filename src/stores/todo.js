import { defineStore, acceptHMRUpdate } from 'pinia'
import { Notify } from 'quasar'
import axios from 'config/axios'

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: null,
    loading: false,
  }),

  getters: {
    allTodos: (state) => state.todos?.todos || [],
    activeTodos: (state) => state.todos?.todos?.filter((todo) => !todo.is_completed) || [],
    completedTodos: (state) => state.todos?.todos?.filter((todo) => todo.is_completed) || [],
    todoCount: (state) => state.todos?.todos?.length || 0,
    activeCount: (state) => state.todos?.todos?.filter((todo) => !todo.is_completed).length || 0,
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
     * Fetch todos from the API based on status filter
     * @param {string} status - 'all', 'pending', or 'completed'
     */
    async fetchTodos(status = 'all') {
      this.loading = true
      try {
        // Map 'pending' to 'incomplete' for backend compatibility
        const filterValue = status === 'pending' ? 'incomplete' : status
        const response = await axios.get(`/todo/?filter=${filterValue}`)
        this.todos = response.data
        return true
      } catch (error) {
        this.handleApiError(error, 'Failed to fetch todos')
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * Add a new todo
     * @param {Object} payload - { title: string }
     */
    async addTodo(payload) {
      this.loading = true
      try {
        const response = await axios.post('/todo/', payload)

        if (response.data?.success) {
          return true
        } else {
          throw new Error(response.data?.message || 'Failed to add todo')
        }
      } catch (error) {
        this.handleApiError(error, 'Failed to add todo')
      } finally {
        this.loading = false
      }
    },

    /**
     * Update a todo
     * @param {string} entityId - The todo entity ID
     * @param {Object} payload - { title?: string, is_completed?: boolean }
     */
    async updateTodo(entityId, payload) {
      this.loading = true
      try {
        const response = await axios.put(`/todo/${entityId}`, payload)

        if (response.data?.success) {
          return true
        } else {
          throw new Error(response.data?.message || 'Failed to update todo')
        }
      } catch (error) {
        this.handleApiError(error, 'Failed to update todo')
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete a todo
     * @param {string} entityId - The todo entity ID
     */
    async deleteTodo(entityId) {
      this.loading = true
      try {
        const response = await axios.delete(`/todo/${entityId}`)

        if (response.data?.success) {
          return true
        } else {
          throw new Error(response.data?.message || 'Failed to delete todo')
        }
      } catch (error) {
        this.handleApiError(error, 'Failed to delete todo')
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete all completed todos (bulk delete)
     */
    async bulkDeleteTodo() {
      this.loading = true
      try {
        const response = await axios.delete('/todo/bulk')

        if (response.data?.success) {
          this.showSuccessNotification('Completed todos cleared')
          return true
        } else {
          throw new Error(response.data?.message || 'Failed to delete completed todos')
        }
      } catch (error) {
        this.handleApiError(error, 'Failed to delete completed todos')
      } finally {
        this.loading = false
      }
    },

    /**
     * Mark all todos as completed
     */
    async markAllAsCompleted() {
      this.loading = true
      try {
        const response = await axios.patch('/todo/mark-all-completed')

        if (response.data?.success) {
          return true
        } else {
          throw new Error(response.data?.message || 'Failed to mark all as completed')
        }
      } catch (error) {
        this.handleApiError(error, 'Failed to mark all as completed')
      } finally {
        this.loading = false
      }
    },

    /**
     * Mark all todos as pending (incomplete)
     */
    async markAllAsPending() {
      this.loading = true
      try {
        const response = await axios.patch('/todo/mark-all-pending')

        if (response.data?.success) {
          return true
        } else {
          throw new Error(response.data?.message || 'Failed to mark all as pending')
        }
      } catch (error) {
        this.handleApiError(error, 'Failed to mark all as pending')
      } finally {
        this.loading = false
      }
    },
  },
})

// Hot Module Replacement support
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTodoStore, import.meta.hot))
}
