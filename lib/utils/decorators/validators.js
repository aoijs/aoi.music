"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = exports.decorateMethod = void 0;
const Player_1 = __importDefault(require("../../structures/Player"));
function decorateMethod(func) {
    return function decorate(_0, _1, descriptor) {
        const method = descriptor.value;
        descriptor.value = function (...args) {
            return func.apply(this, [method.bind(this), ...args]);
        };
        return descriptor;
    };
}
exports.decorateMethod = decorateMethod;
var Queue;
(function (Queue) {
    function validatePlayer() {
        return decorateMethod(function (func, player) {
            const error = new TypeError(`Argument "player" must be present and a instance of Player`);
            if (!(player instanceof Player_1.default))
                throw error;
            return func(player);
        });
    }
    Queue.validatePlayer = validatePlayer;
})(Queue = exports.Queue || (exports.Queue = {}));
//# sourceMappingURL=validators.js.map