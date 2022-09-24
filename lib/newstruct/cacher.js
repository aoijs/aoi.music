"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Cacher_instances, _Cacher_config, _Cacher_doCompressionSave;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cacher = void 0;
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = require("path");
const promises_2 = require("stream/promises");
const zlib_1 = require("zlib");
const stream_1 = require("stream");
class Cacher {
    constructor(config) {
        _Cacher_instances.add(this);
        _Cacher_config.set(this, void 0);
        __classPrivateFieldSet(this, _Cacher_config, config, "f");
        if (config.type === "disk" && !(0, fs_1.existsSync)(config.path)) {
            (0, fs_1.mkdirSync)(config.path, {
                recursive: true,
            });
        }
        __classPrivateFieldGet(this, _Cacher_config, "f").map = new Map();
    }
    write(metaData, stream) {
        let data = "";
        stream.on("data", (chunk) => {
            data += chunk;
        });
        stream.on("end", async () => {
            if (__classPrivateFieldGet(this, _Cacher_config, "f").type === "memory") {
                __classPrivateFieldGet(this, _Cacher_config, "f").map.set(metaData.id, Buffer.from(data));
            }
            else {
                const hash = (0, path_1.join)(__classPrivateFieldGet(this, _Cacher_config, "f").path, `${Math.floor(10000000 * Math.random())}.gz`);
                await __classPrivateFieldGet(this, _Cacher_instances, "m", _Cacher_doCompressionSave).call(this, stream, hash);
                __classPrivateFieldGet(this, _Cacher_config, "f").map.set(metaData.id, hash);
            }
        });
    }
    get(id) {
        if (__classPrivateFieldGet(this, _Cacher_config, "f").type === "memory") {
            return stream_1.Readable.from(__classPrivateFieldGet(this, _Cacher_config, "f").map.get(id));
        }
        else {
            const hash = __classPrivateFieldGet(this, _Cacher_config, "f").map.get(id);
            if (hash) {
                const file = (0, fs_1.createReadStream)(hash);
                const unzip = (0, zlib_1.createUnzip)();
                const stream = file.pipe(unzip);
                return stream_1.Readable.from(stream);
            }
        }
    }
    delete(id) {
        if (__classPrivateFieldGet(this, _Cacher_config, "f").type === "memory") {
            __classPrivateFieldGet(this, _Cacher_config, "f").map.delete(id);
        }
        else {
            const hash = __classPrivateFieldGet(this, _Cacher_config, "f").map.get(id);
            if (hash) {
                __classPrivateFieldGet(this, _Cacher_config, "f").map.delete(id);
                (0, fs_1.unlinkSync)(hash);
            }
        }
    }
    has(id) {
        return __classPrivateFieldGet(this, _Cacher_config, "f").map.has(id);
    }
}
exports.Cacher = Cacher;
_Cacher_config = new WeakMap(), _Cacher_instances = new WeakSet(), _Cacher_doCompressionSave = async function _Cacher_doCompressionSave(stream, hash) {
    const gzip = (0, zlib_1.createGzip)();
    await (0, promises_1.writeFile)(hash, "");
    const file = (0, fs_1.createWriteStream)(hash);
    await (0, promises_2.pipeline)(stream, gzip, file);
};
//# sourceMappingURL=cacher.js.map