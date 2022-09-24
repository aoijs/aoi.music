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
var _AudioPlayer_modes;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPlayer = void 0;
const voice_1 = require("@discordjs/voice");
const enums_1 = require("./../typings/enums");
const request_1 = require("../newutils/request");
const promises_1 = require("timers/promises");
const constants_1 = require("../newutils/constants");
const helpers_1 = require("../newutils/helpers");
class AudioPlayer {
    constructor(options) {
        _AudioPlayer_modes.set(this, void 0);
        this.options = options;
        __classPrivateFieldSet(this, _AudioPlayer_modes, this.defaultMode(), "f");
        this.queue = [];
        this.player = (0, voice_1.createAudioPlayer)();
        this._configPlayer();
    }
    defaultMode() {
        return {
            loop: enums_1.LoopMode.None,
            filterFromStart: false,
            shuffled: false,
            paused: false,
            volume: 100,
            currentTrack: 0,
            autoPlay: enums_1.AutoPlay.None,
            filters: [],
            ytMix: {
                enabled: false,
                lastUrl: null,
            },
        };
    }
    async play() {
        let resource;
        const current = this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack];
        let stream = await (0, request_1.requestStream)(current, current.formatedPlatforms, this.options.manager);
        let s;
        if (this.options.manager.plugins.has(enums_1.PluginName.Cacher)) {
            const Cacher = (this.options.manager.plugins.get(enums_1.PluginName.Cacher));
            Cacher.write(current, stream);
            if (Cacher.type === "disk")
                stream = Cacher.get(current.id);
        }
        if (this.options.manager.plugins.has(enums_1.PluginName.Filter) &&
            __classPrivateFieldGet(this, _AudioPlayer_modes, "f").filters.length) {
            const f = (this.options.manager.plugins.get(enums_1.PluginName.Filter));
            const ffmpeg = f.createFFmpeg("-af", __classPrivateFieldGet(this, _AudioPlayer_modes, "f").filters.join(","));
            s = stream.pipe(ffmpeg);
            resource = (0, voice_1.createAudioResource)(s, {
                inlineVolume: true,
                inputType: voice_1.StreamType.Raw,
            });
        }
        else {
            s = stream;
            resource = (0, voice_1.createAudioResource)(s, {
                inlineVolume: true,
                inputType: voice_1.StreamType.Arbitrary,
            });
        }
        this.options.manager.emit(enums_1.PlayerEvents.TRACK_START, current, this);
        this.player.play(resource);
        if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").ytMix) {
            if (this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack].id ===
                __classPrivateFieldGet(this, _AudioPlayer_modes, "f").ytMix.lastUrl) {
                const tracks = (await this.options.manager.search(enums_1.PlatformType.Youtube, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack].id, 3));
                await this.add(tracks.map((x) => `https://www.youtube.com/watch?v=${x.id}`), enums_1.PlatformType.Youtube, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack].requester);
            }
        }
    }
    async _loopQueue() {
        if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack >= this.queue.length) {
            __classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack = 0;
        }
        else {
            __classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack++;
        }
        await this.play();
    }
    async _playNext() {
        if (this.options.type === "default") {
            if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack >= 1) {
                this.queue.shift();
            }
            else {
                __classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack += 1;
            }
        }
        else if (this.options.type === "fonly") {
            this.queue.shift();
        }
        else {
            __classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack += 1;
        }
        await this.play();
    }
    _destroy() {
        __classPrivateFieldSet(this, _AudioPlayer_modes, this.defaultMode(), "f");
        this.queue = [];
    }
    _configPlayer() {
        this.player.on("stateChange", async (os, ns) => {
            if (os.status !== voice_1.AudioPlayerStatus.Idle &&
                ns.status === voice_1.AudioPlayerStatus.Idle) {
                if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").paused) {
                }
                else if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").loop === enums_1.LoopMode.Track &&
                    this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack]) {
                    this.options.manager.emit(enums_1.PlayerEvents.TRACK_END, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack], this);
                    await this.play();
                }
                else if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").loop === enums_1.LoopMode.Queue &&
                    this.queue.length) {
                    this.options.manager.emit(enums_1.PlayerEvents.TRACK_END, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack], this);
                    await this._loopQueue();
                }
                else if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").autoPlay != "none" &&
                    this.queue.length === 1) {
                    this.options.manager.emit(enums_1.PlayerEvents.TRACK_END, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack], this);
                    // this._autoPlay();
                }
                else if (this.queue.length > 1 &&
                    __classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack < this.queue.length - 1) {
                    this.options.manager.emit(enums_1.PlayerEvents.TRACK_END, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack], this);
                    await this._playNext();
                }
                else {
                    this.options.manager.emit(enums_1.PlayerEvents.TRACK_END, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack], this);
                    this.options.manager.emit(enums_1.PlayerEvents.QUEUE_END, this);
                    this._destroy();
                }
            }
            if (os.status === voice_1.AudioPlayerStatus.Playing &&
                ns.status !== voice_1.AudioPlayerStatus.Playing &&
                ns.status !== voice_1.AudioPlayerStatus.Idle &&
                ns.status !== voice_1.AudioPlayerStatus.Paused) {
                this.options.manager.emit(enums_1.PlayerEvents.TRACK_END, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack], this);
            }
        });
        this.player.on("error", async (error) => {
            this.options.manager.emit(enums_1.PlayerEvents.AUDIO_ERROR, error, this);
        });
        if (this.options.manager.configs?.devOptions?.debug) {
            this.player.on("debug", (msg) => this.options.manager.configs?.devOptions?.debug
                ? console.log(msg)
                : undefined);
        }
        this.options.connection.subscribe(this.player);
    }
    async add(track, type, member) {
        for (let i = 0; i < track.length; i++) {
            if (type === enums_1.PlatformType.Youtube) {
                const id = track[i].split("?v=")[1].split("&")[0];
                if (track[i].includes("&list=") &&
                    track[i].includes("&index=") &&
                    track.includes("watch?v=") &&
                    !__classPrivateFieldGet(this, _AudioPlayer_modes, "f").ytMix.enabled) {
                    __classPrivateFieldGet(this, _AudioPlayer_modes, "f").ytMix.enabled = true;
                    __classPrivateFieldGet(this, _AudioPlayer_modes, "f").ytMix.lastUrl = track[track.length - 1];
                }
                const info = await (0, request_1.requestInfo)(id, "Youtube", this.options.manager);
                if (!info)
                    continue;
                this.queue.push({
                    ...info,
                    requester: member,
                    position: this.queue.length,
                });
                if (this.queue.length === 1) {
                    await this.play();
                }
            }
            else if (type === enums_1.PlatformType.SoundCloud) {
                const info = await (0, request_1.requestInfo)(track[i], constants_1.formatedPlatforms[enums_1.PlatformType.SoundCloud], this.options.manager);
                if (!info)
                    continue;
                for (let i = 0; i < info.length; i++) {
                    this.queue.push({
                        ...info[i],
                        requester: member,
                        position: this.queue.length,
                    });
                    if (this.queue.length === 1) {
                        await this.play();
                    }
                }
            }
            else if (type === enums_1.PlatformType.LocalFile) {
                const info = await (0, request_1.requestInfo)(track[i], "LocalFile", this.options.manager);
                if (!info)
                    continue;
                this.queue.push({
                    ...info,
                    requester: member,
                    position: this.queue.length,
                });
                if (this.queue.length === 1) {
                    await this.play();
                }
            }
            else if (type === enums_1.PlatformType.Spotify) {
                const info = (await (0, request_1.requestInfo)(track[i], "Spotify", this.options.manager));
                if (!info)
                    continue;
                for (let i = 0; i < info.length; i++) {
                    this.queue.push({
                        ...info[i],
                        requester: member,
                        position: this.queue.length,
                    });
                    if (this.queue.length === 1) {
                        await this.play();
                    }
                }
            }
            else if (type === enums_1.PlatformType.Url) {
                const info = await (0, request_1.requestInfo)(track[i], constants_1.formatedPlatforms[enums_1.PlatformType.Url], this.options.manager);
                this.queue.push({
                    ...info,
                    requester: member,
                    position: this.queue.length,
                });
                if (this.queue.length === 1) {
                    await this.play();
                }
            }
            if (this.options.manager.configs.requestOptions?.offsetTimeout) {
                await (0, promises_1.setTimeout)(this.options.manager.configs.requestOptions?.offsetTimeout);
            }
        }
    }
    skip() {
        return this.player.stop();
    }
    pause() {
        return (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").paused = this.player.pause());
    }
    resume() {
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").paused = false;
        return this.player.unpause();
    }
    set volume(volume) {
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").volume = volume;
        //@ts-ignore
        this.player.state.resource.volume.setVolume(volume / 100);
    }
    get volume() {
        return __classPrivateFieldGet(this, _AudioPlayer_modes, "f").volume;
    }
    set loop(loop) {
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").loop = loop;
    }
    get loop() {
        return __classPrivateFieldGet(this, _AudioPlayer_modes, "f").loop;
    }
    set autoPlay(autoPlay) {
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").autoPlay = autoPlay;
    }
    get autoPlay() {
        return __classPrivateFieldGet(this, _AudioPlayer_modes, "f").autoPlay;
    }
    shuffle() {
        this.queue = (0, helpers_1.shuffle)(this.queue);
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").shuffled = true;
    }
    unshuffle() {
        this.queue = this.queue.sort((a, b) => a.position - b.position);
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").shuffled = false;
    }
    isShuffled() {
        return __classPrivateFieldGet(this, _AudioPlayer_modes, "f").shuffled;
    }
    isPaused() {
        return __classPrivateFieldGet(this, _AudioPlayer_modes, "f").paused;
    }
    isLoopEnabled() {
        return __classPrivateFieldGet(this, _AudioPlayer_modes, "f").loop !== enums_1.LoopMode.None;
    }
    isAutoPlayEnabled() {
        return __classPrivateFieldGet(this, _AudioPlayer_modes, "f").autoPlay !== enums_1.AutoPlay.None;
    }
    currentPosition() {
        return __classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack;
    }
    getTrackCurrentDuration() {
        //@ts-ignore
        return this.player.state.resource?.playbackDuration ?? 0;
    }
    get currentTrack() {
        return this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack];
    }
    get previousTrack() {
        return this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack - 1];
    }
    updateFilters(filterArr) {
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").filters = filterArr;
    }
    get filters() {
        return [...__classPrivateFieldGet(this, _AudioPlayer_modes, "f").filters];
    }
}
exports.AudioPlayer = AudioPlayer;
_AudioPlayer_modes = new WeakMap();
//# sourceMappingURL=audioPlayer.js.map