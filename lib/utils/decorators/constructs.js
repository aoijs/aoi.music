"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructTrack = exports.constructSoundcloud = exports.constructCache = exports.constructManager = exports.decorateConstructor = void 0;
const soundcloud_key_fetch_1 = __importDefault(require("soundcloud-key-fetch"));
const constants_1 = require("../constants");
function decorateConstructor(func) {
    return function decorate(target) {
        return new Proxy(target, {
            construct(constructor, args) {
                return func(constructor, args);
            }
        });
    };
}
exports.decorateConstructor = decorateConstructor;
function constructManager() {
    return decorateConstructor((manager, args) => {
        const config = args[0];
        if (config.soundcloud) {
            const opt = config.soundcloud;
            if (typeof opt.clientId !== "string" || !opt.clientId) {
                soundcloud_key_fetch_1.default.fetchKey().then((string) => opt.clientId = string);
            }
        }
        return new manager(config);
    });
}
exports.constructManager = constructManager;
function constructCache() {
    return decorateConstructor((manager, args) => {
        const config = args[0];
        if (!config.enabled)
            throw new Error(`Cache is not enabled, but "new" is declared`);
        if (!("cacheType" in config) || !constants_1.CacheType[config.cacheType])
            throw new Error(`Cache Type is invalid`);
        if (config.cacheType === constants_1.CacheType.Disk && (typeof config.directory !== "string" || !config.directory))
            throw new Error("Cache Type is Disk, but directory is not a string");
        if ("limit" in config && isNaN(config.limit))
            throw new TypeError("Cache Limit must be a number");
        return new manager(config);
    });
}
exports.constructCache = constructCache;
function constructSoundcloud() {
    return decorateConstructor((manager, args) => {
        const config = args[0];
        if (!config)
            return new manager(config);
        if (config && "clientId" in config && (typeof config.clientId !== "string" || !config.clientId))
            throw new Error("ClientId is specified, but is invalid");
        return new manager(config);
    });
}
exports.constructSoundcloud = constructSoundcloud;
function constructTrack() {
    return decorateConstructor((manager, args) => {
        const config = args[0];
    });
}
exports.constructTrack = constructTrack;
//# sourceMappingURL=constructs.js.map