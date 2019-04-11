"use strict";
import buildTheme from './buildTheme.js'

let buildColor = document.getElementById("buildColor");
let changeColor = document.getElementById("changeColor");

buildColor.onclick = function (element) {
  chrome.tabs.executeScript({
    code: 'buildTheme()'
  })
};
changeColor.onclick = function(element) {
  chrome.tabs.executeScript({
    file: 'applyTheme.js'
  })
};
