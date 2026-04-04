/**
 * iOS quirks: navigator.onLine is unreliable on cold start — returns true even when offline.
 * Use getOnlineStatus() instead of navigator.onLine throughout the app.
 * Real connectivity is confirmed via Firebase .info/connected.
 */

export const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent)

// On iOS navigator.onLine always returns true (even offline), so we propagate that
// behaviour explicitly rather than hiding it. Actual offline detection relies on
// Firebase .info/connected and the intentionalLogout flag in useUser.
export const getOnlineStatus = () => (isIOS() ? true : navigator.onLine)
