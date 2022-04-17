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
exports.Search = exports.Youtube = exports.Attachments = exports.LocalFile = exports.SoundCloud = void 0;
const soundcloud_downloader_1 = __importDefault(require("soundcloud-downloader"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const get_audio_duration_1 = require("get-audio-duration");
const yts = __importStar(require("youtube-scrapper"));
const helpers_1 = require("../helpers");
class SoundCloud {
    constructor(config) {
        this.options = { clientId: undefined };
        this.options = config;
        if (config?.clientId) {
            this.setClientId(config.clientId);
        }
    }
    /**
     * @method setClientId
     * @description sets the clientId
     * @param {string} clientId clientId to be set
     */
    setClientId(clientId) {
        this.options.clientId = clientId;
        soundcloud_downloader_1.default.saveClientID = true;
        soundcloud_downloader_1.default.setClientID(clientId);
    }
    /**
     * @method baseURLRegex
     * @description returns the regex for baseUrl
     * @readonly
     */
    get baseURLRegex() {
        return /^(http(s):\/\/)(m.)soundcloud.com/;
    }
    /**
     * @method baseURL
     * @description returns the supported base urls for soundcloud
     * @readonly
     */
    get baseURL() {
        return ["https://soundcloud.com", "https://m.soundcloud.com"];
    }
    /**
     * @method parseURL
     * @description parses the souncloud urls to supported format
     * @param {string} query query that needs to be parsed
     */
    parseURL(query) {
        const regex = this.baseURLRegex;
        return query.replace(regex, this.baseURL[0]);
    }
    /**
     * @method search
     * @description searchs for the query
     * @param {string} query query required for search
     * @param {SoundcloudOptions} scOptions options for soundcloud-downloader
     */
    async search({ query, }) {
        if (this.baseURL.some((x) => query.startsWith(x))) {
            query = this.parseURL(query);
            if (query.split("/")[4] === "sets") {
                const set = await soundcloud_downloader_1.default.getSetInfo(query).catch((_) => {
                    return {
                        tracks: [],
                    };
                }); //SCDL.getSetInfo(url: string): Promise<SetInfo>
                return set.tracks.map((x) => x.permalink_url);
            }
            else if (query.endsWith("likes") && query.split("/").length === 5) {
                const arr = query.split("/");
                arr.pop();
                const likeUrl = arr.join("/");
                const { collection } = await soundcloud_downloader_1.default
                    .getLikes({
                    profileUrl: likeUrl,
                    limit: this.options.likeTrackLimit ?? 200,
                })
                    .catch((e) => {
                    return {
                        collection: [],
                    };
                });
                return collection.map((x) => x.track.permalink_url);
            }
            else {
                return [query]; // hardest line
            }
        }
        else {
            const { collection } = await soundcloud_downloader_1.default
                .search({ limit: 1, query, resourceType: "tracks" })
                .catch((e) => {
                console.error(e);
                return {
                    collection: [],
                };
            });
            if (!collection.length)
                return [];
            // fixed e
            return [collection[0].permalink_url];
        }
    }
    /**
     * @method getInfo
     * @description gets the Data of the Url Provided
     * @param {string} url url of the track
     */
    async getInfo(url) {
        const info = await soundcloud_downloader_1.default.getInfo(url).catch(console.error);
        if (!info)
            return;
        return info;
    }
    /**
     * @method getStream
     * @description gets the stream data of the url provided
     * @param {string} url url of the track
     */
    async getStream(url) {
        const stream = await soundcloud_downloader_1.default.download(url).catch((_) => null);
        if (!stream)
            return;
        return stream;
    }
    async related(id, limit = 1) {
        const { collection: data } = await soundcloud_downloader_1.default.related(id, limit);
        return data;
    }
}
exports.SoundCloud = SoundCloud;
class LocalFile {
    /**
     * @method search
     * @description searchs for the file , if it exists, returns the path;
     * @param {string} query path to be searched
     */
    async search(query) {
        if (!fs_1.default.existsSync(query))
            return;
        return [query];
    }
    /**
     * @method getInfo
     * @description gets info of the path
     * @param {string} query path
     */
    async getInfo(query) {
        return {
            title: path_1.default.basename(query),
            description: "A Local File",
            path: query,
            dir: path_1.default.dirname(query),
            duration: await (0, get_audio_duration_1.getAudioDurationInSeconds)(query),
            createdTimestamp: fs_1.default.statSync(query).birthtimeMs,
        };
    }
    /**
     * @method getStream
     * @description gets the stream data of provided file
     * @param {string} query path of the file
     */
    async getStream(query) {
        let stream;
        try {
            stream = fs_1.default.createReadStream(query);
        }
        catch (e) {
            throw new Error(e);
        }
        return stream;
    }
}
exports.LocalFile = LocalFile;
class Attachments {
    /**
     * @method search
     * @description searchs for the url , if it exists, returns the url;
     * @param {string} query url to be searched
     */
    async search(query) {
        const res = (0, axios_1.default)({
            url: query,
            method: "get",
        }).catch((_) => null);
        if (!res)
            throw new Error("AttachmentSearchError: Invalid Url Provided");
        return [query];
    }
    /**
     * @method getInfo
     * @description gets info of the attachment
     * @param {string} query url
     */
    async getInfo(query) {
        const arr = query.split("/");
        return {
            title: arr[arr.length - 1],
            description: "An Attachment Or Url",
            url: query,
            duration: await (0, get_audio_duration_1.getAudioDurationInSeconds)(query),
        };
    }
    /**
     * @method getStream
     * @description gets the stream data of url
     * @param {string} url url
     */
    async getStream(url) {
        const { data: stream } = await (0, axios_1.default)({
            method: "get",
            responseType: "stream",
            url: url,
        }).catch((_) => null);
        return stream;
    }
}
exports.Attachments = Attachments;
class Youtube {
    get baseURL() {
        return [
            "https://youtube.com",
            "https://youtu.be",
            "https://music.youtube.com",
            "https://www.youtube.com/",
        ];
    }
    async search(track) {
        if (this.baseURL.some((x) => track.startsWith(x))) {
            if (track.includes("/playlist?list=")) {
                let data = await yts.getPlaylistInfo(track, { full: true });
                if (!data.allLoaded()) {
                    data = await data.fetch();
                }
                return data.tracks.map((x) => x.url);
            }
            else if (track.includes("?v=") && track.includes("&list=")) {
                const rawData = (await axios_1.default.get(track)).data;
                const parsedData = (0, helpers_1.ytMixHTMLParser)(rawData);
                const data = (0, helpers_1.YoutubeMix)(parsedData);
                return data;
            }
            else {
                return [track];
            }
        }
        else {
            const data = await yts.search(track);
            const vid = data.videos[0];
            return [vid.url];
        }
    }
    async getInfo(url) {
        const info = await yts.getVideoInfo(url, true);
        return info;
    }
    async getStream(info) {
        if (!info.formats.length)
            throw new Error("429 : Rate Limited!");
        else {
            console.log({
                bits: info.formats.map((c) => `${c.audioBitrate} | ${c.hasAudio} | ${c.hasVideo}`),
                rate: info.formats.map((c) => `${c.audioSampleRate} | ${c.hasAudio} | ${c.hasVideo}`),
                depth: info.formats.map((c) => `${c.audioChannels} | ${c.hasAudio} | ${c.hasVideo}`),
            });
            const stream = info.download(info.formats.find((x) => x.hasAudio && !x.hasVideo && x.audioBitrate), { chunkMode: { chunkSize: 512000 }, pipe: false, debug: true });
            return stream;
        }
    }
    async related(id, limit = 1) {
        const rawData = (0, helpers_1.ytRelatedHTMLParser)((await axios_1.default.get(`https://youtube.com/watch?v=${id}`)).data);
        const links = (0, helpers_1.YoutubeRelated)(rawData).slice(0, limit);
        const res = [];
        for (const link of links) {
            const info = await yts.getVideoInfo(link, true);
            res.push(info);
        }
        return res;
    }
}
exports.Youtube = Youtube;
class Search {
    constructor(data) {
        this.localFile = new LocalFile();
        this.attachment = new Attachments();
        this.youtube = new Youtube();
        this.soundcloud = new SoundCloud({ clientId: data.clientId });
    }
    async search({ query, type, }) {
        let result;
        if (type === 0) {
            result = await this.soundcloud.search({
                query,
                scOptions: this.soundcloud.options,
            });
        }
        else if (type === 1) {
            result = await this.localFile.search(query);
        }
        else if (type === 2) {
            result = await this.attachment.search(query);
        }
        else if (type === 3) {
            result = await this.youtube.search(query);
        }
        return result;
    }
}
exports.Search = Search;
//# sourceMappingURL=Search.js.map