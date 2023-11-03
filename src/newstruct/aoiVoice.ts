import {
    Collection,
    Message,
    Snowflake,
    TextBasedChannel,
    VoiceChannel,
} from "discord.js";
import cheerio from "cheerio";
import axios from "axios";
import { shuffle } from "../newutils/helpers";
import { search } from "../newutils/search";
import {
    LoopMode,
    PlatformType,
    PlayerEvents,
    PluginName,
} from "../typings/enums";
import {
    AudioPLayerOptions,
    ManagerConfigurations,
} from "../typings/interfaces";
import { AudioPlayer } from "./audioPlayer";
import { Filter } from "./filter";
import { Manager } from "./manager";
import { CustomFilters } from "../newutils/constants";

export class AoiVoice<T> extends Manager {
    #bot: T;
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
    constructor(bot: T, managerConfig?: ManagerConfigurations) {
        super(managerConfig);
        this.#bot = bot;
        this.prunes = new Map();
        //@ts-ignore
        this.#bot.voiceManager = this;
        this.cmds = {
            [PlayerEvents.TrackStart]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
            [PlayerEvents.TrackEnd]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
            [PlayerEvents.QueueEnd]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
            [PlayerEvents.AudioError]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
            [PlayerEvents.QueueStart]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
            [PlayerEvents.TrackPause]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
            [PlayerEvents.TrackResume]: new Collection<
                Snowflake,
                Record<string, any>
            >(),
        };
        this.#events = [];
        this.#executor = () => {};
        this.#bindFunctions();
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
        this.on(event, (...data: any[]) => {
            const player: AudioPlayer = data.pop();
            this.cmds[event].forEach(async (cmd) => {
                if (!cmd.__compiled__) {
                    let channel: TextBasedChannel;
                    if (cmd.channel.startsWith("$")) {
                        channel = (
                            await this.#executor(
                                this.#bot,
                                {
                                    // @ts-ignore
                                    guild: this.#bot.guilds.cache.get(
                                        player.options.connection.joinConfig
                                            .guildId,
                                    ),
                                    // @ts-ignore
                                    channel: this.#bot.channels.cache.get(
                                        this.prunes.get(
                                            player.options.connection.joinConfig
                                                .guildId,
                                        ).channel,
                                    ),
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
                    channel = this.#bot.channels.cache.get(channel);
                    return await this.#executor(
                        this.#bot,
                        {
                            // @ts-ignore
                            guild: this.#bot.guilds.cache.get(
                                player.options.connection.joinConfig.guildId,
                            ),
                            // @ts-ignore
                            channel: this.#bot.channels.cache.get(
                                this.prunes.get(
                                    player.options.connection.joinConfig
                                        .guildId,
                                ).channel,
                            ),
                        },
                        [],
                        cmd,
                        undefined,
                        false,
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
    async joinVc({
        type = "default",
        voiceChannel,
        textChannel,
        selfDeaf = true,
        selfMute = false,
    }: {
        type: AudioPLayerOptions["type"];
        voiceChannel: VoiceChannel;
        textChannel: Snowflake;
        selfDeaf?: boolean;
        selfMute?: boolean;
    }) {
        await super
            .joinVc({
                type,
                voiceChannel,
                selfDeaf,
                selfMute,
            })
            .catch((e) => false);
        this.prunes.set(voiceChannel.guild.id, {
            message: null,
            channel: textChannel,
        });
        return true;
    }
    #bindFunctions() {
        // @ts-ignore
        if (this.#bot.functionManager) {
            // @ts-ignore
            if (this.#bot.functionManager.createCustomFunction) {
                // @ts-ignore
                this.#bot.functionManager.createFunction =
                    // @ts-ignore
                    this.#bot.functionManager.createCustomFunction;
            }
            //@ts-ignore
            this.#bot.functionManager.createFunction(
                //join
                {
                    name: "$joinVC",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        let [
                            voiceId = d.member.voice.channelId,
                            selfDeaf = "yes",
                            selfMute = "no",
                            speaker = "yes",
                            audioPlayerType = "default",
                            debug = "no",
                        ] = data.inside.splits;

                        const vc = d.util.getChannel(d, voiceId);
                        if (
                            ![
                                d.util.channelTypes.Voice,
                                d.util.channelTypes.Stage,
                            ].includes(vc.type)
                        )
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                { inside: data.inside },
                                "Provided channelID is not Voice/Stage Channel In",
                            );

                        if (!d.client.voiceManager)
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );

                        try {
                            await d.client.voiceManager.joinVc({
                                type: audioPlayerType,
                                voiceChannel: vc,
                                textChannel: d.channel.id,
                                selfMute: selfMute === "yes",
                                selfDeaf: selfDeaf === "yes",
                                debug: debug === "yes",
                            });
                            if (
                                speaker === "yes" &&
                                vc.type === d.util.channelTypes.Stage
                            ) {
                                await (
                                    d.guild.me ?? d.guild.members.me
                                ).voice.setSuppressed(false);
                            }
                        } catch (e) {
                            d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Failed To Join VC With Reason: " + e,
                            );
                        }

                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //leave
                {
                    name: "$leaveVC",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [guildId = d.guild?.id] = data.inside.splits;
                        const guild = await d.util.getGuild(d, guildId);
                        if (!guild) {
                            return d.aoiError.fnError(d, "guild", {
                                inside: data.inside,
                            });
                        }
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        d.client.voiceManager.leaveVc(guild.id);
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //play
                {
                    name: "$playTrack",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [track, type] = data.inside.splits;
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        let tracks: string[] = [];
                        let trackType: number;
                        if (type === "youtube") {
                            tracks = await search(
                                track,
                                PlatformType.Youtube,
                                this,
                            );
                            trackType = PlatformType.Youtube;
                        } else if (type === "soundcloud") {
                            tracks = await search(
                                track,
                                PlatformType.SoundCloud,
                                this,
                            );
                            trackType = PlatformType.SoundCloud;
                        } else if (type === "spotify") {
                            tracks = await search(
                                track,
                                PlatformType.Spotify,
                                this,
                            );
                            trackType = PlatformType.Spotify;
                        } else if (type === "local") {
                            tracks = await search(
                                track,
                                PlatformType.LocalFile,
                                this,
                            );
                            trackType = PlatformType.LocalFile;
                        } else if (type === "url") {
                            tracks = await search(
                                track,
                                PlatformType.Url,
                                this,
                            );
                            trackType = PlatformType.Url;
                        } else {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Invalid Type Provided.",
                            );
                        }
                        if (tracks.length === 0) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "No Tracks Found.",
                            );
                        }
                        await player.add(tracks, trackType, d.member);
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //queue
                {
                    name: "$queue",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [
                            page = 1,
                            limit = 10,
                            format = `{number}) {title} | {requester.user.tag}`,
                        ] = data.inside.splits;
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const hasPlayer = d.client.voiceManager.players.has(
                            d.guild.id,
                        );
                        if (!hasPlayer) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        data.result = player.getQueue(page, limit, format);
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                // autoplay
                {
                    name: "$autoPlay",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [type = "relative"] = data.inside.splits;
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        if (
                            ![
                                "relative",
                                "spotify",
                                "youtube",
                                "soundcloud",
                                "none",
                            ].includes(type.toLowerCase())
                        ) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                { inside: data.inside },
                                "Invalid Type Provided in",
                            );
                        }
                        player.autoPlay = type.toLowerCase();
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //addFilter
                {
                    name: "$addFilter",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [filter] = data.inside.splits;
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        if (!this.plugins.get(PluginName.Filter)) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Filter Plugin Not Found.",
                            );
                        }
                        const ffilter = <Filter>(
                            this.plugins.get(PluginName.Filter)
                        );
                        let parsed = JSON.parse(filter);
                        const keys = Object.keys(parsed);
                        const result = [];
                        for (const key of keys) {
                            if (CustomFilters[key]) {
                                result.push(...CustomFilters[key](parsed[key]));
                            } else {
                                result.push({
                                    filter: key,
                                    value: parsed[key],
                                });
                            }
                        }
                        ffilter.add(result, player);
                        data.result = result;
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //setFilter
                {
                    name: "$setFilter",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [filter] = data.inside.splits;
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        if (!this.plugins.get(PluginName.Filter)) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Filter Plugin Not Found.",
                            );
                        }
                        const ffilter = <Filter>(
                            this.plugins.get(PluginName.Filter)
                        );
                        let parsed = JSON.parse(filter);
                        const keys = Object.keys(parsed);
                        const result = [];
                        for (const key of keys) {
                            if (CustomFilters[key]) {
                                result.push(...CustomFilters[key](parsed[key]));
                            } else {
                                result.push({
                                    filter: key,
                                    value: parsed[key],
                                });
                            }
                        }
                        ffilter.set(result, player);
                        data.result = result;
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //removeFilter
                {
                    name: "$removeFilter",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [filter] = data.inside.splits;
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        if (!this.plugins.get(PluginName.Filter)) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Filter Plugin Not Found.",
                            );
                        }
                        const ffilter = <Filter>(
                            this.plugins.get(PluginName.Filter)
                        );
                        if (CustomFilters[filter]) {
                            for (const f of CustomFilters[filter]()) {
                                ffilter.remove(f.filter, player);
                            }
                        } else {
                            ffilter.remove(filter, player);
                        }
                        data.result = player.filters;
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //resetFilter
                {
                    name: "$resetFilter",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        if (!this.plugins.get(PluginName.Filter)) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Filter Plugin Not Found.",
                            );
                        }
                        const ffilter = <Filter>(
                            this.plugins.get(PluginName.Filter)
                        );

                        ffilter.removeAll(player);
                        data.result = player.filters;
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //getFilters
                {
                    name: "$getFilters",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        if (!this.plugins.get(PluginName.Filter)) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Filter Plugin Not Found.",
                            );
                        }
                        const ffilter = <Filter>(
                            this.plugins.get(PluginName.Filter)
                        );

                        data.result = player.filters;
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //volume
                {
                    name: "$volume",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [volume = "get"] = data.inside.splits;
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        if (volume === "get") {
                            data.result = player.volume;
                        } else {
                            player.volume = Number(volume);
                        }
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //seek
                {
                    name: "$seek",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [time] = data.inside.splits;
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        const ffilter = <Filter>(
                            this.plugins.get(PluginName.Filter)
                        );
                        if (!ffilter) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Filter Plugin Not Found.",
                            );
                        }
                        ffilter.seek(Number(time), player);
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //getCurrentTrackDuration
                {
                    name: "$getCurrentTrackDuration",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        data.result = player.getTrackCurrentDuration();
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //hasplayer
                {
                    name: "$hasPlayer",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }

                        data.result = d.client.voiceManager.players.has(
                            d.guild.id,
                        );
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                // loopMode
                {
                    name: "$loopMode",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [mode = "queue"] = data.inside.splits;
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        if (
                            ![
                                LoopMode.None,
                                LoopMode.Track,
                                LoopMode.Queue,
                            ].includes(mode)
                        ) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Invalid Loop Mode.",
                            );
                        }
                        player.loop = mode;
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //loopStatus
                {
                    name: "$loopStatus",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        data.result = player.loop;
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //ClearQueue
                {
                    name: "$clearQueue",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        player.queue = [];
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //pauseTrack
                {
                    name: "$pauseTrack",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        player.pause();
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //resumeTrack
                {
                    name: "$resumeTrack",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        player.resume();
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                // stopTrack
                {
                    name: "$stopTrack",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        player.stop();
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //skipTrack
                {
                    name: "$skipTrack",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        player.skip();
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                // skipTo
                {
                    name: "$skipTo",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [index] = data.inside.splits;
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        if (isNaN(index)) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Invalid Index.",
                            );
                        }
                        player.skipTo(index);
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                // playPreviousTrack
                {
                    name: "$playPreviousTrack",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        player.playPrevious();
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                // queueLength
                {
                    name: "$queueLength",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        data.result = player.queue.length ?? 0;
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                // voicePing
                {
                    name: "$voicePing",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [type = "ws"] = data.inside.splits;
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        if (!["ws", "upd"].includes(type)) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Invalid Type.",
                            );
                        }
                        data.result = player.getPing(type);
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                // playerStatus
                {
                    name: "$playerStatus",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        data.result = player.player._state.status;
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                // stop
                {
                    name: "$stopPlayer",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        player._destroy();
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                // shuffleQueue
                {
                    name: "$shuffleQueue",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        player.queue = shuffle(player.queue);
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                //unshuffleQueue
                {
                    name: "$unshuffleQueue",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }
                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        player.queue = player.queue.sort(
                            (
                                a: { position: number },
                                b: { position: number },
                            ) => a.position - b.position,
                        );
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                // lyrics
                {
                    name: "$lyrics",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [songTitle, artist, error = "Lyrics not found"] = data.inside.splits;
                        if (!songTitle) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Usage, Provide a song name.",
                            );
                        }
                        const requestOptions = {
                            headers: {
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                                Accept: "text/html",
                            },
                        };

                        async function scrapeLyrics(songTitle: string, artist: string) {
                          const response = await axios.get("https://google.com/search", Object.assign(Object.assign({}, requestOptions), { params: { q: `${artist} ${songTitle} lyrics` } }));
                          const $ = cheerio.load(response.data);
                          const elements = $('[class*="ujudUb"]');

                          const e = elements
                              .map(function () {
                                  $('br').replaceWith('\n');
                                  return $(this).text().trim();
                              }).get();

                            return e.join('\n\n');
                        }

                        const lyrics = await scrapeLyrics(songTitle, artist);
                        data.result = lyrics ? lyrics : error;

                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
                // songInfo
                {
                    name: "$songInfo",
                    type: "djs",
                    code: async (d: any) => {
                        const data = d.util.aoiFunc(d);
                        const [type = "title", position] = data.inside.splits;
                        if (!d.client.voiceManager) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Voice Class Is Not Initialised.",
                            );
                        }

                        const player = d.client.voiceManager.players.get(
                            d.guild.id,
                        );
                        if (!player) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Player Not Found.",
                            );
                        }
                        if (!player.queue.length) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "No Song Is Playing.",
                            );
                        }
                        if (!type) {
                            return d.aoiError.fnError(
                                d,
                                "custom",
                                {},
                                "Invalid Type.",
                            );
                        }
                        const parsedPos = position
                            ? parseInt(position)
                            : player.currentPosition();
                        data.result = eval(
                            `player.queue[${parsedPos}].${type}`,
                        );
                        return {
                            code: d.util.setCode(data),
                        };
                    },
                },
            );
        }
    }
}
