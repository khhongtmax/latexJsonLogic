"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dotExp = exports.timesExp = exports.divExp = exports.sqrtExp = exports.fracExp = exports.exponentExp = void 0;
exports.exponentExp = '([a-zA-Z]|[0-9]+|{.*}|(.*))^([a-zA-Z]|[0-9]+|{.*})';
exports.fracExp = '\\\\frac{.*}{.*}';
exports.sqrtExp = '\\\\sqrt(.*)?{.*}';
exports.divExp = `([a-zA-Z]|[0-9]+|${exports.fracExp}|${exports.sqrtExp}|${exports.exponentExp}|(.*))(\\\\)(div)([a-zA-Z]|[0-9]+|${exports.fracExp}|${exports.sqrtExp}|${exports.exponentExp})`;
exports.timesExp = `([a-zA-Z]|[0-9]+|${exports.fracExp}|${exports.sqrtExp}|${exports.exponentExp}|(.*))(\\\\)(times)([a-zA-Z]|[0-9]+|${exports.fracExp}|${exports.sqrtExp}|${exports.exponentExp})`;
exports.dotExp = `([0-9]+).([0-9]+)?(\\\\)(dot)([0-9]+|{[0-9]}|([0-9]+)?\\\\dot([0-9]+|{[0-9]}))`;
