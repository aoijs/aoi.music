"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
class requestManager {
    constructor(player) {
        this.nextStream = null;
        this.currentStream = null;
        this.player = player;
        this.search = player.manager.searchManager;
    }
    /**
     * @param  {Track} track
     * @returns {Promise<void>}
     */
    async setCurrentStream(track) {
        let stream;
        if (track.source === 0) {
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
        this.currentStream = resource;
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
}
exports.default = requestManager;
//# sourceMappingURL=requestManager.js.map