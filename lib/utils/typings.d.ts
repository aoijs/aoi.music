/// <reference types="node" />
import { VoiceConnection } from "@discordjs/voice";
import { NewsChannel, TextChannel, ThreadChannel, VoiceChannel } from "discord.js";
import { CacheType, LoopMode, PlayerEvents } from "./constants";
import * as internal from "stream";
import { ReadStream } from "fs";
import { TrackInfo } from "soundcloud-downloader/src/info";
import Manager from "../structures/Manager";
import { YoutubeVideo } from "youtube-scrapper";
import Track from "../structures/Track";
export declare type PossibleStream = internal.Readable | internal.PassThrough | ReadStream;
export declare type RawTrackTypes = TrackInfo | LocalResponse;
export interface LocalResponse {
    url: string;
    is_m3u8: boolean;
    content_length: number;
}
export interface TwitchOptions {
    clientId: string;
}
export interface SoundcloudOptions {
    clientId: string;
}
export interface CacheOptions {
    enabled: boolean;
    cacheType: CacheType;
    limit?: number;
    directory?: string;
}
export interface SoundcloudOptions {
    clientId: string;
}
export interface ManagerConfig {
    cache?: CacheOptions;
    soundcloud?: SoundcloudOptions;
    youtube?: YoutubeOptions;
}
export interface voiceState {
    text: TextChannel;
    channel: VoiceChannel;
    connection: VoiceConnection;
}
export interface ManagerEvents {
    [PlayerEvents.TRACK_START](Track: Track, textChannel: TextChannel | NewsChannel | ThreadChannel): this;
    [PlayerEvents.TRACK_END](track: Track, textChannel: TextChannel | NewsChannel | ThreadChannel): this;
    [PlayerEvents.QUEUE_START](urls: string[], textChannel: TextChannel | NewsChannel | ThreadChannel): this;
    [PlayerEvents.QUEUE_END](textChannel: TextChannel | NewsChannel | ThreadChannel): this;
    [PlayerEvents.AUDIO_ERROR](error: any, textChannel: TextChannel | NewsChannel | ThreadChannel): this;
    [PlayerEvents.TRACK_RESUME](): this;
    [PlayerEvents.TRACK_PAUSE](): this;
}
export declare type LocalStreamType = Promise<ReadStream>;
export declare type LocalInfoType = {
    title?: string;
    description?: "A Local File";
    path?: string;
    dir: string;
    createdTimestamp: number;
    [keys: string]: any;
};
export declare type AttachmentInfoType = {
    title: string;
    description: string;
    url: string;
    [keys: string]: any;
};
export declare type AttachmentStreamType = Promise<ReadStream>;
export declare type PlayerOptions = {
    voiceChannel: VoiceChannel;
    textChannel: TextChannel;
    connection: VoiceConnection;
    manager: Manager;
    debug: boolean;
};
export declare type TrackInfoType = {
    title?: string;
    description?: string;
    url?: string;
    identifier?: string;
    raw_duration?: number;
    duration?: number;
    thumbnail?: string;
    author?: string;
    authorURL?: string;
    authorAvatar?: string;
    likes?: number;
    views?: number;
    path?: string;
    dir?: string;
    createdTimestamp?: number;
};
export interface SCTrackInfo extends TrackInfo {
    [key: string]: any;
}
export interface YTRawInfo extends YoutubeVideo {
    [key: string]: any;
}
export declare type TrackRawInfo = SCTrackInfo | LocalInfoType | AttachmentInfoType | YTRawInfo;
export declare type PlayerOptionsData = {
    paused: boolean;
    mode: LoopMode.None | LoopMode.Queue | LoopMode.Track;
    volume: number;
    leaveAfter: {
        enabled: boolean;
        time: number;
    };
    leaveWhenVcEmpty: boolean;
    autoPlay?: AutoPlayType;
    seekWhenFilter?: boolean;
};
export declare type AutoPlayType = "relative" | "youtube" | "soundcloud";
export interface YoutubeOptions {
    fetchAuthor?: boolean;
}
