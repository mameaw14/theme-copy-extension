"use strict"
console.log('hello')
browser.runtime.onMessage.addListener(function(message) {
  console.log(...message)
})
