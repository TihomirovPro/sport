export type AppNotification = {
  id: number
  type: 'error'
  message: string
}

let notificationId = 0

export function useNotifications() {
  const notifications = useState<AppNotification[]>('app-notifications', () => [])

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter((notification) => notification.id !== id)
  }

  const notifyError = (message: string) => {
    const id = ++notificationId

    notifications.value = [...notifications.value, {
      id,
      type: 'error',
      message,
    }]

    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }

  return {
    notifications,
    notifyError,
    removeNotification,
  }
}
