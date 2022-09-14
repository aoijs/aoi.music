"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatedPlatforms = exports.FFMPEG_ARGS = void 0;
exports.FFMPEG_ARGS = [
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
exports.formatedPlatforms = [
    "SoundCloud",
    "LocalFile",
    "Url",
    "Youtube",
    "Spotify",
];
//# sourceMappingURL=constants.js.map