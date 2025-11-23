import { Notify } from 'quasar'

export async function handleAuthRequest(store, requestFn, router) {
  let response
  try {
    response = await requestFn()
  } catch {
    Notify.create({
      message: 'An unknown error occurred',
      color: 'negative',
    })
    return false
  }

  if (!response.data?.success) {
    Notify.create({
      message: response.data?.message,
      color: 'negative',
    })
    return false
  }

  const { person, access_token, expiry, message } = response.data

  // Use the store's setAuthData method for consistency
  store.setAuthData({
    user: person,
    accessToken: access_token,
    accessTokenExpiry: expiry,
  })

  // Show success message if provided
  if (message) {
    Notify.create({
      message,
      color: 'positive',
      position: 'top',
      timeout: 3000,
    })
  }

  router.push('/dashboard')
  return true
}

export async function handleOAuthRequest(store, requestFn) {
  let response
  try {
    response = await requestFn()
  } catch (error) {
    console.error('OAuth request error:', error)
    return { success: false, error: error.message || 'OAuth request failed' }
  }

  if (!response.data?.success) {
    const errorMessage = response.data?.message || 'OAuth authentication failed'
    return { success: false, error: errorMessage }
  }

  const { person, access_token, expiry } = response.data

  // Use the store's setAuthData method for consistency
  store.setAuthData({
    user: person,
    accessToken: access_token,
    accessTokenExpiry: expiry,
  })

  return { success: true, user: person }
}
