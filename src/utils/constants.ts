export enum CacheType {
    Disk = "Disk",
    Memory = "Memory"
}

export enum PlayerStates {
    Idling = 'Idling',
    Playing = 'Playing',
    Paused = 'Paused',
    Destroyed = 'Destroyed'
}

export enum LoopMode {
    None = 'none',
    Track = 'song',
    Queue = 'queue'
}

export enum SourceProviders {
    Soundcloud,
    Twitch,
    LocalFile,
    Attachment
}

export enum PlayerEvents {
    TRACK_START = 'trackStart',
    TRACK_END = 'trackEnd',
    QUEUE_END  = 'queueEnd',
    QUEUE_START = 'queueStart',
    PLAYER_ERROR = 'error'
}