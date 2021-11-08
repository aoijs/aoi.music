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