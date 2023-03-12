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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Cacher_instances, _Cacher_type, _Cacher_map, _Cacher_limit, _Cacher_path, _Cacher_prefixedPath, _Cacher_doCompressionSave;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cacher = void 0;
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = require("path");
const promises_2 = require("stream/promises");
const zlib_1 = require("zlib");
const stream_1 = require("stream");
const web_1 = require("stream/web");
const enums_1 = require("../typings/enums");
const hidefile_1 = __importDefault(require("hidefile"));
class Cacher {
    constructor({ type, }) {
        _Cacher_instances.add(this);
        _Cacher_type.set(this, void 0);
        _Cacher_map.set(this, new Map());
        _Cacher_limit.set(this, void 0);
        _Cacher_path.set(this, void 0);
        _Cacher_prefixedPath.set(this, void 0);
        __classPrivateFieldSet(this, _Cacher_type, type, "f");
        __classPrivateFieldSet(this, _Cacher_path, "MUSIC_CACHE", "f");
        __classPrivateFieldSet(this, _Cacher_prefixedPath, ".MUSIC_CACHE", "f");
        if (__classPrivateFieldGet(this, _Cacher_type, "f") === "disk" && !(0, fs_1.existsSync)(__classPrivateFieldGet(this, _Cacher_path, "f")) && !(0, fs_1.existsSync)(__classPrivateFieldGet(this, _Cacher_prefixedPath, "f"))) {
            (0, fs_1.mkdirSync)(__classPrivateFieldGet(this, _Cacher_path, "f"), {
                recursive: true,
            });
            hidefile_1.default.isHidden(__classPrivateFieldGet(this, _Cacher_path, "f"), (err, hidden) => {
                if (err === null) {
                    if (!hidden) {
                        __classPrivateFieldSet(this, _Cacher_path, hidefile_1.default.hideSync(__classPrivateFieldGet(this, _Cacher_path, "f")).toString(), "f");
                    }
                }
            });
        }
        if (__classPrivateFieldGet(this, _Cacher_path, "f") !== __classPrivateFieldGet(this, _Cacher_prefixedPath, "f")) {
            __classPrivateFieldSet(this, _Cacher_path, __classPrivateFieldGet(this, _Cacher_prefixedPath, "f"), "f");
        }
        if (__classPrivateFieldGet(this, _Cacher_type, "f") === "disk" && (0, fs_1.existsSync)(__classPrivateFieldGet(this, _Cacher_path, "f"))) {
            const files = (0, fs_1.readdirSync)(__classPrivateFieldGet(this, _Cacher_path, "f"));
            if (files.length > 0) {
                for (const file of files) {
                    (0, fs_1.unlinkSync)((0, path_1.join)(__classPrivateFieldGet(this, _Cacher_path, "f"), file));
                }
            }
        }
    }
    async write(metaData, stream) {
        if (this.has(metaData.id))
            return;
        if (metaData.platformType === enums_1.PlatformType.LocalFile) {
            __classPrivateFieldGet(this, _Cacher_map, "f").set(metaData.id, metaData.url);
        }
        else if (this.type === "memory") {
            const data = [];
            if (stream instanceof web_1.ReadableStream) {
                stream = stream_1.Readable.from(stream);
            }
            stream.on("data", (chunk) => {
                data.push(chunk);
            });
            stream.on("end", () => {
                //@ts-ignore
                __classPrivateFieldGet(this, _Cacher_map, "f").set(metaData.id, data);
            });
        }
        else if (__classPrivateFieldGet(this, _Cacher_type, "f") === "disk") {
            const hash = (0, path_1.join)(__classPrivateFieldGet(this, _Cacher_path, "f"), `${metaData.id.replaceAll("/", "").replaceAll(":", "").replaceAll(".", "")}.gz`);
            if (stream instanceof web_1.ReadableStream) {
                stream = stream_1.Readable.from(stream);
            }
            await __classPrivateFieldGet(this, _Cacher_instances, "m", _Cacher_doCompressionSave).call(this, stream, hash);
            __classPrivateFieldGet(this, _Cacher_map, "f").set(metaData.id, hash);
        }
    }
    get(id) {
        if (__classPrivateFieldGet(this, _Cacher_type, "f") === "memory") {
            const a = __classPrivateFieldGet(this, _Cacher_map, "f").get(id);
            if (Array.isArray(a))
                return stream_1.Readable.from(a);
            else {
                return (0, fs_1.createReadStream)(a);
            }
        }
        else {
            const hash = __classPrivateFieldGet(this, _Cacher_map, "f").get(id);
            if (hash) {
                if (!hash.endsWith(".gz"))
                    return (0, fs_1.createReadStream)(hash);
                const file = (0, fs_1.createReadStream)(hash);
                const unzip = (0, zlib_1.createUnzip)();
                const stream = file.pipe(unzip);
                return stream_1.Readable.from(stream);
            }
        }
    }
    delete(id) {
        if (__classPrivateFieldGet(this, _Cacher_type, "f") === "memory") {
            __classPrivateFieldGet(this, _Cacher_map, "f").delete(id);
        }
        else {
            const hash = __classPrivateFieldGet(this, _Cacher_map, "f").get(id);
            if (hash) {
                __classPrivateFieldGet(this, _Cacher_map, "f").delete(id);
                (0, fs_1.unlinkSync)(hash);
            }
        }
    }
    clear() {
        if (__classPrivateFieldGet(this, _Cacher_type, "f") === "disk") {
            const files = (0, fs_1.readdirSync)(__classPrivateFieldGet(this, _Cacher_path, "f"));
            for (const file of files) {
                (0, promises_1.unlink)((0, path_1.join)(__classPrivateFieldGet(this, _Cacher_path, "f"), file));
            }
        }
        __classPrivateFieldGet(this, _Cacher_map, "f").clear();
    }
    has(id) {
        return __classPrivateFieldGet(this, _Cacher_map, "f").has(id);
    }
    get map() {
        return __classPrivateFieldGet(this, _Cacher_map, "f");
    }
    get type() {
        return __classPrivateFieldGet(this, _Cacher_type, "f");
    }
    get path() {
        return __classPrivateFieldGet(this, _Cacher_path, "f") ?? null;
    }
}
exports.Cacher = Cacher;
_Cacher_type = new WeakMap(), _Cacher_map = new WeakMap(), _Cacher_limit = new WeakMap(), _Cacher_path = new WeakMap(), _Cacher_prefixedPath = new WeakMap(), _Cacher_instances = new WeakSet(), _Cacher_doCompressionSave = async function _Cacher_doCompressionSave(stream, hash) {
    const gzip = (0, zlib_1.createGzip)();
    await (0, promises_1.writeFile)(hash, "");
    const file = (0, fs_1.createWriteStream)(hash);
    await (0, promises_2.pipeline)(stream, gzip, file);
};
//# sourceMappingURL=cacher.js.map