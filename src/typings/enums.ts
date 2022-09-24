export enum CacheType
{
    Disk = "Disk",
    Memory = "Memory"
}

export enum PlayerStates
{
    Idling = 'Idling',
    Playing = 'Playing',
    Paused = 'Paused',
    Destroyed = 'Destroyed'
}

export enum LoopMode
{
    None = 'none',
    Track = 'song',
    Queue = 'queue'
}

export enum SourceProviders
{
    Soundcloud,
    Twitch,
    LocalFile,
    Attachment
}

export enum PlayerEvents
{
    TRACK_START = "trackStart",
    AUDIO_ERROR = "audioError",
    TRACK_END = "trackEnd",
    QUEUE_START = "queueStart",
    QUEUE_END = "queueEnd",
    TRACK_PAUSE = "trackPause",
    TRACK_RESUME = "trackResume",
}

export const timeMultiPlier = [ 1, 60, 60, 24 ];

export enum AutoPlay
{
    None = "none",
    Youtube = "youtube",
    SoundCloud = "soundcloud",
    Spotify = "spotify",
    Relative = "relative",
}

export enum PlatformType
{
    SoundCloud,
    LocalFile,
    Url,
    Youtube,
    Spotify,
    

}

export enum PluginName {
    Cacher= "cache",
    Filter = "filter",
}

