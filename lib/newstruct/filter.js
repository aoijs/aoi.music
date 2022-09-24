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
var _Filter_instances, _Filter_config, _Filter_apply;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filter = void 0;
const voice_1 = require("@discordjs/voice");
const prism_media_1 = require("prism-media");
const stream_1 = require("stream");
const web_1 = require("stream/web");
const constants_1 = require("../newutils/constants");
const request_1 = require("../newutils/request");
class Filter {
    constructor(config) {
        _Filter_instances.add(this);
        _Filter_config.set(this, void 0);
        __classPrivateFieldSet(this, _Filter_config, config, "f");
    }
    async add(options, player) {
        const f = player.filters;
        for (const option of options) {
            const { filter, value } = option;
            f.push(`${filter}=${value}`);
        }
        player.updateFilters(f);
        await __classPrivateFieldGet(this, _Filter_instances, "m", _Filter_apply).call(this, player);
    }
    async remove(filter, player) {
        const f = player.filters.filter((f) => !f.startsWith(filter));
        player.updateFilters(f);
        await __classPrivateFieldGet(this, _Filter_instances, "m", _Filter_apply).call(this, player);
    }
    async removeFirst(filter, player) {
        const index = player.filters.findIndex((f) => f.startsWith(filter));
        if (index !== -1) {
            const f = player.filters;
            f.splice(index, 1);
            player.updateFilters(f);
            await __classPrivateFieldGet(this, _Filter_instances, "m", _Filter_apply).call(this, player);
        }
    }
    async removeAll(player) {
        player.updateFilters([]);
        await __classPrivateFieldGet(this, _Filter_instances, "m", _Filter_apply).call(this, player);
    }
    async seek(time, player) {
        const ffmpeg = new prism_media_1.FFmpeg({
            args: ["-ss", `${time}ms`, ...constants_1.FFMPEG_ARGS],
        });
        const track = player.currentTrack;
        const stream = await (0, request_1.requestStream)(track, track.formatedPlatforms, player.options.manager);
        let str = stream.pipe(ffmpeg);
        const newResource = (0, voice_1.createAudioResource)(str, {
            inlineVolume: true,
            inputType: voice_1.StreamType.Raw,
        });
        player.player.play(newResource);
        return true;
    }
    createFFmpeg(...args) {
        const ffmpeg = new prism_media_1.FFmpeg({
            args: [...constants_1.FFMPEG_ARGS, ...args],
        });
        return ffmpeg;
    }
}
exports.Filter = Filter;
_Filter_config = new WeakMap(), _Filter_instances = new WeakSet(), _Filter_apply = async function _Filter_apply(player) {
    const track = player.currentTrack;
    player.player.pause();
    //@ts-ignore
    const r = player.player.state.resource;
    if (!track)
        return;
    const stream = await (0, request_1.requestStream)(track, track.formatedPlatforms, player.options.manager);
    const ffmpeg = new prism_media_1.FFmpeg({
        //@ts-ignore
        args: player.filters.length ? __classPrivateFieldGet(this, _Filter_config, "f").filterFromStart ? [...constants_1.FFMPEG_ARGS, ...player.filters] : ["-ss", `${player.player.state.resource.playbackDuration}ms`, ...constants_1.FFMPEG_ARGS, "-af", player.filters.join(",")] : [...constants_1.FFMPEG_ARGS],
    });
    let str;
    if (stream instanceof web_1.ReadableStream) {
        str = stream_1.Readable.from(stream).pipe(ffmpeg);
    }
    else
        str = stream.pipe(ffmpeg);
    const newResource = (0, voice_1.createAudioResource)(str, {
        inlineVolume: true,
        inputType: voice_1.StreamType.Raw,
    });
    player.player.play(newResource);
};
//# sourceMappingURL=filter.js.map