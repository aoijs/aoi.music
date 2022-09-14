import { formatedPlatforms } from "./../newutils/constants";
import { TrackInfo } from "soundcloud-downloader/src/info";
import { PlatformType } from "./enums";
import { GuildMember } from "discord.js";
export type SoundCloudTrackInfo = {
    title: string;
    artist: string;
    artistURL: string;
    artistAvatar: string;
    duration: number;
    url: string;
    identifier: "soundcloud";
    views: number;
    likes: number;
    thumbnail: string;
    id: string;
    description: string;
    createdAt: Date | null;
    platformType: PlatformType;
    rawData: TrackInfo;
    formatedPlatforms: "SoundCloud";
    requester: GuildMember;
};
export type YoutubeTrackInfo = {
    title: string;
    channelId: string;
    artist: string;
    artistURL: string;
    duration: number;
    description: string;
    identifier: "youtube";
    url: string;
    views: number;
    likes: number;
    thumbnail: string;
    id: string;
    createdAt: Date | null;
    platformType: PlatformType;
    formatedPlatforms: "Youtube";
    requester: GuildMember;
};

export type LocalFileTrackInfo = {
    title: string;
    idetifier: "localfile";
    type: string;
    size: number;
    duration: number;
    url: string;
    likes: 0;
    views: 0;
    id: string;
    platformType: PlatformType;
    formatedPlatforms: "LocalFile";
    requester: GuildMember;
};

export type UrlTrackInfo = {
    title: string;
    idetifier: "url";
    type: string;
    size: number;
    duration: number;
    url: string;
    likes: 0;
    views: 0;
    id: string;
    platformType: PlatformType;
    formatedPlatforms: "Url";
    requester: GuildMember;
};
export type SpotifyTrackInfo = {
    title: string;
    artist: string;
    duration: number;
    description: string;
    identifier: "spotify";
    url: string;
    views: number;
    likes: number;
    thumbnail: string;
    id: string;
    createdAt: Date | null;
    platformType: PlatformType;
    formatedPlatforms: "Spotify";
    requester: GuildMember;
};
export type Track<type extends keyof typeof PlatformType> =
    type extends "SoundCloud"
        ? SoundCloudTrackInfo
        : type extends "LocalFile"
        ? LocalFileTrackInfo
        : type extends "Url"
        ? UrlTrackInfo
        : type extends "Youtube"
        ? YoutubeTrackInfo
        : SpotifyTrackInfo;
