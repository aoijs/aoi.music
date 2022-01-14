"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
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
    async _convertStreamToBuffer(stream) {
        let buffer = [];
        return new Promise((res, rej) => {
            stream.on("data", (chunk) => buffer.push(chunk));
            stream.on("end", (_) => {
                buffer.concat(buffer);
                res(buffer);
            });
            stream.on("error", (err) => console.error(`failed to convert with reason: ${err}`));
        });
    }
    async write(id, stream) {
        if (!this._enabled())
            return;
        if (this.config.cacheType === constants_1.CacheType.Memory) {
            const data = await this._convertStreamToBuffer(stream);
            this.map.set(id, data);
            return;
        }
        else if (this.config.cacheType === constants_1.CacheType.Disk) {
            const st = fs.createWriteStream(id);
            stream.pipe(st);
            return;
        }
        else {
            throw new Error(`Cache Type is invalid`);
        }
    }
    get(id) {
        if (!this._enabled())
            return null;
        if (this.config.cacheType === constants_1.CacheType.Memory) {
            return this.map.get(id);
        }
        if (this.config.cacheType === constants_1.CacheType.Disk) {
            const st = fs.createReadStream(id);
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