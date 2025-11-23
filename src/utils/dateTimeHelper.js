/**
 * Format a date and time string
 * @param {string|Date} dateTime - ISO 8601 date string or Date object
 * @returns {string} Formatted date and time string
 */
export function formatDateAndTime(dateTime) {
  if (!dateTime) return 'N/A'

  try {
    const date = new Date(dateTime)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }

    // Format: Nov 23, 2024 at 2:30 PM
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return 'Invalid Date'
  }
}

/**
 * Format a date only (no time)
 * @param {string|Date} date - ISO 8601 date string or Date object
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return 'N/A'

  try {
    const d = new Date(date)

    if (isNaN(d.getTime())) {
      return 'Invalid Date'
    }

    // Format: Nov 23, 2024
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid Date'
  }
}

/**
 * Format a time only (no date)
 * @param {string|Date} time - ISO 8601 date string or Date object
 * @returns {string} Formatted time string
 */
export function formatTime(time) {
  if (!time) return 'N/A'

  try {
    const t = new Date(time)

    if (isNaN(t.getTime())) {
      return 'Invalid Time'
    }

    // Format: 2:30 PM
    return t.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return 'Invalid Time'
  }
}

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} dateTime - ISO 8601 date string or Date object
 * @returns {string} Relative time string
 */
export function getRelativeTime(dateTime) {
  if (!dateTime) return 'N/A'

  try {
    const date = new Date(dateTime)
    const now = new Date()

    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }

    const diffMs = now - date
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`

    // For older dates, return formatted date
    return formatDate(date)
  } catch {
    return 'Invalid Date'
  }
}
