/// <reference types="node" />
/// <reference types="node" />
import { Snowflake } from "discord.js";
import { Manager } from "./../newstruct/manager";
import { VoiceConnection } from "@discordjs/voice";
import { AutoPlay, LoopMode, PlayerEvents } from "./enums";
import { PathLike } from "fs";
import { AudioPlayer } from "../newstruct/audioPlayer";
import { Track } from "./types";
import { Readable } from "stream";
export interface ManagerConfigurations {
    devOptions?: {
        debug: boolean;
    };
    searchOptions?: {
        soundcloudClientId?: string;
        youtubeCookie?: string;
        youtubeAuth?: PathLike;
        youtubegl?: string;
        youtubeClient?: "WEB" | "ANDROID" | "YTMUSIC";
    };
    requestOptions?: {
        offsetTimeout?: number;
        soundcloudLikeTrackLimit?: number;
        youtubePlaylistLimit?: number;
        spotifyPlaylistLimit?: number;
    };
}
export interface AudioPLayerOptions {
    type: "default" | "fonly" | "bidirect";
    connection: VoiceConnection;
    manager: Manager;
    voiceChannel: Snowflake;
    debug: boolean;
}
export interface AudioPlayerMode {
    filters: string[];
    autoPlay: AutoPlay;
    loop: LoopMode;
    filterFromStart: boolean;
    shuffled: boolean;
    paused: boolean;
    volume: number;
    currentTrack: number;
    ytMix: {
        enabled: boolean;
        lastUrl: string | null;
    };
}
export interface ManagerEvents {
    [PlayerEvents.TRACK_START](Track: Track<"LocalFile" | "SoundCloud" | "Spotify" | "Url" | "Youtube">, player: AudioPlayer): this;
    [PlayerEvents.TRACK_END](track: Track<"LocalFile" | "SoundCloud" | "Spotify" | "Url" | "Youtube">, player: AudioPlayer): this;
    [PlayerEvents.QUEUE_START](urls: unknown[], player: AudioPlayer): this;
    [PlayerEvents.QUEUE_END](player: AudioPlayer): this;
    [PlayerEvents.AUDIO_ERROR](error: any, player: AudioPlayer): this;
    [PlayerEvents.TRACK_RESUME](player: AudioPlayer): this;
    [PlayerEvents.TRACK_PAUSE](player: AudioPlayer): this;
}
export interface rawYoutubeMixData {
    contents: {
        twoColumnWatchNextResults: {
            results: Record<string, unknown>;
            secondaryResults: Record<string, unknown>;
            playlist: {
                playlist: YoutubeMixPlaylistData;
            };
        };
    };
}
export interface YoutubeMixPlaylistData {
    title: string;
    contents: Record<"playlistPanelVideoRenderer", YoutubeMixPLaylistPanelVideoRenderData>[];
    playlistId: string;
    isInfinite: boolean;
    playlistShareUrl: string;
    ownerName: {
        simpleText: string;
    };
}
export interface YoutubeMixPLaylistPanelVideoRenderData {
    videoId: any;
    title: {
        accessibility: {
            accessibilityData: {
                label: string;
            };
        };
        simpleText: string;
    };
    longBylineText: {
        runs: Record<string, unknown>[];
    };
    thumbnail: {
        thumbnails: {
            url: string;
            height: number;
            width: number;
        }[];
    };
    lengthText: {
        simpleText: string;
        accessibility: {
            a: any;
            accessibilityData: {
                label: string;
            };
        };
    };
    indexText: {
        simpleText: string;
    };
    navigationEndpoint: {
        watchEndpoint: {
            videoId: string;
            playlistId: string;
            index: number;
        };
    };
}
export interface YoutubeRelatedData {
    playerOverlays: {
        playerOverlayRenderer: {
            endScreen: {
                watchNextEndScreenRenderer: {
                    results: {
                        endScreenVideoRenderer: EndScreenVideoRenderer;
                    }[];
                };
            };
        };
    };
}
export interface EndScreenVideoRenderer {
    videoId: string;
    thumbnail: {
        thumbnails: {
            url: string;
            height: number;
            width: number;
        }[];
        title: {
            accessibility: {
                accessibilityData: {
                    label: string;
                };
            };
            simpleText: string;
        };
        lengthText: {
            simpleText: string;
            accessibility: {
                accessibilityData: {
                    label: string;
                };
            };
        };
        lengthInSeconds: number;
    };
}
export interface CacherMemoryConfig<T extends "memory"> {
    type: T;
    map: Map<string, Readable | PathLike>;
    limit: number;
}
export interface CacheDiskConfig<T extends "disk"> {
    type: T;
    path: string;
    limit: number;
    map: Map<string, PathLike>;
}
export declare type CacheConfig<T extends "memory" | "disk"> = T extends "memory" ? CacherMemoryConfig<"memory"> : CacheDiskConfig<"disk">;
export interface FilterConfig {
    filterFromStart: boolean;
}
