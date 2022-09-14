import PlaylistVideo from "youtubei.js/dist/src/parser/classes/PlaylistVideo";
import Video from "youtubei.js/dist/src/parser/classes/Video";
import { Manager } from "../newstruct/manager";
import { PlatformType } from "../typings/enums";
import { YoutubeMix, ytMixHTMLParser } from "./helpers";
import { fetch } from "undici";
import { existsSync } from "fs";
import * as fsp from "fs/promises";
import { SearchOptions } from "soundcloud-downloader/src/search";
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
            return [ query ];
        }

        const sq: SearchOptions = {
            query: query,
            resourceType: "tracks",
            limit: 1,
        };
        return [(await sc.search(sq)).collection[0].permalink_url];
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
        return [query];
    } else if (type === PlatformType.Spotify) {
        return [query];
    }
}
