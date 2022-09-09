import { AudioPlayer as AP, AudioResource } from "@discordjs/voice";
import { AutoPlay, LoopMode, PlatformType } from "./../typings/enums";
import { AudioPlayerMode, AudioPLayerOptions } from "./../typings/interfaces";
import { Track } from "../typings/types";
import { GuildMember } from "discord.js";
export declare class AudioPlayer {
    options: AudioPLayerOptions;
    modes: AudioPlayerMode;
    queue: Track<keyof typeof PlatformType>[];
    player: AP;
    currentResource: AudioResource<unknown> | null;
    constructor(options: AudioPLayerOptions);
    defaultMode(): AudioPlayerMode;
    play(): Promise<void>;
    _loopQueue(): Promise<void>;
    _playNext(): Promise<void>;
    _destroy(): void;
    _configPlayer(): void;
    add(track: string[], type: PlatformType, member: GuildMember): Promise<void>;
    skip(): boolean;
    pause(): boolean;
    resume(): boolean;
    set volume(volume: number);
    get volume(): number;
    set loop(loop: LoopMode);
    get loop(): LoopMode;
    set autoPlay(autoPlay: AutoPlay);
    get autoPlay(): AutoPlay;
}
