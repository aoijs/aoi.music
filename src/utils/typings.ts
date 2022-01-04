import { VoiceConnection } from "@discordjs/voice";
import {
  NewsChannel,
  TextChannel,
  ThreadChannel,
  VoiceChannel,
} from "discord.js";
import { CacheType, LoopMode, PlayerEvents } from "./constants";
import internal from "stream";
import { ReadStream } from "fs";
import { TrackInfo } from "soundcloud-downloader/src/info";
import Manager from "../structures/Manager";
import { YoutubeVideo, YoutubeVideoDetails } from "youtube-scrapper";
import Track from "../structures/Track";
export type PossibleStream =
  | internal.Readable
  | internal.PassThrough
  | ReadStream;
export type RawTrackTypes = TrackInfo | LocalResponse;

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
}

export interface voiceState {
  text: TextChannel;
  channel: VoiceChannel;
  connection: VoiceConnection;
}

export interface ManagerEvents {
  [PlayerEvents.TRACK_START](
    Track: Track,
    textChannel: TextChannel | NewsChannel | ThreadChannel,
  ): this;
  [PlayerEvents.TRACK_END](
    track: Track,
    textChannel: TextChannel | NewsChannel | ThreadChannel,
  ): this;
  [PlayerEvents.QUEUE_START](
    Track: Track,
    textChannel: TextChannel | NewsChannel | ThreadChannel,
  ): this;
  [PlayerEvents.QUEUE_END](
    Track: Track,
    textChannel: TextChannel | NewsChannel | ThreadChannel,
  ): this;
  [PlayerEvents.AUDIO_ERROR](error : any):this;
  [PlayerEvents.TRACK_RESUME]():this;
  [PlayerEvents.TRACK_PAUSE](): this ; 
}

export type LocalStreamType = Promise<ReadStream>;

export type LocalInfoType = {
  title?: string;
  description?: "A Local File";
  path?: string;
  dir: string;
  createdTimestamp: number;
  [keys: string]: any;
};

export type AttachmentInfoType = {
  title: string;
  description: string;
  url: string;
  [keys: string]: any;
};

export type AttachmentStreamType = Promise<ReadStream>;

export type PlayerOptions = {
  voiceChannel: VoiceChannel;
  textChannel: TextChannel;
  connection: VoiceConnection;
  manager: Manager;
  debug: boolean;
};

export type TrackInfoType = {
  title?: string;
  description?: string;
  url?: string;
  identifier?: string;
  raw_duration?: number;
  duration?: string;
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

interface SCTrackInfo extends TrackInfo {
  [key: string]: any;
}
interface YTRawInfo extends YoutubeVideo {
  [key: string]: any;
}
export type TrackRawInfo =
  | SCTrackInfo
  | LocalInfoType
  | AttachmentInfoType
  | YTRawInfo;

export type PlayerOptionsData = {
  paused: boolean;
  mode: LoopMode;
  volume: number;
  leaveAfter: { enabled: boolean; time: number };
  leaveWhenVcEmpty: boolean;
  autoPlay?: AutoPlayType;
};
export type AutoPlayType = "relative" | "youtube" | "soundcloud";
