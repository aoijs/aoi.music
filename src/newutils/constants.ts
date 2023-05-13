export const FFMPEG_ARGS = [
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
] as const;
export const formatedPlatforms = [
    "SoundCloud",
    "LocalFile",
    "Url",
    "Youtube",
    "Spotify",
] as const;

export const CustomFilters = {
    nightCore: (value: number) => {
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
    bassBoost: (value: number) => {
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
    pitch: (value: number) => {
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
    karaoke: (value: number) => {
        return [
            {
                filter: "stereotools",
                value: `mlev=${0.015625 * value}`,
            },
        ];
    },
    slowed: (value: number) => {
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
    deep: (value: number) => {
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
    trebleBoost: (value: number) => {
        return [{
            filter: "treble",
            value: `g=${ value }`,
        }];
    },
    gate: ( value: number ) =>
    { 
        return [{
            filter: "agate",
            value: `threshold=${ value }`,
        }];
    },
    vibrato: ( value: number ) =>
    { 
        return [{
            filter: "vibrato",
            value: `f=${ value }`,
        }];
    },
    flanger: ( value: number ) =>
    {
        return [{
            filter: "flanger",
            value: `delay=${ value }`,
        }];
    },
    phaser: ( value: number ) =>
    {
        return [{
            filter: "aphaser",
            value: `in_gain=${ value }`,
        }];
    },
};

export const QueueFormatRegex = /{([^}]+)}/g;