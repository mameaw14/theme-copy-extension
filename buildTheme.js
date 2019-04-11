/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/buildTheme.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/buildTheme.js":
/*!***************************!*\
  !*** ./src/buildTheme.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return main; });\n/* harmony import */ var _traverse_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./traverse.js */ \"./src/traverse.js\");\n\r\n\r\nasync function main() {\r\n  var body = document.body\r\n  const { textColors, bgColors } = await Object(_traverse_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(body)\r\n\r\n  chrome.storage.sync.set(\r\n    { textColors, bgColors },\r\n    function() {\r\n      console.log(\"SET textColors\", textColors)\r\n      console.log(\"SET bgColors\", bgColors)\r\n    }\r\n  )\r\n}\r\nmain()\n\n//# sourceURL=webpack:///./src/buildTheme.js?");

/***/ }),

/***/ "./src/traverse.js":
/*!*************************!*\
  !*** ./src/traverse.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nasync function traverse(node1) {\n  console.log('traverse')\n  var textColors = {}\n  var bgColors = {}\n  const traverse1 = async node => {\n    if (node.nodeType === 1) {\n      // element\n      try {\n        // get color\n        let style = window.getComputedStyle(node)\n        let color = style.getPropertyValue(\"color\")\n        let bgColor = style.getPropertyValue(\"background-color\")\n        let width = node.offsetWidth\n        let height = node.offsetHeight\n        let area = width * height\n        if (isNaN(area)) area = 0\n\n        if (!(color in textColors)) {\n          textColors[color] = 1\n        } else {\n          textColors[color]++\n        }\n        if (!(bgColor in bgColors)) {\n          bgColors[bgColor] = area\n        } else {\n          bgColors[bgColor] += area\n        }\n      } catch (error) {\n        console.error(error)\n      }\n    }\n\n    node.childNodes.forEach(child => {\n      traverse1(child)\n    })\n    return true\n  }\n\n  await traverse1(node1)\n  delete bgColors[\"rgba(0, 0, 0, 0)\"]\n  var sumText = 0\n  var sumBg = 0\n  for (a in textColors) {\n    sumText += textColors[a]\n  }\n  for (a in bgColors) {\n    sumBg = 0\n  }\n  for (a in textColors) {\n    textColors[a] /= sumText\n  }\n  for (a in bgColors) {\n    bgColors[a] /= sumBg\n  }\n  return {\n    textColors,\n    bgColors\n  }\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (traverse);\n\n\n//# sourceURL=webpack:///./src/traverse.js?");

/***/ })

/******/ });