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
    NIGHT_CORE: (value: number) => {
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
    BASS_BOOST: (value: number) => {
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
    PITCH: (value: number) => {
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
    KAROAKE: (value: number) => {
        return [
            {
                filter: "stereotools",
                value: `mlev=${0.015625 * value}`,
            },
        ];
    },
    SLOWED: (value: number) => {
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
    DEEP: (value: number) => {
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
    TREBLE_BOOST: (value: number) => {
        return [{
            filter: "treble",
            value: `g=${ value }`,
        }];
    },
    GATE: ( value: number ) =>
    { 
        return [{
            filter: "agate",
            value: `threshold=${ value }`,
        }];
    },
    VIBRATO: ( value: number ) =>
    { 
        return [{
            filter: "vibrato",
            value: `f=${ value }`,
        }];
    },
    FLANGER: ( value: number ) =>
    {
        return [{
            filter: "flanger",
            value: `delay=${ value }`,
        }];
    },
    PHASER: ( value: number ) =>
    {
        return [{
            filter: "aphaser",
            value: `in_gain=${ value }`,
        }];
    },
};

export const QueueFormatRegex = /{([^}]+)}/g;