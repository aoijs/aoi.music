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