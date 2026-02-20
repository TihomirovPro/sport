function getUserErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return `Произошла ошибка: ${error.message}`
  }

  if (typeof error === 'string' && error) {
    return `Произошла ошибка: ${error}`
  }

  return 'Произошла непредвиденная ошибка. Попробуйте повторить действие.'
}

export default defineNuxtPlugin((nuxtApp) => {
  const { notifyError } = useNotifications()

  const reportError = (error: unknown, source: string) => {
    const normalized =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : { message: String(error) }

    console.error('[GlobalErrorHandler]', {
      source,
      ...normalized,
    })

    notifyError(getUserErrorMessage(error))
  }

  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    reportError(error, `vue:${info}`)

    if (instance?.$el) {
      console.error('[GlobalErrorHandler] component element:', instance.$el)
    }
  }

  nuxtApp.hook('app:error', (error) => {
    reportError(error, 'nuxt:app:error')
  })

  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, 'window:error')
  })

  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, 'window:unhandledrejection')
  })
})
