import PlaylistVideo from "youtubei.js/dist/src/parser/classes/PlaylistVideo";
import Video from "youtubei.js/dist/src/parser/classes/Video";
import { Manager } from "../newstruct/manager";
import { PlatformType } from "../typings/enums";
import { YoutubeMix, ytMixHTMLParser } from "./helpers";
import { fetch } from "undici";
import { existsSync } from "fs";
import { setTimeout } from "timers/promises";
import * as fsp from "fs/promises";
export async function search(
    query: string,
    type: PlatformType,
    manager: Manager,
) {
    if (type === PlatformType.Youtube) {
        if (!query.startsWith("https://")) {
            const yt = await manager.platforms.youtube;
            const searched = await yt.search(query, {
                type: "video",
            });
            return [
                `https://youtube.com/watch?v=${
                    searched.videos[0].as(Video).id
                }`,
            ];
        } else {
            if (query.includes("watch?v=") && query.includes("list=")) {
                const data = await (await fetch(query)).text();
                const parsedData = ytMixHTMLParser(data);
                return YoutubeMix(parsedData);
            } else if (query.includes("watch?v=")) {
                return [query];
            } else if (query.includes("playlist?list=")) {
                const yt = await manager.platforms.youtube;
                const playlist = await yt.getPlaylist(query);
                return playlist.videos
                    .as(PlaylistVideo)
                    .map((video) => `https://youtube.com/watch?v=${video.id}`);
            }
        }
    } else if (type === PlatformType.SoundCloud) {
        const sc = manager.platforms.soundcloud;
        if (query.startsWith("https://")) {
            if (query.split("/")[4] === "sets") {
                (await sc.getSetInfo(query)).tracks.map(
                    (track) => track.permalink_url,
                );
            } else if (query.split("/").pop() === "likes") {
                return (
                    await sc.getLikes({
                        limit: manager.configs.requestOptions
                            .soundcloudLikeTrackLimit,
                        profileUrl: query.split("/").slice(0, 4).join("/"),
                    })
                ).collection.map((like) => like.track.permalink_url);
            } else {
                return [query];
            }
        }

        const sq = {
            query: query,
        };
        return (await sc.search(sq)).collection.map((x) => x.permalink_url);
    } else if (type === PlatformType.LocalFile) {
        if (existsSync(query)) {
            const stats = await fsp.stat(query);
            if (stats.isDirectory()) {
                const files = await fsp.readdir(query);
                return files
                    .filter((x) => {
                        return (
                            x.endsWith(".mp3") ||
                            x.endsWith(".wav") ||
                            x.endsWith(".ogg") ||
                            x.endsWith(".flac")
                        );
                    })
                    .map((x) => `${query}/${x}`);
            } else {
                if (
                    query.endsWith(".mp3") ||
                    query.endsWith(".wav") ||
                    query.endsWith(".ogg") ||
                    query.endsWith(".flac")
                ) {
                    return [query];
                }
                return [];
            }
        }
        return [];
    } else if (type === PlatformType.Url) {
        const res = await fetch(query);
        const ct = res.headers.get("content-type");
        if (ct.startsWith("audio") || ct.startsWith("video")) {
            return [query];
        }
        return [];
    } else if (type === PlatformType.Spotify) {
        return [query];
    }
}
