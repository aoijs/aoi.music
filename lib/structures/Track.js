"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
     * transformInfo
     */
    transformInfo(rawInfo) {
        if (this.type === 0) {
            this.info = {
                title: rawInfo.title,
                description: rawInfo.description,
                url: rawInfo.permalink_url,
                thumbnail: rawInfo.artwork_url,
                raw_duration: rawInfo.duration,
                duration: rawInfo.full_duration,
                identifier: 'SoundCloud',
                author: rawInfo.user?.username,
                authorURL: rawInfo.user?.artwork_url,
                likes: rawInfo.likes_count,
                views: rawInfo.playback_count,
                createdTimestamp: rawInfo.created_at ? new Date(rawInfo.created_at).getTime() : null
            };
        }
        else if (this.type === 1) {
            this.info = {
                title: rawInfo.title,
                description: 'A Local File',
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
                views: 0
            };
        }
        else {
            this.info = {
                title: rawInfo.title,
                description: rawInfo.description,
                url: rawInfo.permalink_url || rawInfo.url || rawInfo.path,
                createdTimestamp: rawInfo.createdTimestamp
            };
        }
    }
}
exports.default = Track;
//# sourceMappingURL=Track.js.map