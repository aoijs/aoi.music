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
const undici_1 = require("undici");
class AudioPlayer {
    constructor(options) {
        _AudioPlayer_modes.set(this, void 0);
        this.options = options;
        __classPrivateFieldSet(this, _AudioPlayer_modes, this.defaultMode(), "f");
        this.queue = [];
        this.player = (0, voice_1.createAudioPlayer)();
        this._configPlayer();
        this.__configConnection();
    }
    defaultMode() {
        return {
            loop: enums_1.LoopMode.None,
            filterFromStart: false,
            shuffled: false,
            filtering: false,
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
    async play(emit = true) {
        let resource;
        const current = this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack];
        let stream;
        //@ts-ignore
        stream = await (0, request_1.requestStream)(current, current.formatedPlatforms, this.options.manager);
        let s;
        if (this.options.manager.plugins.has(enums_1.PluginName.Cacher)) {
            const Cacher = (this.options.manager.plugins.get(enums_1.PluginName.Cacher));
            await Cacher.write(current, stream);
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
        resource.volume.setVolume(__classPrivateFieldGet(this, _AudioPlayer_modes, "f").volume / 100);
        emit &&
            this.options.manager.emit(enums_1.PlayerEvents.TrackStart, current, this);
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
        if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack >= this.queue.length - 1) {
            __classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack = 0;
        }
        else {
            __classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack++;
        }
        await this.play();
    }
    async _playNext() {
        const Cacher = (this.options.manager.plugins.get(enums_1.PluginName.Cacher));
        if (this.options.type === "default") {
            if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack >= 1) {
                const track = this.queue.shift();
                if (this.options.manager.plugins.has(enums_1.PluginName.Cacher)) {
                    Cacher.delete(track.id);
                }
            }
            else {
                __classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack += 1;
                if (this.options.manager.plugins.has(enums_1.PluginName.Cacher)) {
                    Cacher.delete(this.queue[this.currentPosition() - 1].id);
                }
            }
        }
        else if (this.options.type === "fonly") {
            const track = this.queue.shift();
            if (this.options.manager.plugins.has(enums_1.PluginName.Cacher)) {
                const Cacher = (this.options.manager.plugins.get(enums_1.PluginName.Cacher));
                Cacher.delete(track.id);
            }
        }
        else {
            __classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack += 1;
        }
        await this.play();
    }
    _destroy() {
        __classPrivateFieldSet(this, _AudioPlayer_modes, this.defaultMode(), "f");
        this.queue = [];
        this.player.stop(true);
        if (this.options.manager.plugins.has(enums_1.PluginName.Cacher)) {
            const cacher = (this.options.manager.plugins.get(enums_1.PluginName.Cacher));
            cacher.clear();
        }
    }
    _configPlayer() {
        this.player.on("stateChange", async (os, ns) => {
            if (os.status !== voice_1.AudioPlayerStatus.Idle &&
                ns.status === voice_1.AudioPlayerStatus.Idle) {
                if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").paused) {
                }
                else if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").loop === enums_1.LoopMode.Track &&
                    this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack]) {
                    if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked) {
                        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked = false;
                        return;
                    }
                    if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").filtering) {
                        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").filtering = false;
                        return;
                    }
                    else {
                        this.options.manager.emit(enums_1.PlayerEvents.TrackEnd, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack], this);
                        await this.play();
                    }
                }
                else if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").loop === enums_1.LoopMode.Queue &&
                    this.queue.length) {
                    if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked) {
                        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked = false;
                        return;
                    }
                    if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").filtering) {
                        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").filtering = false;
                        return;
                    }
                    else {
                        this.options.manager.emit(enums_1.PlayerEvents.TrackEnd, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack], this);
                        await this._loopQueue();
                    }
                }
                else if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").autoPlay != "none" &&
                    this.queue.length === 1) {
                    if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked) {
                        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked = false;
                        return;
                    }
                    if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").filtering) {
                        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").filtering = false;
                        return;
                    }
                    else {
                        this.options.manager.emit(enums_1.PlayerEvents.TrackEnd, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack], this);
                        await this.autoPlayNext();
                    }
                }
                else if (this.queue.length > 1 &&
                    __classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack < this.queue.length - 1) {
                    if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked) {
                        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked = false;
                        return;
                    }
                    if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").filtering) {
                        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").filtering = false;
                        return;
                    }
                    else {
                        this.options.manager.emit(enums_1.PlayerEvents.TrackEnd, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack], this);
                        await this._playNext();
                    }
                }
                else {
                    if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked) {
                        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked = false;
                        return;
                    }
                    if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").filtering) {
                        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").filtering = false;
                        return;
                    }
                    else {
                        this.options.manager.emit(enums_1.PlayerEvents.TrackEnd, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack], this);
                        this.options.manager.emit(enums_1.PlayerEvents.QueueEnd, this);
                        this._destroy();
                    }
                }
            }
            if (os.status === voice_1.AudioPlayerStatus.Playing &&
                ns.status !== voice_1.AudioPlayerStatus.Playing &&
                ns.status !== voice_1.AudioPlayerStatus.Idle &&
                ns.status !== voice_1.AudioPlayerStatus.Paused) {
                if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked) {
                    __classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked = false;
                    return;
                }
                if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").filtering) {
                    __classPrivateFieldGet(this, _AudioPlayer_modes, "f").filtering = false;
                    return;
                }
                else {
                    this.options.manager.emit(enums_1.PlayerEvents.TrackEnd, this.queue[__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack], this);
                }
            }
        });
        this.player.on("error", async (error) => {
            this.options.manager.emit(enums_1.PlayerEvents.AudioError, error, this);
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
                    this.options.manager.emit(enums_1.PlayerEvents.QueueStart, track, this);
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
                        this.options.manager.emit(enums_1.PlayerEvents.QueueStart, track, this);
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
                    this.options.manager.emit(enums_1.PlayerEvents.QueueStart, track, this);
                    await this.play();
                }
            }
            else if (type === enums_1.PlatformType.Spotify) {
                let info = (await (0, request_1.requestInfo)(track[i], "Spotify", this.options.manager));
                if (!info)
                    continue;
                if (!Array.isArray(info))
                    info = [info];
                for (let i = 0; i < info.length; i++) {
                    const moreinfo = await this.options.manager.platforms.spotify.getData(info[i].url);
                    this.queue.push({
                        ...info[i],
                        requester: member,
                        position: this.queue.length,
                        thumbnail: moreinfo.coverArt.sources[0].url,
                        createdAt: new Date(moreinfo.releaseDate.isoString) ?? null,
                    });
                    if (this.queue.length === 1) {
                        this.options.manager.emit(enums_1.PlayerEvents.QueueStart, track, this);
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
                    this.options.manager.emit(enums_1.PlayerEvents.QueueStart, track, this);
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
    skipTo(position) {
        if (position > this.queue.length)
            return;
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack = position - 1;
        if (this.options.type === "default") {
            for (let i = 0; i < position - 1; i++) {
                if (this.loop === enums_1.LoopMode.Queue) {
                    this.queue.push(this.queue.shift());
                }
                else {
                    this.queue.shift();
                }
            }
        }
        else if (this.options.type === "bidirect") {
        }
        else if (this.options.type === "fonly") {
            for (let i = 0; i < position; i++) {
                if (this.loop === enums_1.LoopMode.Queue) {
                    this.queue.push(this.queue.shift());
                }
                else {
                    this.queue.shift();
                }
            }
        }
        this.skip();
    }
    pause() {
        this.options.manager.emit(enums_1.PlayerEvents.TrackPause, this);
        return (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").paused = this.player.pause());
    }
    resume() {
        this.options.manager.emit(enums_1.PlayerEvents.TrackResume, this);
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
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").filters.push(...filterArr);
    }
    async playPrevious() {
        if (__classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack <= 0)
            return;
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").currentTrack--;
        await this.play();
    }
    setFilters(filterArr) {
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").filters = filterArr;
    }
    removeFilters() {
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").filters = [];
    }
    get filters() {
        return [...__classPrivateFieldGet(this, _AudioPlayer_modes, "f").filters];
    }
    get seek() {
        return __classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked;
    }
    seeked(seek) {
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").seeked = seek;
    }
    setFiltering(type) {
        __classPrivateFieldGet(this, _AudioPlayer_modes, "f").filtering = type;
    }
    async autoPlayNext() {
        if (this.autoPlay === enums_1.AutoPlay.Youtube ||
            this.autoPlay === enums_1.AutoPlay.Spotify) {
            const yt = await this.options.manager.platforms.youtube;
            const parsed = await (await (0, undici_1.fetch)(`https://youtube.com/watch?v=${this.currentTrack.id}`)).text();
            const data = (0, helpers_1.ytRelatedHTMLParser)(parsed);
            const ids = (0, helpers_1.YoutubeRelated)(data);
            for (const id of ids) {
                const info = await (0, request_1.requestInfo)(id, this.autoPlay === "youtube" ? "Youtube" : "Spotify", this.options.manager);
                if (!info) {
                    continue;
                }
                this.queue.push({
                    ...info,
                    requester: this.currentTrack.requester,
                    position: this.queue.length,
                });
            }
        }
        else if (this.autoPlay === enums_1.AutoPlay.SoundCloud) {
            const sc = this.options.manager.platforms.soundcloud;
            //@ts-ignore
            const { collection: data } = await sc.related(
            //@ts-ignore
            this.currentTrack.scid, 10);
            for (const track of data) {
                const info = (0, request_1.generateScInfo)(track);
                if (!info)
                    continue;
                this.queue.push({
                    ...info,
                    requester: this.currentTrack.requester,
                    position: this.queue.length,
                });
            }
        }
        else if (this.autoPlay === enums_1.AutoPlay.Relative) {
            if (this.currentTrack.formatedPlatforms.toLowerCase() ===
                enums_1.AutoPlay.Youtube ||
                this.currentTrack.formatedPlatforms.toLowerCase() ===
                    enums_1.AutoPlay.Spotify) {
                const yt = await this.options.manager.platforms.youtube;
                const parsed = await (await (0, undici_1.fetch)(`https://youtube.com/watch?v=${this.currentTrack.id}`)).text();
                const data = (0, helpers_1.ytRelatedHTMLParser)(parsed);
                const ids = (0, helpers_1.YoutubeRelated)(data);
                for (const id of ids) {
                    const info = await (0, request_1.requestInfo)(id, this.currentTrack.formatedPlatforms.toLowerCase() ===
                        "youtube"
                        ? "Youtube"
                        : "Spotify", this.options.manager);
                    if (!info)
                        continue;
                    this.queue.push({
                        ...info,
                        requester: this.currentTrack.requester,
                        position: this.queue.length,
                    });
                }
            }
            else if (this.currentTrack.formatedPlatforms.toLowerCase() ===
                enums_1.AutoPlay.SoundCloud) {
                const sc = this.options.manager.platforms.soundcloud;
                //@ts-ignore
                const { collection: data } = await sc.related(
                //@ts-ignore
                this.currentTrack.scid, 10);
                for (const track of data) {
                    const info = (0, request_1.generateScInfo)(track);
                    if (!info)
                        continue;
                    this.queue.push({
                        ...info,
                        requester: this.currentTrack.requester,
                        position: this.queue.length,
                    });
                }
            }
        }
        await this._playNext();
    }
    __configConnection() {
        this.options.connection.on("stateChange", async (_, newState) => {
            if (newState.status === voice_1.VoiceConnectionStatus.Disconnected) {
                if (newState.reason ===
                    voice_1.VoiceConnectionDisconnectReason.WebSocketClose &&
                    newState.closeCode === 4014) {
                    try {
                        await (0, voice_1.entersState)(this.options.connection, voice_1.VoiceConnectionStatus.Connecting, 5000);
                        // Probably moved voice channel
                    }
                    catch {
                        this.options.connection.destroy();
                        this._destroy();
                        // Probably removed from voice channel
                    }
                }
                else if (this.options.connection.rejoinAttempts < 5) {
                    /**
                     * The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
                     */
                    await (0, promises_1.setTimeout)((this.options.connection.rejoinAttempts + 1) *
                        5000);
                    this.options.connection.rejoin();
                }
                else {
                    /**
                     * The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
                     */
                    this._destroy();
                    this.options.connection.destroy();
                }
            }
            else if (newState.status === voice_1.VoiceConnectionStatus.Destroyed) {
                /**
                 * Once destroyed, stop the subscription.
                 */
                this._destroy();
                this.player.stop(true);
            }
            else if (newState.status === voice_1.VoiceConnectionStatus.Connecting ||
                newState.status === voice_1.VoiceConnectionStatus.Signalling) {
                /**
                 * In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
                 * before destroying the voice connection. This stops the voice connection permanently existing in one of these
                 * states.
                 */
                try {
                    await (0, voice_1.entersState)(this.options.connection, voice_1.VoiceConnectionStatus.Ready, 20000);
                }
                catch {
                    if (this.options.connection.state.status !==
                        voice_1.VoiceConnectionStatus.Destroyed) {
                        this._destroy();
                        this.options.connection.destroy();
                    }
                }
            }
        });
    }
    getQueue(page = 1, limit = 10, format = "{position}) {title} | {requester.user.username}") {
        let start = (page - 1) * limit;
        let end = page * limit;
        //start queue from current track and if it is loop queue then push all prev tracks to end of queue
        const prevTracks = this.queue.slice(0, this.currentPosition());
        const nextTracks = this.queue.slice(this.currentPosition());
        let tracks = this.loop === enums_1.LoopMode.Queue
            ? [...nextTracks, ...prevTracks]
            : nextTracks;
        //add prev tracks behind 0 index with limited length
        let index = prevTracks.length - 1;
        let ng = [];
        if (this.loop !== enums_1.LoopMode.Queue)
            for (let i = 0; i < prevTracks.length; i++) {
                ng[index--] = prevTracks[i];
            }
        if (page < 0) {
            end = prevTracks.length - Math.abs(Number(page)) * limit;
            start = prevTracks.length - Math.abs(Number(page) + 1) * limit;
            // get the -ve index tracks
            const res = [];
            for (let i = end; i < start; i++) {
                res.push(ng[i]);
            }
            end = -res.length;
            tracks = res;
        }
        else {
            tracks = tracks.slice(start, end);
        }
        const props = format.match(constants_1.QueueFormatRegex);
        if (!props)
            return [];
        if (page < 0) {
            start = (Number(page) + 1) * limit - 1;
        }
        const queue = tracks.map((track, index) => {
            let formatted = format;
            props.forEach((prop) => {
                const propValue = prop.replace("{", "").replace("}", "");
                const value = propValue === "position"
                    ? page < 0
                        ? end + index
                        : start + index
                    : eval(`track?.${propValue}`);
                formatted = formatted.replaceAll(prop, value);
            });
            return formatted;
        });
        return queue;
    }
    getPing(type = "ws") {
        return this.options.connection.ping[type];
    }
    stop() {
        this.queue = [];
        this.defaultMode();
        this.player.stop();
    }
}
exports.AudioPlayer = AudioPlayer;
_AudioPlayer_modes = new WeakMap();
//# sourceMappingURL=audioPlayer.js.map