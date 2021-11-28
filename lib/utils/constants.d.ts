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
    TRACK_START = "trackStart",
    TRACK_END = "trackEnd",
    QUEUE_END = "queueEnd",
    QUEUE_START = "queueStart",
    PLAYER_ERROR = "error"
}
