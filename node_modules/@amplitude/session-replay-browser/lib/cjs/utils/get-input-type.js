"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputType = exports.toLowerCase = void 0;
function toLowerCase(str) {
    return str.toLowerCase();
}
exports.toLowerCase = toLowerCase;
/**
 * Get the type of an input element.
 * This takes care of the case where a password input is changed to a text input.
 * In this case, we continue to consider this of type password, in order to avoid leaking sensitive data
 * where passwords should be masked.
 */
function getInputType(element) {
    // when omitting the type of input element(e.g. <input />), the type is treated as text
    var type = element.type;
    return element.hasAttribute('data-rr-is-password')
        ? 'password'
        : type
            ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                toLowerCase(type)
            : null;
}
exports.getInputType = getInputType;
//# sourceMappingURL=get-input-type.js.map