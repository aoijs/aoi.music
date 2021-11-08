"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = __importDefault(require("stream"));
class Tunnel extends stream_1.default.Transform {
    constructor(resource) {
        super();
        this.resource = resource;
    }
}
//# sourceMappingURL=Tunnel.js.map