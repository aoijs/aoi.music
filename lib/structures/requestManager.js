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
     * addStream
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
            inputType: voice_1.StreamType.Arbitrary
        });
        this.currentStream = resource;
    }
    async setNextStream(track) {
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
            inputType: voice_1.StreamType.Arbitrary
        });
        this.currentStream = resource;
    }
    /**
     * currentDuration
     */
    get _currentDuration() {
        return this.currentStream.playbackDuration;
    }
    /**
     * e
     */
    get _volume() {
        return this.currentStream.volume;
    }
}
exports.default = requestManager;
//# sourceMappingURL=requestManager.js.map