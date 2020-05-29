"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _data = _interopRequireDefault(require("./data.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var query = function query(key) {
  if (!_data["default"][key]) {
    throw "[StaticSourceData] ".concat(key, " key not found, please check configuration in plugin config");
  }

  return _data["default"][key];
};

var _default = query;
exports["default"] = _default;