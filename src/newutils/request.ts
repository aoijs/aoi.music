import { formatedPlatforms } from "./constants";
import { Manager } from "./../newstruct/manager";
import { createReadStream, createWriteStream } from "fs";
import scdl from "soundcloud-downloader";
import { request } from "undici";
import { PlatformType } from "./../typings/enums";
import { ThreadAutoArchiveDuration } from "discord.js";
import getAudioDurationInSeconds from "get-audio-duration";
import path from "path";
import { stat } from "fs/promises";
import { TrackInfo } from "soundcloud-downloader/src/info";
import { url } from "inspector";
import { LocalFileTrackInfo, Track, UrlTrackInfo } from "../typings/types";
import { PassThrough } from "stream";
import VideoInfo from "youtubei.js/dist/src/parser/youtube/VideoInfo";
import { SpotifyTrackInfo as SpotifyInfo } from "../typings/types";
import Video from "youtubei.js/dist/src/parser/classes/Video";

export async function generateInfo<T extends "LocalFile" | "Url">(
    id: string,
    type: T,
): Promise<Track<T>> {
    if (type !== "Url" && type !== "LocalFile") {
        throw new Error(`Invalid PlatformType Provided!`);
    } else if (type === "Url") {
        const array = id.split("/");
        const title = array.pop().split("?")[0];
        const reqData = await request(id);
        let filetype = reqData.headers["content-type"]?.split("/") ?? [];
        const ftype = filetype.length
            ? filetype.length > 1
                ? filetype[1]
                : filetype[0]
            : null;
        let size = Number(reqData.headers["content-length"]);
        if (isNaN(size)) size = (await reqData.body.blob()).size;
        const duration = await getAudioDurationInSeconds(id);
        return <Track<T>>{
            title,
            idetifier: "url",
            type: ftype,
            size,
            duration: duration * 1000,
            url: id,
            likes: 0,
            views: 0,
            id: id,
            platformType: PlatformType.Url,
            formatedPlatforms: formatedPlatforms[PlatformType.Url],
        };
    } else {
        const array = id.split(path.sep);
        const title = array.pop();
        const filetype = title.split(".")[1] ?? "N/A";
        const size = (await stat(id)).size;
        const duration = (await getAudioDurationInSeconds(id)) * 1000;
        return <Track<T>>{
            title,
            idetifier: "localfile",
            type: filetype,
            size,
            duration,
            url: id,
            likes: 0,
            views: 0,
            id: id,
            platformType: PlatformType.LocalFile,
            formatedPlatforms: formatedPlatforms[PlatformType.LocalFile],
        };
    }
}

