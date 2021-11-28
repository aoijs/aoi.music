"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const youtube_scrapper_1 = require("youtube-scrapper");
class Track {
    constructor(data) {
        this.requestUser = data.requestUser;
        this.type = data.type;
        this.rawInfo = data.rawinfo;
        this.source = this.getType(data.type);
        this.transformInfo(data.rawinfo);
    }
    /**
     * getType
     */
    /*
    Soundcloud,
    Twitch,
    LocalFile,
    Attachment
    */
    getType(type) {
        return type;
    }
    /**
     * link
     */
    get link() {
        return this.info.url || this.info.path;
    }
    /**
     * transformInfo
     */
    async transformInfo(rawInfo) {
        if (this.type === 0) {
            this.info = {
                title: rawInfo.title,
                description: rawInfo.description,
                url: rawInfo.permalink_url,
                thumbnail: rawInfo.artwork_url,
                raw_duration: rawInfo.duration,
                duration: rawInfo.full_duration,
                identifier: "SoundCloud",
                author: rawInfo.user?.username,
                authorURL: rawInfo.user?.permalink_url,
                authorAvatar: rawInfo.user.avatar_url,
                likes: rawInfo.likes_count,
                views: rawInfo.playback_count,
                createdTimestamp: rawInfo.created_at
                    ? new Date(rawInfo.created_at).getTime()
                    : null,
            };
        }
        else if (this.type === 1) {
            this.info = {
                title: rawInfo.title,
                description: "A Local File",
                path: rawInfo.path,
                dir: rawInfo.dir,
                createdTimestamp: rawInfo.createdTimestamp,
                likes: 0,
                views: 0,
            };
        }
        else if (this.type === 2) {
            this.info = {
                title: rawInfo.title,
                description: rawInfo.description,
                url: rawInfo.url,
                likes: 0,
                views: 0,
            };
        }
        else if (this.type === 3) {
            rawInfo = rawInfo.details;
            const channelData = await (0, youtube_scrapper_1.getChannel)(rawInfo.channelId);
            this.info = {
                title: rawInfo.title,
                description: rawInfo.shortDescription ?? rawInfo.description,
                url: rawInfo.url,
                thumbnail: rawInfo.thumbnails?.[0]?.url,
                raw_duration: rawInfo.duration,
                identifier: 'Youtube',
                author: rawInfo.author,
                authorAvatar: channelData.details.avatars?.[0]?.url,
                authorURL: channelData.url,
                likes: null,
                views: rawInfo.viewCount
            };
        }
        else {
            this.info = {
                title: rawInfo.title,
                description: rawInfo.description,
                url: rawInfo.permalink_url || rawInfo.url || rawInfo.path,
                createdTimestamp: rawInfo.createdTimestamp,
            };
        }
    }
}
exports.default = Track;
//# sourceMappingURL=Track.js.map