export function log(...message) {
  chrome.runtime.sendMessage(message)
  return true
}