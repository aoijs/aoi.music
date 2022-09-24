import {
    Collection,
    Message,
    Snowflake,
    TextBasedChannel,
    VoiceChannel,
} from "discord.js";
import { PlayerEvents } from "../typings/enums";
import { AudioPLayerOptions } from "../typings/interfaces";
import { AudioPlayer } from "./audioPlayer";
import { Manager } from "./manager";

export class AoiVoice<T> {
    #bot: T;
    manager: Manager;
    prunes: Map<
        Snowflake,
        {
            message: Message<boolean>;
            channel: Snowflake;
        }
    >;
    cmds: {
        trackStart: Collection<string, Record<string, any>>;
        trackEnd: Collection<string, Record<string, any>>;
        queueEnd: Collection<string, Record<string, any>>;
        audioError: Collection<string, Record<string, any>>;
        queueStart: Collection<string, Record<string, any>>;
        trackPause: Collection<string, Record<string, any>>;
        trackResume: Collection<string, Record<string, any>>;
    };
    #events: PlayerEvents[];
    #executor: Function;
    constructor(bot: T) {
        this.#bot = bot;
        this.manager = new Manager();
        this.prunes = new Map();

        this.cmds = {
            [PlayerEvents.TRACK_START]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
            [PlayerEvents.TRACK_END]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
            [PlayerEvents.QUEUE_END]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
            [PlayerEvents.AUDIO_ERROR]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
            [PlayerEvents.QUEUE_START]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
            [PlayerEvents.TRACK_PAUSE]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
            [PlayerEvents.TRACK_RESUME]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
        };
        this.#events = [];
        this.#executor = () => {};
    }
    addEvent(event: PlayerEvents) {
        this.#events.push(event);
        this.#bindEvents(event);
    }
    addEvents(...events: PlayerEvents[]) {
        this.#events.push(...events);
        for (const event of events) {
            this.#bindEvents(event);
        }
    }
    bindExecutor(executor: Function) {
        this.#executor = executor;
    }
    #bindEvents(event: PlayerEvents) {
        this.manager.on(event, (...data: any[]) => {
            const player: AudioPlayer = data.pop();
            this.cmds[event].forEach(async (cmd) => {
                if (!cmd.__compiled__) {
                    let channel: TextBasedChannel;
                    if (cmd.channel.startsWith("$")) {
                        cmd.channel = (
                            await this.#executor(
                                this.#bot,
                                {
                                    guild: player.options.connection.joinConfig
                                        .guildId,
                                    channel: this.prunes.get(
                                        player.options.connection.joinConfig
                                            .guildId,
                                    ).channel,
                                },
                                [],
                                { code: cmd.channel, name: "NameParser" },
                                undefined,
                                true,
                                undefined,
                                {
                                    data: data[0],
                                    player: player,
                                },
                            )
                        )?.code;
                    }
                    //@ts-ignore
                    channel = this.#bot.channels.cache.get(cmd.channel);
                    return await this.#executor(
                        this.#bot,
                        {
                            guild: player.options.connection.joinConfig.guildId,
                            channel: this.prunes.get(
                                player.options.connection.joinConfig.guildId,
                            ).channel,
                        },
                        [],
                        cmd,
                        undefined,
                        true,
                        channel,
                        {
                            data: data[0],
                        },
                    );
                } else {
                    return await cmd.__compiled__({
                        bot: this.#bot,
                        client: (<any>this.#bot).client,
                        channel: this.prunes.get(
                            player.options.connection.joinConfig.guildId,
                        ).channel,
                        guild: (<any>this.#bot).guilds.cache.get(
                            player.options.connection.joinConfig.guildId,
                        ),
                        player: player,
                    });
                }
            });
            return PlayerEvents[event];
        });
    }
    async joinVc ( {
        type = "default",
        voiceChannel,
        textChannel,
        selfDeaf = true,
        selfMute = false,
    }: {
        type: AudioPLayerOptions[ "type" ];
        voiceChannel: VoiceChannel;
        textChannel: Snowflake;
        selfDeaf?: boolean;
        selfMute?: boolean;
    } )
    {
        await this.manager
            .joinVc({
                type ,
                voiceChannel,
                selfDeaf,
                selfMute,
            })
    };
}
