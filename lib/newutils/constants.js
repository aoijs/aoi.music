"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueFormatRegex = exports.CustomFilters = exports.formatedPlatforms = exports.FFMPEG_ARGS = void 0;
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
    nightCore: (value) => {
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
    bassBoost: (value) => {
        return [
            {
                filter: "bass",
                value: `g=${value}`,
            },
        ];
    },
    "8D": () => {
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
    pitch: (value) => {
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
    karaoke: (value) => {
        return [
            {
                filter: "stereotools",
                value: `mlev=${0.015625 * value}`,
            },
        ];
    },
    slowed: (value) => {
        return [
            {
                filter: "asetrate",
                value: 48000 * Math.abs(value - Math.ceil(value)),
            },
            {
                filter: "aresample",
                value: 48000,
            },
        ];
    },
    deep: (value) => {
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
    trebleBoost: (value) => {
        return [{
                filter: "treble",
                value: `g=${value}`,
            }];
    },
    gate: (value) => {
        return [{
                filter: "agate",
                value: `threshold=${value}`,
            }];
    },
    vibrato: (value) => {
        return [{
                filter: "vibrato",
                value: `f=${value}`,
            }];
    },
    flanger: (value) => {
        return [{
                filter: "flanger",
                value: `delay=${value}`,
            }];
    },
    phaser: (value) => {
        return [{
                filter: "aphaser",
                value: `in_gain=${value}`,
            }];
    },
};
exports.QueueFormatRegex = /{([^}]+)}/g;
//# sourceMappingURL=constants.js.map