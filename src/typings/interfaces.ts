import { Snowflake } from "discord.js";
import { Manager } from "./../newstruct/manager";
import { VoiceConnection } from "@discordjs/voice";
import { AutoPlay, LoopMode, PlayerEvents } from "./enums";
import { AudioPlayer } from "../newstruct/audioPlayer";
import { Track, SpotifyTrackInfo, YoutubeTrackInfo, LocalFileTrackInfo, SoundCloudTrackInfo, UrlTrackInfo } from "./types";

export interface ManagerConfigurations {
    devOptions?: {
        debug: boolean;
    };
    searchOptions?: {
        spotifyAuth: any;
        soundcloudClientId?: string;
        youtubeCookie?: string;
        youtubeAuth?: boolean;
        youtubegl?: string;
        youtubeClient?: "WEB" | "ANDROID" | "YTMUSIC_ANDROID" | "YTMUSIC" | "YTSTUDIO_ANDROID" | "TV_EMBEDDED";
        youtubeToken?: boolean;
    };
    requestOptions?: {
        offsetTimeout?: number;
        soundcloudLikeTrackLimit?: number;
        youtubePlaylistLimit?: number;
        spotifyPlaylistLimit?: number;
    };
}

export interface Credentials {
    visitorData: string;
    poToken: string;
    access_token?: string;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
    expiry_date?: string;
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
    filtering: boolean;
    seeked?: boolean;
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
    [PlayerEvents.TrackStart](track: Track<"LocalFile" | "SoundCloud" | "Spotify" | "Url" | "Youtube">, player: AudioPlayer): this;
    [PlayerEvents.TrackEnd](track: Track<"LocalFile" | "SoundCloud" | "Spotify" | "Url" | "Youtube">, player: AudioPlayer): this;
    [PlayerEvents.TrackAdd](track: SpotifyTrackInfo | YoutubeTrackInfo | LocalFileTrackInfo | SoundCloudTrackInfo | UrlTrackInfo, player: AudioPlayer): this;
    [PlayerEvents.QueueStart](urls: unknown[], player: AudioPlayer): this;
    [PlayerEvents.QueueEnd](player: AudioPlayer): this;
    [PlayerEvents.AudioError](error: any, player: AudioPlayer): this;
    [PlayerEvents.TrackResume](player: AudioPlayer): this;
    [PlayerEvents.TrackPause](player: AudioPlayer): this;
}

export interface rawYoutubeMixData {
    contents: {
        twoColumnWatchNextResults: {
            results: Record<string, unknown>;
            secondaryResults: Record<string, unknown>;
            playlist: { playlist: YoutubeMixPlaylistData };
        };
    };
}
export interface YoutubeMixPlaylistData {
    title: string;
    contents: Record<"playlistPanelVideoRenderer", YoutubeMixPLaylistPanelVideoRenderData>[];
    playlistId: string;
    isInfinite: boolean;
    playlistShareUrl: string;
    ownerName: { simpleText: string };
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
    indexText: { simpleText: string };
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
        thumbnails: { url: string; height: number; width: number }[];
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

export interface CacherMemoryConfig {
    limit: number;
}

export interface CacheDiskConfig {
    path: string;
    limit: number;
}

export type CacheConfig<T extends "memory" | "disk"> = T extends "memory" ? CacherMemoryConfig : CacheDiskConfig;

export interface FilterConfig {
    filterFromStart: boolean;
}
