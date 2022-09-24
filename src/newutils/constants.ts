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
];

export const formatedPlatforms = [
    "SoundCloud",
    "LocalFile",
    "Url",
    "Youtube",
    "Spotify",
] as const;
