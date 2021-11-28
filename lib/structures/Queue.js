"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const validators_1 = require("../utils/decorators/validators");
class PlayerQueue {
    constructor() {
        this.list = [];
        this.current = null;
        this.previous = null;
    }
    setPlayer(player) {
        this.player = player;
    }
    setCurrent(track) {
        this.current = track;
    }
}
__decorate([
    validators_1.Queue.validatePlayer()
], PlayerQueue.prototype, "setPlayer", null);
exports.default = PlayerQueue;
//# sourceMappingURL=Queue.js.map