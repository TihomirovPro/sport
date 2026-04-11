export type AppNotification = {
  id: number
  type: 'error' | 'success'
  message: string
}

let notificationId = 0

export function useNotifications() {
  const notifications = useState<AppNotification[]>('app-notifications', () => [])

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter((notification) => notification.id !== id)
  }

  function notify(type: AppNotification['type'], message: string, duration = 5000) {
    const id = ++notificationId

    notifications.value = [...notifications.value, { id, type, message }]

    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }

  const notifyError = (message: string) => notify('error', message)
  const notifySuccess = (message: string) => notify('success', message, 3000)

  return {
    notifications,
    notifyError,
    notifySuccess,
    removeNotification,
  }
}
