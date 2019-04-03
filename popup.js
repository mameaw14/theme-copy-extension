// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";

let buildColor = document.getElementById("buildColor");
let changeColor = document.getElementById("changeColor");

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
