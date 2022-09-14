"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPlayer = void 0;
const voice_1 = require("@discordjs/voice");
const enums_1 = require("./../typings/enums");
const request_1 = require("../newutils/request");
const promises_1 = require("timers/promises");
const constants_1 = require("../newutils/constants");
class AudioPlayer {
    constructor(options) {
        this.currentResource = null;
        this.options = options;
        this.modes = this.defaultMode();
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
        const current = this.queue[this.modes.currentTrack];
        let stream = await (0, request_1.requestStream)(current, current.formatedPlatforms, this.options.manager);
        if (this.modes.filters.length) {
        }
        else {
            resource = (0, voice_1.createAudioResource)(stream, {
                inlineVolume: true,
                inputType: voice_1.StreamType.Arbitrary,
            });
            this.currentResource = resource;
        }
        this.player.play(resource);
        if (this.modes.ytMix) {
            if (this.queue[this.modes.currentTrack].id ===
                this.modes.ytMix.lastUrl) {
                const tracks = (await this.options.manager.search(enums_1.PlatformType.Youtube, this.queue[this.modes.currentTrack].id, 3));
                await this.add(tracks.map((x) => `https://www.youtube.com/watch?v=${x.id}`), enums_1.PlatformType.Youtube, this.queue[this.modes.currentTrack].requester);
            }
        }
    }
    async _loopQueue() {
        if (this.modes.currentTrack >= this.queue.length) {
            this.modes.currentTrack = 0;
        }
        else {
            this.modes.currentTrack++;
        }
        await this.play();
    }
    async _playNext() {
        if (this.options.type === "default") {
            if (this.modes.currentTrack >= 1) {
                this.queue.shift();
            }
            else {
                this.modes.currentTrack += 1;
            }
        }
        else if (this.options.type === "fonly") {
            this.queue.shift();
        }
        else {
            this.modes.currentTrack += 1;
        }
        await this.play();
    }
    _destroy() {
        this.modes = this.defaultMode();
        this.queue = [];
    }
    _configPlayer() {
        this.player.on("stateChange", async (os, ns) => {
            if (os.status !== voice_1.AudioPlayerStatus.Idle &&
                ns.status === voice_1.AudioPlayerStatus.Idle) {
                if (this.modes.paused) {
                }
                else if (this.modes.loop === enums_1.LoopMode.Track &&
                    this.queue[this.modes.currentTrack]) {
                    this.options.manager.emit(enums_1.PlayerEvents.TRACK_END, this.queue[this.modes.currentTrack]);
                    await this.play();
                }
                else if (this.modes.loop === enums_1.LoopMode.Queue &&
                    this.queue.length) {
                    this.options.manager.emit(enums_1.PlayerEvents.TRACK_END, this.queue[this.modes.currentTrack]);
                    await this._loopQueue();
                }
                else if (this.modes.autoPlay != "none" &&
                    this.queue.length === 1) {
                    this.options.manager.emit(enums_1.PlayerEvents.TRACK_END, this.queue[this.modes.currentTrack]);
                    // this._autoPlay();
                }
                else if (this.queue.length > 1 &&
                    this.modes.currentTrack < this.queue.length - 1) {
                    this.options.manager.emit(enums_1.PlayerEvents.TRACK_END, this.queue[this.modes.currentTrack]);
                    await this._playNext();
                }
                else {
                    this.options.manager.emit(enums_1.PlayerEvents.TRACK_END, this.queue[this.modes.currentTrack]);
                    this.options.manager.emit(enums_1.PlayerEvents.QUEUE_END);
                    this._destroy();
                }
            }
            if (os.status === voice_1.AudioPlayerStatus.Playing &&
                ns.status !== voice_1.AudioPlayerStatus.Playing &&
                ns.status !== voice_1.AudioPlayerStatus.Idle &&
                ns.status !== voice_1.AudioPlayerStatus.Paused) {
                this.options.manager.emit(enums_1.PlayerEvents.TRACK_END, this.queue[this.modes.currentTrack]);
            }
        });
        this.player.on("error", async (error) => {
            this.options.manager.emit(enums_1.PlayerEvents.AUDIO_ERROR, error);
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
                    !this.modes.ytMix.enabled) {
                    this.modes.ytMix.enabled = true;
                    this.modes.ytMix.lastUrl = track[track.length - 1];
                }
                const info = await (0, request_1.requestInfo)(id, "Youtube", this.options.manager);
                if (!info)
                    continue;
                this.queue.push({
                    ...info,
                    requester: member,
                });
                if (this.queue.length === 1) {
                    await this.play();
                }
            }
            else if (type === enums_1.PlatformType.SoundCloud) {
                const info = await ( 0, request_1.requestInfo )( track[ i ], constants_1.formatedPlatforms[ enums_1.PlatformType.SoundCloud ], this.options.manager );
                                console.log({ info,track:track[i] });
                if (!info)
                    continue;
                for (let i = 0; i < info.length; i++) {
                    this.queue.push({
                        ...info[i],
                        requester: member,
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
                    this.queue.push({ ...info[i], requester: member });
                    if (this.queue.length === 1) {
                        await this.play();
                    }
                }
            }
            else if (type === enums_1.PlatformType.Url) {
                const info = await (0, request_1.requestInfo)(track[i], constants_1.formatedPlatforms[enums_1.PlatformType.Url], this.options.manager);
                this.queue.push({ ...info, requester: member });
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
        return (this.modes.paused = this.player.pause());
    }
    resume() {
        this.modes.paused = false;
        return this.player.unpause();
    }
    set volume(volume) {
        this.modes.volume = volume;
        this.currentResource.volume.setVolume(volume / 100);
    }
    get volume() {
        return this.modes.volume;
    }
    set loop(loop) {
        this.modes.loop = loop;
    }
    get loop() {
        return this.modes.loop;
    }
    set autoPlay(autoPlay) {
        this.modes.autoPlay = autoPlay;
    }
    get autoPlay() {
        return this.modes.autoPlay;
    }
}
exports.AudioPlayer = AudioPlayer;
//# sourceMappingURL=audioPlayer.js.map