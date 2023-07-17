"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AoiVoice_instances, _AoiVoice_bot, _AoiVoice_events, _AoiVoice_executor, _AoiVoice_bindEvents, _AoiVoice_bindFunctions;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AoiVoice = void 0;
const discord_js_1 = require("discord.js");
const helpers_1 = require("../newutils/helpers");
const search_1 = require("../newutils/search");
const enums_1 = require("../typings/enums");
const manager_1 = require("./manager");
const constants_1 = require("../newutils/constants");
class AoiVoice extends manager_1.Manager {
    constructor(bot, managerConfig) {
        super(managerConfig);
        _AoiVoice_instances.add(this);
        _AoiVoice_bot.set(this, void 0);
        _AoiVoice_events.set(this, void 0);
        _AoiVoice_executor.set(this, void 0);
        __classPrivateFieldSet(this, _AoiVoice_bot, bot, "f");
        this.prunes = new Map();
        //@ts-ignore
        __classPrivateFieldGet(this, _AoiVoice_bot, "f").voiceManager = this;
        this.cmds = {
            [enums_1.PlayerEvents.TrackStart]: new discord_js_1.Collection(),
            [enums_1.PlayerEvents.TrackEnd]: new discord_js_1.Collection(),
            [enums_1.PlayerEvents.QueueEnd]: new discord_js_1.Collection(),
            [enums_1.PlayerEvents.AudioError]: new discord_js_1.Collection(),
            [enums_1.PlayerEvents.QueueStart]: new discord_js_1.Collection(),
            [enums_1.PlayerEvents.TrackPause]: new discord_js_1.Collection(),
            [enums_1.PlayerEvents.TrackResume]: new discord_js_1.Collection(),
        };
        __classPrivateFieldSet(this, _AoiVoice_events, [], "f");
        __classPrivateFieldSet(this, _AoiVoice_executor, () => { }, "f");
        __classPrivateFieldGet(this, _AoiVoice_instances, "m", _AoiVoice_bindFunctions).call(this);
    }
    addEvent(event) {
        __classPrivateFieldGet(this, _AoiVoice_events, "f").push(event);
        __classPrivateFieldGet(this, _AoiVoice_instances, "m", _AoiVoice_bindEvents).call(this, event);
    }
    addEvents(...events) {
        __classPrivateFieldGet(this, _AoiVoice_events, "f").push(...events);
        for (const event of events) {
            __classPrivateFieldGet(this, _AoiVoice_instances, "m", _AoiVoice_bindEvents).call(this, event);
        }
    }
    bindExecutor(executor) {
        __classPrivateFieldSet(this, _AoiVoice_executor, executor, "f");
    }
    async joinVc({ type = "default", voiceChannel, textChannel, selfDeaf = true, selfMute = false, }) {
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
}
exports.AoiVoice = AoiVoice;
_AoiVoice_bot = new WeakMap(), _AoiVoice_events = new WeakMap(), _AoiVoice_executor = new WeakMap(), _AoiVoice_instances = new WeakSet(), _AoiVoice_bindEvents = function _AoiVoice_bindEvents(event) {
    this.on(event, (...data) => {
        const player = data.pop();
        this.cmds[event].forEach(async (cmd) => {
            if (!cmd.__compiled__) {
                let channel;
                if (cmd.channel.startsWith("$")) {
                    channel = (await __classPrivateFieldGet(this, _AoiVoice_executor, "f").call(this, __classPrivateFieldGet(this, _AoiVoice_bot, "f"), {
                        // @ts-ignore
                        guild: __classPrivateFieldGet(this, _AoiVoice_bot, "f").guilds.cache.get(player.options.connection.joinConfig
                            .guildId),
                        // @ts-ignore
                        channel: __classPrivateFieldGet(this, _AoiVoice_bot, "f").channels.cache.get(this.prunes.get(player.options.connection.joinConfig
                            .guildId).channel),
                    }, [], { code: cmd.channel, name: "NameParser" }, undefined, true, undefined, {
                        data: data[0],
                        player: player,
                    }))?.code;
                }
                //@ts-ignore
                channel = __classPrivateFieldGet(this, _AoiVoice_bot, "f").channels.cache.get(channel);
                return await __classPrivateFieldGet(this, _AoiVoice_executor, "f").call(this, __classPrivateFieldGet(this, _AoiVoice_bot, "f"), {
                    // @ts-ignore
                    guild: __classPrivateFieldGet(this, _AoiVoice_bot, "f").guilds.cache.get(player.options.connection.joinConfig.guildId),
                    // @ts-ignore
                    channel: __classPrivateFieldGet(this, _AoiVoice_bot, "f").channels.cache.get(this.prunes.get(player.options.connection.joinConfig
                        .guildId).channel),
                }, [], cmd, undefined, false, channel, {
                    data: data[0],
                });
            }
            else {
                return await cmd.__compiled__({
                    bot: __classPrivateFieldGet(this, _AoiVoice_bot, "f"),
                    client: __classPrivateFieldGet(this, _AoiVoice_bot, "f").client,
                    channel: this.prunes.get(player.options.connection.joinConfig.guildId).channel,
                    guild: __classPrivateFieldGet(this, _AoiVoice_bot, "f").guilds.cache.get(player.options.connection.joinConfig.guildId),
                    player: player,
                });
            }
        });
        return enums_1.PlayerEvents[event];
    });
}, _AoiVoice_bindFunctions = function _AoiVoice_bindFunctions() {
    // @ts-ignore
    if (__classPrivateFieldGet(this, _AoiVoice_bot, "f").functionManager) {
        // @ts-ignore
        if (__classPrivateFieldGet(this, _AoiVoice_bot, "f").functionManager.createCustomFunction) {
            // @ts-ignore
            __classPrivateFieldGet(this, _AoiVoice_bot, "f").functionManager.createFunction =
                // @ts-ignore
                __classPrivateFieldGet(this, _AoiVoice_bot, "f").functionManager.createCustomFunction;
        }
        //@ts-ignore
        __classPrivateFieldGet(this, _AoiVoice_bot, "f").functionManager.createFunction(
        //join
        {
            name: "$joinVC",
            type: "djs",
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                let [voiceId = d.member.voice.channelId, selfDeaf = "yes", selfMute = "no", speaker = "yes", audioPlayerType = "default", debug = "no",] = data.inside.splits;
                const vc = d.util.getChannel(d, voiceId);
                if (![
                    d.util.channelTypes.Voice,
                    d.util.channelTypes.Stage,
                ].includes(vc.type))
                    return d.aoiError.fnError(d, "custom", { inside: data.inside }, "Provided channelID is not Voice/Stage Channel In");
                if (!d.client.voiceManager)
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                try {
                    await d.client.voiceManager.joinVc({
                        type: audioPlayerType,
                        voiceChannel: vc,
                        textChannel: d.channel.id,
                        selfMute: selfMute === "yes",
                        selfDeaf: selfDeaf === "yes",
                        debug: debug === "yes",
                    });
                    if (speaker === "yes" &&
                        vc.type === d.util.channelTypes.Stage) {
                        await (d.guild.me ?? d.guild.members.me).voice.setSuppressed(false);
                    }
                }
                catch (e) {
                    d.aoiError.fnError(d, "custom", {}, "Failed To Join VC With Reason: " + e);
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                const [guildId = d.guild?.id] = data.inside.splits;
                const guild = await d.util.getGuild(d, guildId);
                if (!guild) {
                    return d.aoiError.fnError(d, "guild", {
                        inside: data.inside,
                    });
                }
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                const [track, type] = data.inside.splits;
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                let tracks = [];
                let trackType;
                if (type === "youtube") {
                    tracks = await (0, search_1.search)(track, enums_1.PlatformType.Youtube, this);
                    trackType = enums_1.PlatformType.Youtube;
                }
                else if (type === "soundcloud") {
                    tracks = await (0, search_1.search)(track, enums_1.PlatformType.SoundCloud, this);
                    trackType = enums_1.PlatformType.SoundCloud;
                }
                else if (type === "spotify") {
                    tracks = await (0, search_1.search)(track, enums_1.PlatformType.Spotify, this);
                    trackType = enums_1.PlatformType.Spotify;
                }
                else if (type === "local") {
                    tracks = await (0, search_1.search)(track, enums_1.PlatformType.LocalFile, this);
                    trackType = enums_1.PlatformType.LocalFile;
                }
                else if (type === "url") {
                    tracks = await (0, search_1.search)(track, enums_1.PlatformType.Url, this);
                    trackType = enums_1.PlatformType.Url;
                }
                else {
                    return d.aoiError.fnError(d, "custom", {}, "Invalid Type Provided.");
                }
                if (tracks.length === 0) {
                    return d.aoiError.fnError(d, "custom", {}, "No Tracks Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                const [page = 1, limit = 10, format = `{number}) {title} | {requester.user.tag}`,] = data.inside.splits;
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const hasPlayer = d.client.voiceManager.players.has(d.guild.id);
                if (!hasPlayer) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                const [type = "relative"] = data.inside.splits;
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                if (![
                    "relative",
                    "spotify",
                    "youtube",
                    "soundcloud",
                    "none",
                ].includes(type.toLowerCase())) {
                    return d.aoiError.fnError(d, "custom", { inside: data.inside }, "Invalid Type Provided in");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                const [filter] = data.inside.splits;
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                if (!this.plugins.get(enums_1.PluginName.Filter)) {
                    return d.aoiError.fnError(d, "custom", {}, "Filter Plugin Not Found.");
                }
                const ffilter = (this.plugins.get(enums_1.PluginName.Filter));
                let parsed = JSON.parse(filter);
                const keys = Object.keys(parsed);
                const result = [];
                for (const key of keys) {
                    if (constants_1.CustomFilters[key]) {
                        result.push(...constants_1.CustomFilters[key](parsed[key]));
                    }
                    else {
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                const [filter] = data.inside.splits;
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                if (!this.plugins.get(enums_1.PluginName.Filter)) {
                    return d.aoiError.fnError(d, "custom", {}, "Filter Plugin Not Found.");
                }
                const ffilter = (this.plugins.get(enums_1.PluginName.Filter));
                let parsed = JSON.parse(filter);
                const keys = Object.keys(parsed);
                const result = [];
                for (const key of keys) {
                    if (constants_1.CustomFilters[key]) {
                        result.push(...constants_1.CustomFilters[key](parsed[key]));
                    }
                    else {
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                const [filter] = data.inside.splits;
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                if (!this.plugins.get(enums_1.PluginName.Filter)) {
                    return d.aoiError.fnError(d, "custom", {}, "Filter Plugin Not Found.");
                }
                const ffilter = (this.plugins.get(enums_1.PluginName.Filter));
                if (constants_1.CustomFilters[filter]) {
                    for (const f of constants_1.CustomFilters[filter]()) {
                        ffilter.remove(f.filter, player);
                    }
                }
                else {
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                if (!this.plugins.get(enums_1.PluginName.Filter)) {
                    return d.aoiError.fnError(d, "custom", {}, "Filter Plugin Not Found.");
                }
                const ffilter = (this.plugins.get(enums_1.PluginName.Filter));
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                if (!this.plugins.get(enums_1.PluginName.Filter)) {
                    return d.aoiError.fnError(d, "custom", {}, "Filter Plugin Not Found.");
                }
                const ffilter = (this.plugins.get(enums_1.PluginName.Filter));
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                const [volume = "get"] = data.inside.splits;
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                if (volume === "get") {
                    data.result = player.volume;
                }
                else {
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                const [time] = data.inside.splits;
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                const ffilter = (this.plugins.get(enums_1.PluginName.Filter));
                if (!ffilter) {
                    return d.aoiError.fnError(d, "custom", {}, "Filter Plugin Not Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                data.result = d.client.voiceManager.players.has(d.guild.id);
                return {
                    code: d.util.setCode(data),
                };
            },
        }, 
        // loopMode
        {
            name: "$loopMode",
            type: "djs",
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                const [mode = "queue"] = data.inside.splits;
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                if (![
                    enums_1.LoopMode.None,
                    enums_1.LoopMode.Track,
                    enums_1.LoopMode.Queue,
                ].includes(mode)) {
                    return d.aoiError.fnError(d, "custom", {}, "Invalid Loop Mode.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                const [index] = data.inside.splits;
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                if (isNaN(index)) {
                    return d.aoiError.fnError(d, "custom", {}, "Invalid Index.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                const [type = "ws"] = data.inside.splits;
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                if (!["ws", "upd"].includes(type)) {
                    return d.aoiError.fnError(d, "custom", {}, "Invalid Type.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
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
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                player.queue = (0, helpers_1.shuffle)(player.queue);
                return {
                    code: d.util.setCode(data),
                };
            },
        }, 
        //unshuffleQueue
        {
            name: "$unshuffleQueue",
            type: "djs",
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                player.queue = player.queue.sort((a, b) => a.position - b.position);
                return {
                    code: d.util.setCode(data),
                };
            },
        }, 
        // songInfo
        {
            name: "$songInfo",
            type: "djs",
            code: async (d) => {
                const data = d.util.aoiFunc(d);
                const [type = "title", position] = data.inside.splits;
                if (!d.client.voiceManager) {
                    return d.aoiError.fnError(d, "custom", {}, "Voice Class Is Not Initialised.");
                }
                const player = d.client.voiceManager.players.get(d.guild.id);
                if (!player) {
                    return d.aoiError.fnError(d, "custom", {}, "Player Not Found.");
                }
                if (!player.queue.length) {
                    return d.aoiError.fnError(d, "custom", {}, "No Song Is Playing.");
                }
                if (!type) {
                    return d.aoiError.fnError(d, "custom", {}, "Invalid Type.");
                }
                const parsedPos = position
                    ? parseInt(position)
                    : player.currentPosition();
                data.result = eval(`player.queue[${parsedPos}].${type}`);
                return {
                    code: d.util.setCode(data),
                };
            },
        });
    }
};
//# sourceMappingURL=aoiVoice.js.map