import {
    AudioPlayer as AP,
    AudioPlayerStatus,
    AudioResource,
    createAudioPlayer,
    createAudioResource,
    StreamType,
} from "@discordjs/voice";
import {
    AutoPlay,
    LoopMode,
    PlatformType,
    PlayerEvents,
} from "./../typings/enums";
import { AudioPlayerMode, AudioPLayerOptions } from "./../typings/interfaces";
import { requestInfo, requestStream } from "../newutils/request";
import { Track } from "../typings/types";
import { GuildMember } from "discord.js";
import { setTimeout } from "timers/promises";
export class AudioPlayer {
    options: AudioPLayerOptions;
    modes: AudioPlayerMode;
    queue: Track<keyof typeof PlatformType>[];
    player: AP;
    currentResource: AudioResource<unknown> | null = null;
    constructor(options: AudioPLayerOptions) {
        this.options = options;
        this.modes = this.defaultMode();
        this.queue = [];
        this.player = createAudioPlayer();
        this._configPlayer();
    }
    defaultMode(): AudioPlayerMode {
        return {
            loop: LoopMode.None,
            filterFromStart: false,
            shuffled: false,
            paused: false,
            volume: 100,
            currentTrack: 0,
            autoPlay: AutoPlay.None,
            filters: [],
        };
    }

    async play() {
        let resource: AudioResource;
        const current = this.queue[this.modes.currentTrack];
        let stream = await requestStream(
            current,
            current.formatedPlatforms,
            this.options.manager,
        );
        if (this.modes.filters.length) {
        } else {
            resource = createAudioResource(stream, {
                inlineVolume: true,
                inputType: StreamType.Arbitrary,
            });
            this.currentResource = resource;
        }
        this.player.play(resource);
    }
    async _loopQueue() {
        if (this.modes.currentTrack >= this.queue.length) {
            this.modes.currentTrack = 0;
        } else {
            this.modes.currentTrack++;
        }
        await this.play();
    }
    async _playNext() {
        this.modes.currentTrack += 1;
        if (this.options.type === "default") {
            if (this.modes.currentTrack > 1) {
                this.queue.shift();
            }
        } else if (this.options.type === "fonly") {
            this.queue.shift();
        }
        await this.play();
    }
    _destroy() {
        this.modes = this.defaultMode();
        this.queue = [];
    }
    _configPlayer(): void {
        this.player.on("stateChange", async (os, ns) => {
            if (
                os.status !== AudioPlayerStatus.Idle &&
                ns.status === AudioPlayerStatus.Idle
            ) {
                if (this.modes.paused) {
                } else if (
                    this.modes.loop === LoopMode.Track &&
                    this.queue[this.modes.currentTrack]
                ) {
                    this.options.manager.emit(
                        PlayerEvents.TRACK_END,
                        this.queue[this.modes.currentTrack],
                    );
                    await this.play();
                } else if (
                    this.modes.loop === LoopMode.Queue &&
                    this.queue.length
                ) {
                    this.options.manager.emit(
                        PlayerEvents.TRACK_END,
                        this.queue[this.modes.currentTrack],
                    );
                    await this._loopQueue();
                } else if (
                    this.modes.autoPlay != "none" &&
                    this.queue.length === 1
                ) {
                    this.options.manager.emit(
                        PlayerEvents.TRACK_END,
                        this.queue[this.modes.currentTrack],
                    );
                    // this._autoPlay();
                } else if (
                    this.queue.length > 1 &&
                    this.modes.currentTrack < this.queue.length - 1
                ) {
                    this.options.manager.emit(
                        PlayerEvents.TRACK_END,
                        this.queue[this.modes.currentTrack],
                    );
                    await this._playNext();
                } else {
                    this.options.manager.emit(
                        PlayerEvents.TRACK_END,
                        this.queue[this.modes.currentTrack],
                    );
                    this.options.manager.emit(PlayerEvents.QUEUE_END);
                    this._destroy();
                }
            }
            if (
                os.status === AudioPlayerStatus.Playing &&
                ns.status !== AudioPlayerStatus.Playing &&
                ns.status !== AudioPlayerStatus.Idle &&
                ns.status !== AudioPlayerStatus.Paused
            ) {
                this.options.manager.emit(
                    PlayerEvents.TRACK_END,
                    this.queue[this.modes.currentTrack],
                );
            }
        });
        this.player.on("error", async (error: any) => {
            this.options.manager.emit(PlayerEvents.AUDIO_ERROR, error);
        });

        if (this.options.manager.configs?.devOptions?.debug) {
            this.player.on("debug", (msg) =>
                this.options.manager.configs?.devOptions?.debug
                    ? console.log(msg)
                    : undefined,
            );
        }

        this.options.connection.subscribe(this.player);
    }
    async add(track: string[], type: PlatformType, member: GuildMember) {
        for (let i = 0; i < track.length; i++) {
            if (type === PlatformType.Youtube) {
                const id = track[i].split("?v=").pop();
                const info = await requestInfo(
                    id,
                    "Youtube",
                    this.options.manager,
                );
                this.queue.push(info);
                if (this.queue.length === 1) {
                    await this.play();
                }
            } else if (type === PlatformType.SoundCloud) {
            } else if (type === PlatformType.LocalFile) {
                const info = await requestInfo(
                    track[i],
                    "LocalFile",
                    this.options.manager,
                );
                this.queue.push(info);
                if (this.queue.length === 1) {
                    await this.play();
                }
            } else if (type === PlatformType.Spotify) {
                const info = await requestInfo(
                    track[i],
                    "Spotify",
                    this.options.manager,
                );
                this.queue.push(info);
                if (this.queue.length === 1) {
                    await this.play();
                }
            }

            if (this.options.manager.configs.requestOptions?.offsetTimeout) {
                await setTimeout(
                    this.options.manager.configs.requestOptions?.offsetTimeout,
                );
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
    set volume(volume: number) {
        this.modes.volume = volume;
        this.currentResource.volume.setVolume(volume / 100);
    }
    get volume() {
        return this.modes.volume;
    }
    set loop(loop: LoopMode) {
        this.modes.loop = loop;
    }
    get loop() {
        return this.modes.loop;
    }
    set autoPlay(autoPlay: AutoPlay) {
        this.modes.autoPlay = autoPlay;
    }
    get autoPlay() {
        return this.modes.autoPlay;
    }
}
