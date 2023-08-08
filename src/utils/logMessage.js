export function log(...message) {
  browser.runtime.sendMessage(message)
  return true
}