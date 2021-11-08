"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const constructs_1 = require("../utils/decorators/constructs");
const constants_1 = require("../utils/constants");
let CacheManager = class CacheManager {
    constructor(config) {
        this.map = new Map();
        this.config = config;
    }
    _enabled() {
        return Boolean(this.config || this.config?.enabled);
    }
    async write(id, stream) {
        if (!this._enabled())
            return;
        if (this.config.cacheType === constants_1.CacheType.Memory) {
            this.map.set(id, stream);
            return;
        }
        ;
        if (this.config.cacheType === constants_1.CacheType.Disk) {
            const st = fs_1.default.createWriteStream(id);
            stream.pipe(st);
            return;
        }
        throw new Error(`Cache Type is invalid`);
    }
    get(id) {
        if (!this._enabled())
            return null;
        if (this.config.cacheType === constants_1.CacheType.Memory) {
            return this.map.get(id);
        }
        ;
        if (this.config.cacheType === constants_1.CacheType.Disk) {
            const st = fs_1.default.createReadStream(id);
            return st;
        }
        throw new Error(`Cache Type is invalid`);
    }
};
CacheManager = __decorate([
    (0, constructs_1.constructCache)()
], CacheManager);
exports.default = CacheManager;
//# sourceMappingURL=Cache.js.map