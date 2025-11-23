import { Notify } from 'quasar'

/**
 * Show a failure/error notification
 */
export function notifyFailure(message = 'An error occurred') {
  Notify.create({
    message,
    color: 'negative',
    position: 'top',
    timeout: 5000,
  })
}

/**
 * Show a success notification
 */
export function notifySuccess(message = 'Success') {
  Notify.create({
    message,
    color: 'positive',
    position: 'top',
    timeout: 3000,
  })
}

/**
 * Show an info notification
 */
export function notifyInfo(message) {
  Notify.create({
    message,
    color: 'info',
    position: 'top',
    timeout: 3000,
  })
}

/**
 * Show a warning notification
 */
export function notifyWarning(message) {
  Notify.create({
    message,
    color: 'warning',
    position: 'top',
    timeout: 4000,
  })
}
