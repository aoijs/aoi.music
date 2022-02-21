"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestManager = void 0;
const voice_1 = require("@discordjs/voice");
const youtube_scrapper_1 = require("youtube-scrapper");
const constants_1 = require("../utils/constants");
const prism = __importStar(require("prism-media"));
class RequestManager {
    constructor(player) {
        this.nextStream = null;
        this.currentStream = null;
        this._currentStream = null;
        this.player = player;
        this.search = player.manager.searchManager;
    }
    /**
     * @param  {Track} track
     * @returns {Promise<void>}
     */
    async setCurrentStream(track) {
        let resource;
        let rawstream = await this.getStream();
        this._currentStream = rawstream;
        let stream;
        if (Object.keys(this.player.filterManager.filters).length) {
            const args = [...this.player.filterManager.args];
            const filters = Object.entries(this.player.filterManager.filters)
                .map((x) => `${x[0]}=${x[1]}`)
                .join(",");
            args.push("-af");
            args.push(filters);
            const ffmpeg = new prism.FFmpeg({
                args,
            });
            stream = rawstream.pipe(ffmpeg);
            resource = (0, voice_1.createAudioResource)(stream, {
                inlineVolume: true,
                inputType: voice_1.StreamType.Raw,
            });
        }
        else {
            stream = rawstream;
            resource = (0, voice_1.createAudioResource)(stream, {
                inlineVolume: true,
                inputType: voice_1.StreamType.Arbitrary,
            });
        }
        this.currentStream = resource;
        if (this.player.manager.config.cache.enabled &&
            !this.player.cacheManager.map.has(track.link) &&
            this.player.options.mode !== constants_1.LoopMode.None) {
            //console.log("caching track");
            this.player.cacheManager.write(track.link, stream, track.type, this.player.textChannel.guildId);
        }
    }
    /**
     * @param  {Track} track
     * @returns {Promise<void>}
     */
    async setNextStream(track) {
        let stream;
        if (!track)
            this.nextStream = null;
        else if (track.source === 0) {
            stream = await this.search.soundCloud.getStream(track.rawInfo.permalink_url);
        }
        else if (track.source === 1) {
            stream = await this.search.localFile.getStream(track.rawInfo.path);
        }
        else if (track.source === 2) {
            stream = await this.search.attachment.getStream(track.rawInfo.url);
        }
        const resource = (0, voice_1.createAudioResource)(stream, {
            inlineVolume: true,
            inputType: voice_1.StreamType.Arbitrary,
        });
        this.nextStream = resource;
    }
    /**
     * @returns {number}
     */
    get _currentDuration() {
        return this.currentStream.playbackDuration;
    }
    /**
     * e
     */
    /**
     * @param  {number} number
     * @returns void
     */
    _setVolume(number) {
        return this.currentStream.volume.setVolume(number);
    }
    /**
     * getStream
     */
    async getStream() {
        let stream;
        const track = this.player.queue.current;
        if (this.player.cacheManager.map.has(track.link)) {
            return this.player.cacheManager.get(track.link, this.player.textChannel.guildId);
        }
        else if (track.type === 0) {
            return await this.search.soundCloud.getStream(track.rawInfo.permalink_url);
        }
        else if (track.type === 1) {
            return await this.search.localFile.getStream(track.rawInfo.path);
        }
        else if (track.type === 2) {
            return await this.search.attachment.getStream(track.rawInfo.url);
        }
        else if (track.type === 3 && track.rawInfo instanceof youtube_scrapper_1.YoutubeVideo) {
            return await this.search.youtube.getStream(track.rawInfo);
            //console.log("using api");
        }
        else {
        }
    }
}
exports.RequestManager = RequestManager;
//# sourceMappingURL=RequestManager.js.map