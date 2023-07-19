"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLiveStreamUrl = exports.YoutubeRelated = exports.YoutubeMix = exports.YoutubeMixVideo = exports.isMix = exports.ytRelatedHTMLParser = exports.ytMixHTMLParser = exports.shuffle = void 0;
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
}
exports.shuffle = shuffle;
function ytMixHTMLParser(file) {
    file = file
        .split("var ytInitialData")[1]
        .split("=")
        .slice(1)
        .join("=")
        .split("</script>")[0];
    let obj;
    try {
        eval(` obj = ${file}`);
    }
    catch (e) {
        throw e;
    }
    return obj.contents.twoColumnWatchNextResults.playlist.playlist;
}
exports.ytMixHTMLParser = ytMixHTMLParser;
function ytRelatedHTMLParser(file) {
    file = file
        .split("var ytInitialData")[1]
        .split("=")
        .slice(1)
        .join("=")
        .split("</script>")[0];
    let obj;
    try {
        eval(` obj = ${file}`);
    }
    catch (e) {
        throw e;
    }
    return obj.playerOverlays.playerOverlayRenderer.endScreen
        .watchNextEndScreenRenderer.results;
}
exports.ytRelatedHTMLParser = ytRelatedHTMLParser;
function isMix(url) {
    return url.includes("watch?v=") && url.includes("&list=");
}
exports.isMix = isMix;
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
function YoutubeRelated(data) {
    return data
        .filter((x) => x.endScreenVideoRenderer)
        .map((x) => x.endScreenVideoRenderer.videoId);
}
exports.YoutubeRelated = YoutubeRelated;
async function isLiveStreamUrl(url) {
    const req = await fetch(url, {
        method: "GET",
    });
    return req.headers.get("content-type")?.includes("audio") && !req.headers.get("content-length");
}
exports.isLiveStreamUrl = isLiveStreamUrl;
//# sourceMappingURL=helpers.js.map