"use strict"

chrome.runtime.onMessage.addListener(function(message) {
  console.log(...message)
})
