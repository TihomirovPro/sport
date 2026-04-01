import { reactive, toRefs } from 'vue'

const offlineState = reactive({
  isOnline: true,
  pendingOperations: 0,
  retryDelay: 0
})

export function useOfflineState() {
  return toRefs(offlineState)
}

export function setOnlineStatus(value: boolean) {
  offlineState.isOnline = value
}

export function setOfflinePendingOperations(value: number) {
  offlineState.pendingOperations = value
}

export function setRetryDelay(value: number) {
  offlineState.retryDelay = value
}
