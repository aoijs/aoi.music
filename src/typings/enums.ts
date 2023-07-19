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
    AudioError = "audioError",
    QueueStart = "queueStart",
    QueueEnd = "queueEnd",
    TrackStart = "trackStart",
    TrackEnd = "trackEnd",
    TrackPause = "trackPause",
    TrackResume = "trackResume",
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

export enum PlayerTypes {
    Default = "default",
    FOnly = "fonly",
    Bidirect= "bidirect",
}