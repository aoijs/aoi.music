export declare enum CacheType {
    Disk = "Disk",
    Memory = "Memory"
}
export declare enum PlayerStates {
    Idling = "Idling",
    Playing = "Playing",
    Paused = "Paused",
    Destroyed = "Destroyed"
}
export declare enum LoopMode {
    None = "none",
    Track = "song",
    Queue = "queue"
}
export declare enum SourceProviders {
    Soundcloud = 0,
    Twitch = 1,
    LocalFile = 2,
    Attachment = 3
}
export declare enum PlayerEvents {
    AudioError = "audioError",
    QueueStart = "queueStart",
    QueueEnd = "queueEnd",
    TrackStart = "trackStart",
    TrackEnd = "trackEnd",
    TrackPause = "trackPause",
    TrackResume = "trackResume"
}
export declare const timeMultiPlier: number[];
export declare enum AutoPlay {
    None = "none",
    Youtube = "youtube",
    SoundCloud = "soundcloud",
    Spotify = "spotify",
    Relative = "relative"
}
export declare enum PlatformType {
    SoundCloud = 0,
    LocalFile = 1,
    Url = 2,
    Youtube = 3,
    Spotify = 4
}
export declare enum PluginName {
    Cacher = "cache",
    Filter = "filter"
}
export declare enum PlayerTypes {
    Default = "default",
    FOnly = "fonly",
    Bidirect = "bidirect"
}
