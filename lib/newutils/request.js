"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestStream = exports.requestInfo = exports.generateScInfo = exports.generateInfo = void 0;
const constants_1 = require("./constants");
const fs_1 = require("fs");
const soundcloud_downloader_1 = __importDefault(require("soundcloud-downloader"));
const undici_1 = require("undici");
const enums_1 = require("./../typings/enums");
const get_audio_duration_1 = __importDefault(require("get-audio-duration"));
const path_1 = __importDefault(require("path"));
const promises_1 = require("fs/promises");
const stream_1 = require("stream");
const helpers_1 = require("./helpers");
async function generateInfo(id, type) {
    if (type !== "Url" && type !== "LocalFile") {
        throw new Error(`Invalid PlatformType Provided!`);
    }
    else if (type === "Url") {
        const array = id.split("/");
        const title = array.pop().split("?")[0];
        const reqData = await (0, undici_1.request)(id);
        let filetype = reqData.headers["content-type"]?.split("/") ?? [];
        const isLive = await (0, helpers_1.isLiveStreamUrl)(id);
        const ftype = filetype.length
            ? filetype.length > 1
                ? filetype[1]
                : filetype[0]
            : null;
        let size = Number(reqData.headers["content-length"]) ?? Infinity;
        if (isNaN(size) && !isLive)
            size = (await reqData.body.blob()).size;
        const duration = await (0, helpers_1.isLiveStreamUrl)(id) ? Infinity : await (0, get_audio_duration_1.default)(id);
        return {
            title,
            identifier: "url",
            type: ftype,
            size,
            duration: duration * 1000,
            url: id,
            likes: 0,
            views: 0,
            id: id,
            platformType: enums_1.PlatformType.Url,
            formatedPlatforms: constants_1.formatedPlatforms[enums_1.PlatformType.Url],
            isLiveContent: isLive,
        };
    }
    else {
        const array = id.split(path_1.default.sep);
        const title = array.pop();
        const filetype = title.split(".")[1] ?? "N/A";
        const size = (await (0, promises_1.stat)(id)).size;
        const duration = (await (0, get_audio_duration_1.default)(id)) * 1000;
        return {
            title,
            identifier: "localfile",
            type: filetype,
            size,
            duration,
            url: id,
            likes: 0,
            views: 0,
            id: id,
            platformType: enums_1.PlatformType.LocalFile,
            formatedPlatforms: constants_1.formatedPlatforms[enums_1.PlatformType.LocalFile],
        };
    }
}
exports.generateInfo = generateInfo;
function generateScInfo(scData) {
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
        thumbnail: scData.artwork_url?.replace("-large.jpg", "-t500x500.jpg"),
        //@ts-ignore
        scid: scData.id,
        id: scData.permalink_url,
        description: scData.description,
        createdAt: new Date(scData.created_at) ?? null,
        platformType: enums_1.PlatformType.SoundCloud,
        formatedPlatforms: constants_1.formatedPlatforms[enums_1.PlatformType.SoundCloud],
    };
}
exports.generateScInfo = generateScInfo;
async function requestInfo(id, type, manager) {
    if (type === "SoundCloud") {
        const sc = manager.platforms.soundcloud;
        if (id.split("/")[4] === "sets") {
            const setinfo = await sc.getSetInfo(id);
            return setinfo.tracks.map((scData) => {
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
                    thumbnail: scData.artwork_url?.replace("-large.jpg", "-t500x500.jpg"),
                    scid: scData.id,
                    id: scData.permalink_url,
                    description: scData.description,
                    createdAt: new Date(scData.created_at) ?? null,
                    platformType: enums_1.PlatformType.SoundCloud,
                    formatedPlatforms: constants_1.formatedPlatforms[enums_1.PlatformType.SoundCloud],
                };
            });
        }
        else if (id.split("/").pop() === "likes") {
            return (await sc.getLikes({
                limit: manager.configs.requestOptions
                    .soundcloudLikeTrackLimit,
                profileUrl: id.split("/").slice(0, 4).join("/"),
            })).collection.map((like) => {
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
                    thumbnail: scData.artwork_url?.replace("-large.jpg", "-t500x500.jpg"),
                    id: scData.permalink_url,
                    description: scData.description,
                    createdAt: new Date(scData.created_at) ?? null,
                    platformType: enums_1.PlatformType.SoundCloud,
                    formatedPlatforms: constants_1.formatedPlatforms[enums_1.PlatformType.SoundCloud],
                };
            });
        }
        else {
            const scData = await soundcloud_downloader_1.default
                .getInfo(id)
                .catch((_) => undefined);
            if (!scData)
                return;
            return [
                {
                    title: scData.title,
                    artist: scData.user.username,
                    artistURL: scData.user.permalink_url,
                    artistAvatar: scData.user.avatar_url,
                    duration: scData.duration,
                    url: scData.permalink_url,
                    identifier: "soundcloud",
                    views: scData.playback_count,
                    likes: scData.likes_count,
                    thumbnail: scData.artwork_url?.replace("-large.jpg", "-t500x500.jpg"),
                    id: scData.permalink_url,
                    description: scData.description,
                    createdAt: new Date(scData.created_at) ?? null,
                    platformType: enums_1.PlatformType.SoundCloud,
                    formatedPlatforms: constants_1.formatedPlatforms[enums_1.PlatformType.SoundCloud],
                },
            ];
        }
    }
    else if (type === "LocalFile" || type === "Url") {
        return generateInfo(id, type);
    }
    else if (type === "Youtube") {
        const ytData = await (await manager.platforms.youtube)
            .getBasicInfo(id, manager.configs.searchOptions.youtubeClient ?? "WEB")
            .catch((_) => undefined);
        if (!ytData)
            return;
        return {
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
            platformType: enums_1.PlatformType.Youtube,
            formatedPlatforms: constants_1.formatedPlatforms[enums_1.PlatformType.Youtube],
            isLiveContent: ytData.basic_info.is_live_content,
        };
    }
    else if (type === "Spotify") {
        const spotify = manager.platforms.spotify;
        const data = await spotify.getData(id);
        if (data.type === "track")
            return {
                title: data.name,
                artist: data.artists.map((a) => a.name).join(", "),
                duration: data.duration,
                preview: data.audioPreview?.url,
                url: `https://open.spotify.com/track/${data.id}`,
                identifier: "spotify",
                views: 0,
                likes: 0,
                thumbnail: data.coverArt.sources[0].url,
                spotifyId: data.id,
                id: null,
                description: null,
                createdAt: new Date(data.releaseDate.isoString) ?? null,
                platformType: enums_1.PlatformType.Spotify,
                formatedPlatforms: constants_1.formatedPlatforms[enums_1.PlatformType.Spotify],
            };
        else if (data.type === "playlist") {
            const res = [];
            for (let x of data.trackList) {
                x.id = x.id ?? x.uri.split(":").pop();
                const url = `https://open.spotify.com/track/${x.id}`;
                res.push({
                    title: x.title,
                    artist: x.subtitle,
                    duration: x.duration,
                    preview: x.audioPreview?.url,
                    url: url,
                    identifier: "spotify",
                    views: 0,
                    likes: 0,
                    thumbnail: null,
                    spotifyId: x.uri.split(":").pop(),
                    id: null,
                    description: null,
                    createdAt: null,
                    platformType: enums_1.PlatformType.Spotify,
                    formatedPlatforms: constants_1.formatedPlatforms[enums_1.PlatformType.Spotify],
                });
            }
            ;
            return res;
        }
        else if (data.type === "album") {
            const res = [];
            for (let x of data.trackList) {
                x.id = x.id ?? x.uri.split(":").pop();
                const url = `https://open.spotify.com/track/${x.id}`;
                x = await spotify.getData(url);
                res.push({
                    title: x.name,
                    artist: x.artists
                        .map((a) => a.name)
                        .join(", "),
                    duration: x.duration,
                    preview: x.audioPreview?.url,
                    url: url,
                    identifier: "spotify",
                    views: 0,
                    likes: 0,
                    thumbnail: x.coverArt.sources[0].url,
                    spotifyId: x.id,
                    id: null,
                    description: null,
                    createdAt: new Date(x.releaseDate.isoString) ?? null,
                    platformType: enums_1.PlatformType.Spotify,
                    formatedPlatforms: constants_1.formatedPlatforms[enums_1.PlatformType.Spotify],
                });
            }
            return res;
        }
        else if (data.type === "artist") {
            const res = [];
            for (let x of data.trackList) {
                x.id = x.id ?? x.uri.split(":").pop();
                const url = `https://open.spotify.com/track/${x.id}`;
                x = await spotify.getData(url);
                res.push({
                    title: x.name,
                    artist: x.artists
                        .map((a) => a.name)
                        .join(", "),
                    duration: x.duration,
                    preview: x.audioPreview?.url,
                    url: url,
                    identifier: "spotify",
                    views: 0,
                    likes: 0,
                    thumbnail: x.coverArt.sources[0].url,
                    spotifyId: x.id,
                    id: null,
                    description: null,
                    createdAt: new Date(x.releaseDate.isoString) ?? null,
                    platformType: enums_1.PlatformType.Spotify,
                    formatedPlatforms: constants_1.formatedPlatforms[enums_1.PlatformType.Spotify],
                });
            }
            return res;
        }
    }
}
exports.requestInfo = requestInfo;
async function requestStream(track, type, manager) {
    if (manager.plugins.has(enums_1.PluginName.Cacher) &&
        manager.plugins.get(enums_1.PluginName.Cacher).has(track.id)) {
        return (manager.plugins.get(enums_1.PluginName.Cacher)).get(track.id);
    }
    else if (type === "SoundCloud") {
        return soundcloud_downloader_1.default.download(track.id).catch((e) => {
            console.error("Failed to download track from SoundCloud With Reason: " + e);
            return undefined;
        });
    }
    else if (type === "LocalFile") {
        return (0, fs_1.createReadStream)(track.id);
    }
    else if (type === "Url") {
        const pass = new stream_1.PassThrough();
        const req = await (0, undici_1.request)(track.id);
        req.body.pipe(pass);
        req.body.on("end", () => {
            pass.end();
        });
        req.body.on("error", (e) => {
            console.error(e);
            pass.end();
        });
        return pass;
    }
    else if (type === "Youtube") {
        const yt = await manager.platforms.youtube;
        return stream_1.Readable.fromWeb(await yt.download(track.id, {
            client: manager.configs.searchOptions.youtubeClient ?? "WEB",
            quality: "best",
            type: "audio",
        }));
    }
    else if (type === "Spotify") {
        const yt = await manager.platforms.youtube;
        if (!track.id) {
            const data = await yt.search(`${track.title} ${track.artist}`, {
                type: "video",
            });
            // @ts-ignore
            track.id = data.videos[0].id;
            return stream_1.Readable.fromWeb((await yt.download(track.id, {
                client: manager.configs.searchOptions.youtubeClient ?? "WEB",
                quality: "best",
                type: "audio",
            })));
        }
        else {
            return stream_1.Readable.fromWeb(await yt.download(track.id, {
                client: manager.configs.searchOptions.youtubeClient ?? "WEB",
                quality: "best",
                type: "audio",
            }));
        }
    }
}
exports.requestStream = requestStream;
// get livestream and continue fetching next chunk
//# sourceMappingURL=request.js.map