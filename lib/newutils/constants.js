"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomFilters = exports.formatedPlatforms = exports.FFMPEG_ARGS = void 0;
exports.FFMPEG_ARGS = [
    "-i",
    "-",
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
exports.CustomFilters = {
    NIGHT_CORE: (value) => {
        return [
            {
                filter: "aresample",
                value: "48000",
            },
            {
                filter: "asetrate",
                value: `${48000 * value}`,
            },
        ];
    },
    BASS_BOOST: (value) => {
        return [
            {
                filter: "bass",
                value: `g=${value}`,
            },
        ];
    },
    "8_D": () => {
        return [
            {
                filter: "extrastereo",
                value: "",
            },
            {
                filter: "aecho",
                value: "1:1:40:0.5",
            },
            {
                filter: "apulsator",
                value: "hz=0.125",
            },
            {
                filter: "stereowiden",
                value: "",
            },
        ];
    },
    PITCH: (value) => {
        return [
            {
                filter: "asetrate",
                value: `${48000 * value}`,
            },
            {
                filter: "atempo",
                value: 1 - Number(`${value}`.split(".")[1]),
            },
            {
                filter: "aresample",
                value: 48000,
            },
        ];
    },
    KAROAKE: (value) => {
        return [
            {
                filter: "stereotools",
                value: `mlev=${0.015625 * value}`,
            },
        ];
    },
    SLOWED: (value) => {
        return [
            {
                filter: "asetrate",
                value: 48000 * Math.abs(Math.ceil(value) - value),
            },
            {
                filter: "aresample",
                value: 48000,
            },
        ];
    },
    DEEP: (value) => {
        return [
            {
                filter: "asetrate",
                value: 48000 * Math.abs(Math.ceil(value) - value),
            },
            {
                filter: "atempo",
                value: 2 - Math.abs(Math.ceil(value) - value),
            },
            {
                filter: "aresample",
                value: 48000,
            },
        ];
    },
    TREBLE_BOOST: (value) => {
        return [{
                filter: "treble",
                value: `g=${value}`,
            }];
    },
};
//# sourceMappingURL=constants.js.map