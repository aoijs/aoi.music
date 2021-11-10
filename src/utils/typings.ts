import  { VoiceConnection } from '@discordjs/voice';
import { TextChannel, VoiceChannel } from 'discord.js';
import { CacheType, LoopMode } from './constants';
import * as Source from './source/index';
import internal from 'stream';
import { ReadStream } from 'fs';
import { TrackInfo } from 'soundcloud-downloader/src/info';
import Manager from '../structures/Manager';
export type PossibleStream = internal.Readable | internal.PassThrough | ReadStream;
export type RawTrackTypes = TrackInfo | LocalResponse;

export interface LocalResponse {
    url: string;
    is_m3u8: boolean;
    content_length: number;
}

export interface ManagerProviders {
    twitch: Source.TwitchProvider;
    soundcloud: Source.SoundcloudProvider;
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
}

export interface voiceState {
    text: TextChannel;
    channel: VoiceChannel;
    connection: VoiceConnection;
}

export interface ManagerEvents extends PlayerEvents {

}

export interface PlayerEvents {
    trackStart(): any,
    trackEnd(): any,
    queueEnd(): any,
    error(): any
}

export type LocalStreamType = Promise<ReadStream>

export type LocalInfoType = {
    title?: string;
    description?: 'A Local File';
    path?: string;
    dir: string;
    createdTimestamp : number;
    [keys : string ] : any;
}

export type AttachmentInfoType = {
    title: string;
    description: string;
    url: string;
    [keys : string ] : any;
}

export type AttachmentStreamType = Promise<ReadStream>

export type PlayerOptions = {
    voiceChannel : VoiceChannel;
    textChannel : TextChannel;
    connection : VoiceConnection;
    manager : Manager;
    debug : boolean;
}

export type TrackInfoType = {
    title? : string;
    description? : string;
    url?: string;
    identifier?: string;
    raw_duration?: number;
    duration?: string;
    thumbnail?: string;
    author?: string;
    authorURL?: string;
    authorAvatar?: string;
    likes? : number;
    views? : number;
    path? : string;
    dir? : string;
    createdTimestamp? : number;
}

interface SCTrackInfo extends TrackInfo {
    [key : string] : any;
}
export type TrackRawInfo = SCTrackInfo | LocalInfoType | AttachmentInfoType

export type PlayerOptionsData = {
            paused:boolean,
            mode : LoopMode,
            volume:number,
            leaveAfter:{enabled:boolean,time:number},
            leaveWhenVcEmpty:boolean 
}