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
var _AoiVoice_instances, _AoiVoice_bot, _AoiVoice_events, _AoiVoice_executor, _AoiVoice_bindEvents;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AoiVoice = void 0;
const discord_js_1 = require("discord.js");
const enums_1 = require("../typings/enums");
const manager_1 = require("./manager");
class AoiVoice {
    constructor(bot) {
        _AoiVoice_instances.add(this);
        _AoiVoice_bot.set(this, void 0);
        _AoiVoice_events.set(this, void 0);
        _AoiVoice_executor.set(this, void 0);
        __classPrivateFieldSet(this, _AoiVoice_bot, bot, "f");
        this.manager = new manager_1.Manager();
        this.prunes = new Map();
        this.cmds = {
            [enums_1.PlayerEvents.TRACK_START]: new discord_js_1.Collection(),
            [enums_1.PlayerEvents.TRACK_END]: new discord_js_1.Collection(),
            [enums_1.PlayerEvents.QUEUE_END]: new discord_js_1.Collection(),
            [enums_1.PlayerEvents.AUDIO_ERROR]: new discord_js_1.Collection(),
            [enums_1.PlayerEvents.QUEUE_START]: new discord_js_1.Collection(),
            [enums_1.PlayerEvents.TRACK_PAUSE]: new discord_js_1.Collection(),
            [enums_1.PlayerEvents.TRACK_RESUME]: new discord_js_1.Collection(),
        };
        __classPrivateFieldSet(this, _AoiVoice_events, [], "f");
        __classPrivateFieldSet(this, _AoiVoice_executor, () => { }, "f");
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
        await this.manager
            .joinVc({
            type,
            voiceChannel,
            selfDeaf,
            selfMute,
        });
    }
    ;
}
exports.AoiVoice = AoiVoice;
_AoiVoice_bot = new WeakMap(), _AoiVoice_events = new WeakMap(), _AoiVoice_executor = new WeakMap(), _AoiVoice_instances = new WeakSet(), _AoiVoice_bindEvents = function _AoiVoice_bindEvents(event) {
    this.manager.on(event, (...data) => {
        const player = data.pop();
        this.cmds[event].forEach(async (cmd) => {
            if (!cmd.__compiled__) {
                let channel;
                if (cmd.channel.startsWith("$")) {
                    cmd.channel = (await __classPrivateFieldGet(this, _AoiVoice_executor, "f").call(this, __classPrivateFieldGet(this, _AoiVoice_bot, "f"), {
                        guild: player.options.connection.joinConfig
                            .guildId,
                        channel: this.prunes.get(player.options.connection.joinConfig
                            .guildId).channel,
                    }, [], { code: cmd.channel, name: "NameParser" }, undefined, true, undefined, {
                        data: data[0],
                        player: player,
                    }))?.code;
                }
                //@ts-ignore
                channel = __classPrivateFieldGet(this, _AoiVoice_bot, "f").channels.cache.get(cmd.channel);
                return await __classPrivateFieldGet(this, _AoiVoice_executor, "f").call(this, __classPrivateFieldGet(this, _AoiVoice_bot, "f"), {
                    guild: player.options.connection.joinConfig.guildId,
                    channel: this.prunes.get(player.options.connection.joinConfig.guildId).channel,
                }, [], cmd, undefined, true, channel, {
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
};
//# sourceMappingURL=aoiVoice.js.map