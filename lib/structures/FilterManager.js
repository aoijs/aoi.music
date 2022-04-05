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
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const prism = __importStar(require("prism-media"));
class FilterManager {
    constructor(player) {
        this.filters = [];
        this.player = player;
        this.args = [
            "-analyzeduration",
            "0",
            "-loglevel",
            "0",
            "-preset",
            "veryfast",
            "-f",
            "s16le",
            "-ar",
            "48000",
            "-ac",
            "2",
            "-vn",
        ];
    }
    /**
     * @method addFilters
     * @param  {any[]} ...filters
     * @returns void
     */
    async addFilters(filters) {
        for (const [filter, data] of Object.entries(filters)) {
            this.filters.push(`${filter}=${data}`);
        }
        return await this._applyFilters();
    }
    /**
     * @method removeFilters
     * @param  {any[]} ...filters
     * @returns void
     */
    removeFilters(...filters) {
        for (const filter of filters) {
            delete this.filters[filter];
        }
    }
    async setFilters(filters) {
        this.filters = [];
        for (const [filter, data] of Object.entries(filters)) {
            this.filters.push(`${filter}=${data}`);
        }
        return await this._applyFilters();
    }
    async resetFilters() {
        this.filters = [];
        return await this._applyFilters();
    }
    async _applyFilters() {
        const args = [...this.args];
        if (this.player.options.seekWhenFilter) {
            const duration = this.player.requestManager.currentStream.playbackDuration;
            args.unshift("-ss", Math.trunc(duration / 1000).toString());
        }
        const filters = this.filters.join(",");
        if (filters.length > 0) {
            args.push("-af");
            args.push(filters);
        }
        const ffmpeg = new prism.FFmpeg({
            args,
        });
        const opus = new prism.opus.Encoder({
            rate: 48000,
            channels: 2,
            frameSize: 960,
        });
        const stream = await this.player.requestManager.getStream();
        const fdata = stream.pipe(ffmpeg);
        const resource = (0, voice_1.createAudioResource)(fdata.pipe(opus), {
            inlineVolume: true,
            inputType: voice_1.StreamType.Opus,
        });
        this.player.requestManager.currentStream = resource;
        this.player.play();
        return this.filters;
    }
    async seekTo(time) {
        const args = [...this.args];
        args.unshift("-ss", `${time}`);
        const filters = Object.entries(this.filters)
            .map((x) => `${x[0]}=${x[1]}`)
            .join(",");
        if (filters.length) {
            args.push("-af", filters);
        }
        const ffmpeg = new prism.FFmpeg({
            args,
        });
        const opus = new prism.opus.Encoder({
            rate: 48000,
            channels: 2,
            frameSize: 960,
        });
        const fdata = (await this.player.requestManager.getStream()).pipe(ffmpeg);
        const resource = (0, voice_1.createAudioResource)(fdata.pipe(opus), {
            inlineVolume: true,
            inputType: voice_1.StreamType.Opus,
        });
        this.player.requestManager.currentStream = resource;
        resource.playbackDuration = time * 1000;
        this.player.play();
    }
}
exports.default = FilterManager;
//# sourceMappingURL=FilterManager.js.map