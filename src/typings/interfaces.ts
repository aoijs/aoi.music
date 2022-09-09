import { Snowflake } from "discord.js";
import { Manager } from "./../newstruct/manager";
import { VoiceConnection } from "@discordjs/voice";
import { AutoPlay, LoopMode, PlayerEvents } from "./enums";
import { PathLike } from "fs";
export interface ManagerConfigurations
{
    devOptions?: {
        debug: boolean;
    };
    searchOptions?: {
        soundcloudClientId?: string;
        youtubeCookie?: string;
        youtubeAuth?: PathLike;
        youtubegl?: string;
        youtubeClient?: "WEB" | "ANDROID" | "YTMUSIC"
    };
    requestOptions?: {
        offsetTimeout?: number;
        soundcloudLikeTrackLimit?: number;
        youtubePlaylistLimit?: number;
        spotifyPlaylistLimit?: number;
    };
}

export interface AudioPLayerOptions
{
    type: "default" | "fonly" | "bidirect";
    connection: VoiceConnection;
    manager: Manager;
    voiceChannel: Snowflake;
    debug: boolean;
}

export interface AudioPlayerMode
{
    filters: string[];
    autoPlay: AutoPlay;
    loop: LoopMode;
    filterFromStart: boolean;
    shuffled: boolean;
    paused: boolean;
    volume: number;
    currentTrack: number;
}
export interface ManagerEvents
{
    [ PlayerEvents.TRACK_START ] ( Track: any ): this;
    [ PlayerEvents.TRACK_END ] ( track: any ): this;
    [ PlayerEvents.QUEUE_START ] ( urls: unknown[] ): this;
    [ PlayerEvents.QUEUE_END ] (): this;
    [ PlayerEvents.AUDIO_ERROR ] ( error: any ): this;
    [ PlayerEvents.TRACK_RESUME ] (): this;
    [ PlayerEvents.TRACK_PAUSE ] (): this;
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
    contents: Record<
        "playlistPanelVideoRenderer",
        YoutubeMixPLaylistPanelVideoRenderData
    >[];
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
