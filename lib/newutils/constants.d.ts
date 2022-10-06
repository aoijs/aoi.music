export declare const FFMPEG_ARGS: string[];
export declare const formatedPlatforms: readonly ["SoundCloud", "LocalFile", "Url", "Youtube", "Spotify"];
export declare const CustomFilters: {
    NIGHT_CORE: (value: number) => {
        filter: string;
        value: string;
    }[];
    BASS_BOOST: (value: number) => {
        filter: string;
        value: string;
    }[];
    "8_D": () => {
        filter: string;
        value: string;
    }[];
    PITCH: (value: number) => ({
        filter: string;
        value: string;
    } | {
        filter: string;
        value: number;
    })[];
    KAROAKE: (value: number) => {
        filter: string;
        value: string;
    }[];
    SLOWED: (value: number) => {
        filter: string;
        value: number;
    }[];
    DEEP: (value: number) => {
        filter: string;
        value: number;
    }[];
    TREBLE_BOOST: (value: number) => {
        filter: string;
        value: string;
    }[];
};
