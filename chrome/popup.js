// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";

let buildColor = document.getElementById("buildColor");
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute("value", data.color);
});

buildColor.onclick = function (element) {
  chrome.tabs.executeScript({
    file: './buildTheme.js'
  })
};
changeColor.onclick = function(element) {
  chrome.tabs.executeScript({
    file: './applyTheme.js'
  })
};
