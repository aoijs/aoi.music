"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        this.currentStream = stream;
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
        this.nextStream = stream;
    }
}
exports.default = requestManager;
//# sourceMappingURL=requestManager.js.map