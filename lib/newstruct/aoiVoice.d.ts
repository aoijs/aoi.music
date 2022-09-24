import { Collection, Message, Snowflake, TextBasedChannel } from "discord.js";
import { PlayerEvents } from "../typings/enums";
import { Manager } from "./manager";
export declare class AoiVoice<T> {
    #private;
    manager: Manager;
    prunes: Map<Snowflake, {
        message: Message<boolean>;
        channel: TextBasedChannel;
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
    constructor(bot: T);
    addEvent(event: PlayerEvents): void;
    addEvents(...events: PlayerEvents[]): void;
    bindExecutor(executor: Function): void;
}
