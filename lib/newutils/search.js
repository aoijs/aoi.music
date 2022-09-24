"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const PlaylistVideo_1 = __importDefault(require("youtubei.js/dist/src/parser/classes/PlaylistVideo"));
const Video_1 = __importDefault(require("youtubei.js/dist/src/parser/classes/Video"));
const enums_1 = require("../typings/enums");
const helpers_1 = require("./helpers");
const undici_1 = require("undici");
const fs_1 = require("fs");
const fsp = __importStar(require("fs/promises"));
async function search(query, type, manager) {
    if (type === enums_1.PlatformType.Youtube) {
        if (!query.startsWith("https://")) {
            const yt = await manager.platforms.youtube;
            const searched = await yt.search(query, {
                type: "video",
            });
            return [
                `https://youtube.com/watch?v=${searched.videos[0].as(Video_1.default).id}`,
            ];
        }
        else {
            if (query.includes("watch?v=") && query.includes("list=")) {
                const data = await (await (0, undici_1.fetch)(query)).text();
                const parsedData = (0, helpers_1.ytMixHTMLParser)(data);
                return (0, helpers_1.YoutubeMix)(parsedData);
            }
            else if (query.includes("watch?v=")) {
                return [query];
            }
            else if (query.includes("playlist?list=")) {
                const yt = await manager.platforms.youtube;
                const playlist = await yt.getPlaylist(query.split("list=")[1].split("&")[0]);
                return playlist.videos
                    .as(PlaylistVideo_1.default)
                    .map((video) => `https://youtube.com/watch?v=${video.id}`);
            }
        }
    }
    else if (type === enums_1.PlatformType.SoundCloud) {
        const sc = manager.platforms.soundcloud;
        if (query.startsWith("https://")) {
            return [query];
        }
        const sq = {
            query: query,
            resourceType: "tracks",
            limit: 1,
        };
        return [(await sc.search(sq)).collection[0].permalink_url];
    }
    else if (type === enums_1.PlatformType.LocalFile) {
        if ((0, fs_1.existsSync)(query)) {
            const stats = await fsp.stat(query);
            if (stats.isDirectory()) {
                const files = await fsp.readdir(query);
                return files
                    .filter((x) => {
                    return (x.endsWith(".mp3") ||
                        x.endsWith(".wav") ||
                        x.endsWith(".ogg") ||
                        x.endsWith(".flac"));
                })
                    .map((x) => `${query}/${x}`);
            }
            else {
                if (query.endsWith(".mp3") ||
                    query.endsWith(".wav") ||
                    query.endsWith(".ogg") ||
                    query.endsWith(".flac")) {
                    return [query];
                }
                return [];
            }
        }
        return [];
    }
    else if (type === enums_1.PlatformType.Url) {
        return [query];
    }
    else if (type === enums_1.PlatformType.Spotify) {
        return [query];
    }
}
exports.search = search;
//# sourceMappingURL=search.js.map