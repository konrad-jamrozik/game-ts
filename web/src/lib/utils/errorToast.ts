/**
 * Dispatches a custom event to show an error toast notification.
 * This can be called from anywhere in the application, including outside React components
 * and from lib/ code that cannot depend on React or MUI.
 */
export function showErrorToast(message: string): void {
  const event = new CustomEvent('error-toast', { detail: message })
  globalThis.dispatchEvent(event)
}
