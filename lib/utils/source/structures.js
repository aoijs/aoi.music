"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeMix = exports.YoutubeMixVideo = void 0;
function YoutubeMixVideo(data) {
    const videoId = data.navigationEndpoint.watchEndpoint.videoId;
    const playlistId = data.navigationEndpoint.watchEndpoint.playlistId;
    const index = data.navigationEndpoint.watchEndpoint.index;
    return `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}&index=${index}`;
}
exports.YoutubeMixVideo = YoutubeMixVideo;
function YoutubeMix(data) {
    return data.contents.map((video) => YoutubeMixVideo(video.playlistPanelVideoRenderer));
}
exports.YoutubeMix = YoutubeMix;
//# sourceMappingURL=structures.js.map