export async function requestInfo<T extends keyof typeof PlatformType>(
    id: string,
    type: T,
    manager: Manager,
): Promise<Track<T> | Track<T>[]> {
    if (type === "SoundCloud") {
        const sc = manager.platforms.soundcloud;
        if (id.split("/")[4] === "sets") {
            const setinfo = await sc.getSetInfo(id);
            return <Track<T>[]>(setinfo.tracks.map((scData) => {
                return {
                    title: scData.title,
                    artist: scData.user.username,
                    artistURL: scData.user.permalink_url,
                    artistAvatar: scData.user.avatar_url,
                    duration: scData.duration,
                    url: scData.permalink_url,
                    identifier: "soundcloud",
                    views: scData.playback_count,
                    likes: scData.likes_count,
                    thumbnail: scData.artwork_url?.replace(
                        "-large.jpg",
                        "-t500x500.jpg",
                    ),
                    id: scData.permalink_url,
                    description: scData.description,
                    createdAt: new Date(scData.created_at) ?? null,
                    platformType: PlatformType.SoundCloud,
                    formatedPlatforms:
                        formatedPlatforms[PlatformType.SoundCloud],
                };
            }));
        } else if (id.split("/").pop() === "likes") {
            return <Track<T>[]>(
                await sc.getLikes({
                    limit: manager.configs.requestOptions
                        .soundcloudLikeTrackLimit,
                    profileUrl: id.split("/").slice(0, 4).join("/"),
                })
            ).collection.map( like=> {
                const scData = like.track;
                return {
                    title: scData.title,
                    artist: scData.user.username,
                    artistURL: scData.user.permalink_url,
                    artistAvatar: scData.user.avatar_url,
                    duration: scData.duration,
                    url: scData.permalink_url,
                    identifier: "soundcloud",
                    views: scData.playback_count,
                    likes: scData.likes_count,
                    thumbnail: scData.artwork_url?.replace(
                        "-large.jpg",
                        "-t500x500.jpg",
                    ),
                    id: scData.permalink_url,
                    description: scData.description,
                    createdAt: new Date(scData.created_at) ?? null,
                    platformType: PlatformType.SoundCloud,
                    formatedPlatforms:
                        formatedPlatforms[PlatformType.SoundCloud],
                };
            });
        } else {
            const scData: TrackInfo | undefined = await scdl
                .getInfo(id)
                .catch((_) => undefined);
            if (!scData) return;
            return <Track<T>[]>[{
                title: scData.title,
                artist: scData.user.username,
                artistURL: scData.user.permalink_url,
                artistAvatar: scData.user.avatar_url,
                duration: scData.duration,
                url: scData.permalink_url,
                identifier: "soundcloud",
                views: scData.playback_count,
                likes: scData.likes_count,
                thumbnail: scData.artwork_url?.replace(
                    "-large.jpg",
                    "-t500x500.jpg",
                ),
                id: scData.permalink_url,
                description: scData.description,
                createdAt: new Date(scData.created_at) ?? null,
                platformType: PlatformType.SoundCloud,
                formatedPlatforms: formatedPlatforms[PlatformType.SoundCloud],
            }];
        }
    } else if (type === "LocalFile" || type === "Url") {
        return <Track<T>>(<unknown>generateInfo(id, type));
    } else if (type === "Youtube") {
        const ytData: VideoInfo = await (await manager.platforms.youtube)
            .getBasicInfo(
                id,
                manager.configs.searchOptions.youtubeClient ?? "WEB",
            )
            .catch((_) => undefined);
        if (!ytData) return;
        return <Track<T>>{
            title: ytData.basic_info.title,
            channelId: ytData.basic_info.channel_id,
            artist: ytData.basic_info.channel.name,
            artistURL: ytData.basic_info.channel.url,
            duration: ytData.basic_info.duration * 1000,
            description: ytData.basic_info.short_description,
            identifier: "youtube",
            url: `https://youtube.com/watch?v=${ytData.basic_info.id}`,
            views: ytData.basic_info.view_count,
            likes: ytData.basic_info.like_count,
            thumbnail: ytData.basic_info.thumbnail[0].url,
            id: ytData.basic_info.id,
            createdAt: null,
            platformType: PlatformType.Youtube,
            formatedPlatforms: formatedPlatforms[PlatformType.Youtube],
        };
    } else if (type === "Spotify") {
        const spotify = manager.platforms.spotify;
        const data = await spotify.getData(id);
        switch (data.type) {
            case "track":
                return <Track<T>>(<unknown>{
                    title: data.name,
                    artist: data.artists
                        .map((a: { name: any }) => a.name)
                        .join(", "),
                    duration: data.duration,
                    preview: data.audioPreview.url,
                    url: data.external_urls.spotify,
                    identifier: "spotify",
                    views: 0,
                    likes: 0,
                    thumbnail: data.coverArt.sources[0].url,
                    spotifyId: data.id,
                    id: null,
                    description: null,
                    createdAt: new Date(data.releaseDate.isoString) ?? null,
                    platformType: PlatformType.Spotify,
                    formatedPlatforms: formatedPlatforms[PlatformType.Spotify],
                });
            case "playlist":
                return data.tracks.items.map((x: any) => {
                    x = x.track;
                    return <Track<T>>(<unknown>{
                        title: x.name,
                        artist: x.artists
                            .map((a: { name: any }) => a.name)
                            .join(", "),
                        duration: x.duration_ms,
                        preview: x.preview_url,
                        url: x.external_urls.spotify,
                        identifier: "spotify",
                        views: 0,
                        likes: 0,
                        thumbnail: x.album.images[0]?.url,
                        spotifyId: x.id,
                        id: null,
                        description: null,
                        createdAt: new Date(x.releaseDate?.isoString) ?? null,
                        platformType: PlatformType.Spotify,
                        formatedPlatforms:
                            formatedPlatforms[PlatformType.Spotify],
                    });
                });
            case "album":
                return data.tracks.items.map((x: any) => {
                    return <Track<T>>(<unknown>{
                        title: x.name,
                        artist: x.artists
                            .map((a: { name: any }) => a.name)
                            .join(", "),
                        duration: x.duration_ms,
                        preview: x.preview_url,
                        url: x.external_urls.spotify,
                        identifier: "spotify",
                        views: 0,
                        likes: 0,
                        thumbnail: data.images[0]?.url,
                        spotifyId: x.id,
                        id: null,
                        description: null,
                        createdAt: new Date(x.releaseDate?.isoString) ?? null,
                        platformType: PlatformType.Spotify,
                        formatedPlatforms:
                            formatedPlatforms[PlatformType.Spotify],
                    });
                });
            case "artist":
                return data.tracks.map((x: any) => {
                    return <Track<T>>(<unknown>{
                        title: x.name,
                        artist: x.artists
                            .map((a: { name: any }) => a.name)
                            .join(", "),
                        duration: x.duration_ms,
                        preview: x.preview_url,
                        url: x.external_urls.spotify,
                        identifier: "spotify",
                        views: 0,
                        likes: 0,
                        thumbnail: x.album.images[0].url,
                        spotifyId: x.id,
                        id: null,
                        description: null,
                        createdAt: new Date(x.releaseDate?.isoString) ?? null,
                        platformType: PlatformType.Spotify,
                        formatedPlatforms:
                            formatedPlatforms[PlatformType.Spotify],
                    });
                });
        }
    }
}

export async function requestStream<T extends keyof typeof PlatformType>(
    track: Track<T>,
    type: T,
    manager: Manager,
) {
    if (type === "SoundCloud") {
        return scdl.download(track.id).catch((e) => {
            console.error(
                "Failed to download track from SoundCloud With Reason: " + e,
            );
            return undefined;
        });
    } else if (type === "LocalFile") {
        return createReadStream(track.id);
    } else if (type === "Url") {
        return (await (await request(track.id)).body.blob()).stream();
    } else if (type === "Youtube") {
        const yt = await manager.platforms.youtube;
        return yt.download(track.id);
    } else if (type === "Spotify") {
        const yt = await manager.platforms.youtube;
        if (!track.id) {
            const data = await yt.search(
                `${track.title} ${(<SpotifyInfo>(<unknown>track)).artist}`,
                {
                    type: "video",
                },
            );
            track.id = data.videos.as(Video)[0].id;
            return yt.download(track.id, {
                client: manager.configs.searchOptions.youtubeClient ?? "WEB",
                quality: "best",
            });
        } else {
            return yt.download(track.id, {
                client: manager.configs.searchOptions.youtubeClient ?? "WEB",
                quality: "best",
            });
        }
    }
}
