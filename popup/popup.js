"use strict";

let buildColor = document.getElementById("buildColor");
let changeColor = document.getElementById("changeColor");

buildColor.onclick = function (element) {
  chrome.tabs.executeScript({
    file: '../js/buildTheme.js'
  })
};
changeColor.onclick = function(element) {
  chrome.tabs.executeScript({
    file: '../js/applyTheme.js'
  })
};
