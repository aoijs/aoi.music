export enum CacheType {
    Disk = "disk",
    Memory = "memory"
}

export enum PlayerStates {
    Idling,
    Playing,
    Paused,
    Destroyed
}

export enum LoopMode {
    None,
    Track,
    Queue
}

export enum SourceProviders {
    Soundcloud,
    Twitch,
    LocalFile,
    Attachment
}