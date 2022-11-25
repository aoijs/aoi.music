import { Collection, Message, Snowflake, VoiceChannel } from "discord.js";
import { PlayerEvents } from "../typings/enums";
import { AudioPLayerOptions, ManagerConfigurations } from "../typings/interfaces";
import { Manager } from "./manager";
export declare class AoiVoice<T> extends Manager {
    #private;
    prunes: Map<Snowflake, {
        message: Message<boolean>;
        channel: Snowflake;
    }>;
    cmds: {
        trackStart: Collection<string, Record<string, any>>;
        trackEnd: Collection<string, Record<string, any>>;
        queueEnd: Collection<string, Record<string, any>>;
        audioError: Collection<string, Record<string, any>>;
        queueStart: Collection<string, Record<string, any>>;
        trackPause: Collection<string, Record<string, any>>;
        trackResume: Collection<string, Record<string, any>>;
    };
    constructor(bot: T, managerConfig?: ManagerConfigurations);
    addEvent(event: PlayerEvents): void;
    addEvents(...events: PlayerEvents[]): void;
    bindExecutor(executor: Function): void;
    joinVc({ type, voiceChannel, textChannel, selfDeaf, selfMute, }: {
        type: AudioPLayerOptions["type"];
        voiceChannel: VoiceChannel;
        textChannel: Snowflake;
        selfDeaf?: boolean;
        selfMute?: boolean;
    }): Promise<boolean>;
}
