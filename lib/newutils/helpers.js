"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = shuffle;
exports.ytMixHTMLParser = ytMixHTMLParser;
exports.ytRelatedHTMLParser = ytRelatedHTMLParser;
exports.isMix = isMix;
exports.YoutubeMixVideo = YoutubeMixVideo;
exports.YoutubeMix = YoutubeMix;
exports.YoutubeRelated = YoutubeRelated;
exports.isLiveStreamUrl = isLiveStreamUrl;
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}
function ytMixHTMLParser(file) {
    file = file.split("var ytInitialData")[1].split("=").slice(1).join("=").split("</script>")[0];
    let obj;
    try {
        eval(` obj = ${file}`);
    }
    catch (e) {
        throw e;
    }
    return obj.contents.twoColumnWatchNextResults.playlist.playlist;
}
function ytRelatedHTMLParser(file) {
    file = file.split("var ytInitialData")[1].split("=").slice(1).join("=").split("</script>")[0];
    let obj;
    try {
        eval(` obj = ${file}`);
    }
    catch (e) {
        throw e;
    }
    return obj.playerOverlays.playerOverlayRenderer.endScreen.watchNextEndScreenRenderer.results;
}
function isMix(url) {
    return url.includes("watch?v=") && url.includes("&list=");
}
function YoutubeMixVideo(data) {
    const videoId = data.navigationEndpoint.watchEndpoint.videoId;
    const playlistId = data.navigationEndpoint.watchEndpoint.playlistId;
    const index = data.navigationEndpoint.watchEndpoint.index;
    return `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}&index=${index}`;
}
function YoutubeMix(data) {
    return data.contents.map((video) => YoutubeMixVideo(video.playlistPanelVideoRenderer));
}
function YoutubeRelated(data) {
    return data.filter((x) => x.endScreenVideoRenderer).map((x) => x.endScreenVideoRenderer.videoId);
}
async function isLiveStreamUrl(url) {
    const req = await fetch(url, {
        method: "GET"
    });
    return req.headers.get("content-type")?.includes("audio") && !req.headers.get("content-length");
}
//# sourceMappingURL=helpers.js.map