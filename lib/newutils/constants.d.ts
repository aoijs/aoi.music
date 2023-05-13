export declare const FFMPEG_ARGS: readonly ["-i", "-", "-analyzeduration", "0", "-loglevel", "0", "-preset", "veryfast", "-f", "s16le", "-ar", "48000", "-ac", "2", "-vn"];
export declare const formatedPlatforms: readonly ["SoundCloud", "LocalFile", "Url", "Youtube", "Spotify"];
export declare const CustomFilters: {
    nightCore: (value: number) => {
        filter: string;
        value: string;
    }[];
    bassBoost: (value: number) => {
        filter: string;
        value: string;
    }[];
    "8D": () => {
        filter: string;
        value: string;
    }[];
    pitch: (value: number) => ({
        filter: string;
        value: string;
    } | {
        filter: string;
        value: number;
    })[];
    karaoke: (value: number) => {
        filter: string;
        value: string;
    }[];
    slowed: (value: number) => {
        filter: string;
        value: number;
    }[];
    deep: (value: number) => {
        filter: string;
        value: number;
    }[];
    trebleBoost: (value: number) => {
        filter: string;
        value: string;
    }[];
    gate: (value: number) => {
        filter: string;
        value: string;
    }[];
    vibrato: (value: number) => {
        filter: string;
        value: string;
    }[];
    flanger: (value: number) => {
        filter: string;
        value: string;
    }[];
    phaser: (value: number) => {
        filter: string;
        value: string;
    }[];
};
export declare const QueueFormatRegex: RegExp;
