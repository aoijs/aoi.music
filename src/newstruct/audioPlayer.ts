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
    PluginName,
} from "./../typings/enums";
import { AudioPlayerMode, AudioPLayerOptions } from "./../typings/interfaces";
import { requestInfo, requestStream } from "../newutils/request";
import {
    LocalFileTrackInfo,
    Plugin,
    SoundCloudTrackInfo,
    SpotifyTrackInfo,
    Track,
    UrlTrackInfo,
    YoutubeTrackInfo,
} from "../typings/types";
import { GuildMember } from "discord.js";
import { setTimeout } from "timers/promises";
import { formatedPlatforms } from "../newutils/constants";
import { search } from "../newutils/search";
import Video from "youtubei.js/dist/src/parser/classes/Video";
import { shuffle } from "../newutils/helpers";
import { Filter } from "./filter";
import { PassThrough, Readable } from "stream";
import { ReadableStream } from "stream/web";
import { FFmpeg } from "prism-media";
export class AudioPlayer {
    options: AudioPLayerOptions;
    #modes: AudioPlayerMode;
    queue: Track<keyof typeof PlatformType>[];
    player: AP;
    constructor(options: AudioPLayerOptions) {
        this.options = options;
        this.#modes = this.defaultMode();
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
            ytMix: {
                enabled: false,
                lastUrl: null,
            },
        };
    }

    async play() {
        let resource: AudioResource;
        const current = this.queue[this.#modes.currentTrack];
        let stream = await requestStream(
            current,
            current.formatedPlatforms,
            this.options.manager,
        );
        if (this.options.manager.plugins.has(PluginName.Cacher)) {
            const Cacher = <Plugin<PluginName.Cacher>>(
                this.options.manager.plugins.get(PluginName.Cacher)
            );
            Cacher.write(current, stream);
        }
        let s: string | Readable | FFmpeg;
        if (
            this.options.manager.plugins.has(PluginName.Filter) &&
            this.#modes.filters.length
        ) {
            const f = <Filter>(
                this.options.manager.plugins.get(PluginName.Filter)
            );
            const ffmpeg = f.createFFmpeg("-af", this.filters.join(","));
            s = stream.pipe(ffmpeg);
        } else {
            s = stream;
        }
        resource = createAudioResource(s, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary,
        });
        this.options.manager.emit(PlayerEvents.TRACK_START, current,this);
        this.player.play(resource);
        if (this.#modes.ytMix) {
            if (
                this.queue[this.#modes.currentTrack].id ===
                this.#modes.ytMix.lastUrl
            ) {
                const tracks = <Video[]>(
                    await this.options.manager.search(
                        PlatformType.Youtube,
                        this.queue[this.#modes.currentTrack].id,
                        3,
                    )
                );
                await this.add(
                    tracks.map(
                        (x) => `https://www.youtube.com/watch?v=${x.id}`,
                    ),
                    PlatformType.Youtube,
                    this.queue[this.#modes.currentTrack].requester,
                );
            }
        }
    }
    async _loopQueue() {
        if (this.#modes.currentTrack >= this.queue.length) {
            this.#modes.currentTrack = 0;
        } else {
            this.#modes.currentTrack++;
        }
        await this.play();
    }
    async _playNext() {
        if (this.options.type === "default") {
            if (this.#modes.currentTrack >= 1) {
                this.queue.shift();
            } else {
                this.#modes.currentTrack += 1;
            }
        } else if (this.options.type === "fonly") {
            this.queue.shift();
        } else {
            this.#modes.currentTrack += 1;
        }
        await this.play();
    }
    _destroy() {
        this.#modes = this.defaultMode();
        this.queue = [];
    }
    _configPlayer(): void {
        this.player.on("stateChange", async (os, ns) => {
            if (
                os.status !== AudioPlayerStatus.Idle &&
                ns.status === AudioPlayerStatus.Idle
            ) {
                if (this.#modes.paused) {
                } else if (
                    this.#modes.loop === LoopMode.Track &&
                    this.queue[this.#modes.currentTrack]
                ) {
                    this.options.manager.emit(
                        PlayerEvents.TRACK_END,
                        this.queue[this.#modes.currentTrack],
                        this,
                    );
                    await this.play();
                } else if (
                    this.#modes.loop === LoopMode.Queue &&
                    this.queue.length
                ) {
                    this.options.manager.emit(
                        PlayerEvents.TRACK_END,
                        this.queue[this.#modes.currentTrack],
                        this,
                    );
                    await this._loopQueue();
                } else if (
                    this.#modes.autoPlay != "none" &&
                    this.queue.length === 1
                ) {
                    this.options.manager.emit(
                        PlayerEvents.TRACK_END,
                        this.queue[this.#modes.currentTrack],
                        this,
                    );
                    // this._autoPlay();
                } else if (
                    this.queue.length > 1 &&
                    this.#modes.currentTrack < this.queue.length - 1
                ) {
                    this.options.manager.emit(
                        PlayerEvents.TRACK_END,
                        this.queue[this.#modes.currentTrack],
                        this,
                    );
                    await this._playNext();
                } else {
                    this.options.manager.emit(
                        PlayerEvents.TRACK_END,
                        this.queue[this.#modes.currentTrack],
                        this,
                    );
                    this.options.manager.emit(PlayerEvents.QUEUE_END, this);
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
                    this.queue[this.#modes.currentTrack],
                    this,
                );
            }
        });
        this.player.on("error", async (error: any) => {
            this.options.manager.emit(PlayerEvents.AUDIO_ERROR, error, this);
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
                const id = track[i].split("?v=")[1].split("&")[0];
                if (
                    track[i].includes("&list=") &&
                    track[i].includes("&index=") &&
                    track.includes("watch?v=") &&
                    !this.#modes.ytMix.enabled
                ) {
                    this.#modes.ytMix.enabled = true;
                    this.#modes.ytMix.lastUrl = track[track.length - 1];
                }
                const info = await requestInfo(
                    id,
                    "Youtube",
                    this.options.manager,
                );
                if (!info) continue;
                this.queue.push({
                    ...(<YoutubeTrackInfo>info),
                    requester: member,
                    position: this.queue.length,
                });
                if (this.queue.length === 1) {
                    await this.play();
                }
            } else if (type === PlatformType.SoundCloud) {
                const info = await requestInfo(
                    track[i],
                    formatedPlatforms[PlatformType.SoundCloud],
                    this.options.manager,
                );

                if (!info) continue;
                for (let i = 0; i < (<SoundCloudTrackInfo[]>info).length; i++) {
                    this.queue.push({
                        ...(<SoundCloudTrackInfo>info[i]),
                        requester: member,
                        position: this.queue.length,
                    });
                    if (this.queue.length === 1) {
                        await this.play();
                    }
                }
            } else if (type === PlatformType.LocalFile) {
                const info = await requestInfo(
                    track[i],
                    "LocalFile",
                    this.options.manager,
                );
                if (!info) continue;
                this.queue.push({
                    ...(<LocalFileTrackInfo>info),
                    requester: member,
                    position: this.queue.length,
                });
                if (this.queue.length === 1) {
                    await this.play();
                }
            } else if (type === PlatformType.Spotify) {
                const info = <SpotifyTrackInfo[]>(
                    (<unknown>(
                        await requestInfo(
                            track[i],
                            "Spotify",
                            this.options.manager,
                        )
                    ))
                );
                if (!info) continue;
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
            } else if (type === PlatformType.Url) {
                const info = await requestInfo(
                    track[i],
                    formatedPlatforms[PlatformType.Url],
                    this.options.manager,
                );
                this.queue.push({
                    ...(<UrlTrackInfo>info),
                    requester: member,
                    position: this.queue.length,
                });
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
        return (this.#modes.paused = this.player.pause());
    }
    resume() {
        this.#modes.paused = false;
        return this.player.unpause();
    }
    set volume(volume: number) {
        this.#modes.volume = volume;
        //@ts-ignore
        this.player.state.resource.volume.setVolume(volume / 100);
    }
    get volume() {
        return this.#modes.volume;
    }
    set loop(loop: LoopMode) {
        this.#modes.loop = loop;
    }
    get loop() {
        return this.#modes.loop;
    }
    set autoPlay(autoPlay: AutoPlay) {
        this.#modes.autoPlay = autoPlay;
    }
    get autoPlay() {
        return this.#modes.autoPlay;
    }
    shuffle() {
        this.queue = shuffle(this.queue);
        this.#modes.shuffled = true;
    }
    unshuffle() {
        this.queue = this.queue.sort((a, b) => a.position - b.position);
        this.#modes.shuffled = false;
    }
    isShuffled() {
        return this.#modes.shuffled;
    }
    isPaused() {
        return this.#modes.paused;
    }
    isLoopEnabled() {
        return this.#modes.loop !== LoopMode.None;
    }
    isAutoPlayEnabled() {
        return this.#modes.autoPlay !== AutoPlay.None;
    }
    currentPosition() {
        return this.#modes.currentTrack;
    }
    getTrackCurrentDuration() {
        //@ts-ignore
        return <number>this.player.state.resource?.playbackDuration ?? 0;
    }
    get currentTrack() {
        return this.queue[this.#modes.currentTrack];
    }
    get previousTrack() {
        return this.queue[this.#modes.currentTrack - 1];
    }
    updateFilters(filterArr: string[]) {
        this.#modes.filters = filterArr;
    }
    get filters() {
        return [...this.#modes.filters];
    }
}
