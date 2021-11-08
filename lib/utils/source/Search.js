"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Search = exports.Attachments = exports.LocalFile = exports.SoundCloud = void 0;
const soundcloud_downloader_1 = __importDefault(require("soundcloud-downloader"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const constructs_1 = require("../decorators/constructs");
let SoundCloud = class SoundCloud {
    constructor(config) {
        this.options = { clientId: "" };
        this.options = config;
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
        return ['https://soundcloud.com', 'https://m.soundcloud.com'];
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
    async search({ query }) {
        if (this.baseURL.some(x => query.startsWith(x))) {
            query = this.parseURL(query);
            if (query.split('/')[4] === 'sets') {
                const set = await soundcloud_downloader_1.default.getSetInfo(query).catch(_ => {
                    return {
                        tracks: []
                    };
                }); //SCDL.getSetInfo(url: string): Promise<SetInfo>
                return set.tracks.map((x) => x.permalink_url);
            }
            else if (query.endsWith('likes') && query.split('/').length === 4) {
                const arr = query.split("/");
                arr.pop();
                const likeUrl = arr.join("/");
                const { collection } = await soundcloud_downloader_1.default.getLikes({ profileUrl: likeUrl }).catch(_ => {
                    return {
                        collection: []
                    };
                });
                return collection.map((x) => x.track.permalink_url);
            }
            else {
                return [query]; // hardest line 
            }
        }
        else {
            const { collection } = await soundcloud_downloader_1.default.search({ limit: 1, query, resourceType: 'tracks' }).catch(_ => {
                return {
                    collection: []
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
        const info = await soundcloud_downloader_1.default.getInfo(url).catch(_ => null);
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
        const stream = await soundcloud_downloader_1.default.download(url).catch(_ => null);
        if (!stream)
            return;
        return stream;
    }
};
SoundCloud = __decorate([
    (0, constructs_1.constructSoundcloud)()
], SoundCloud);
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
            description: 'A Local File',
            path: query,
            dir: path_1.default.dirname(query),
            createdTimestamp: fs_1.default.statSync(query).birthtimeMs
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
            method: 'get'
        }).catch(_ => null);
        if (!res)
            throw new Error('AttachmentSearchError: Invalid Url Provided');
        return [query];
    }
    /**
     * @method getInfo
     * @description gets info of the attachment
     * @param {string} query url
     */
    async getInfo(query) {
        const arr = query.split('/');
        return {
            title: arr[arr.length - 1],
            description: 'An Attachment Or Url',
            url: query
        };
    }
    /**
     * @method getStream
     * @description gets the stream data of url
     * @param {string} url url
     */
    async getStream(url) {
        const { data: stream } = await (0, axios_1.default)({
            method: 'get',
            responseType: 'stream',
            url: url,
        }).catch(_ => null);
        return stream;
    }
}
exports.Attachments = Attachments;
class Search {
    constructor() {
        this.soundCloud = new SoundCloud();
        this.localFile = new LocalFile();
        this.attachment = new Attachments();
    }
    async search({ query, type }) {
        let result;
        if (type === 0) {
            result = await this.soundCloud.search({ query, scOptions: this.soundCloud.options });
        }
        else if (type === 1) {
            result = await this.localFile.search(query);
        }
        else if (type === 2) {
            result = await this.attachment.search(query);
        }
        return result;
    }
}
exports.Search = Search;
//# sourceMappingURL=Search.js.map