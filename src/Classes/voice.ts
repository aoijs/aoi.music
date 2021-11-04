import { K, V, YTOptions, SCOptions, CacheOptions, Client } from '../TypeDef/VoiceTypes'
import { Events } from '../Utils/EventTypes';

import voice from '@discordjs/voice';

import ServerManager from './serverManager';
export default class Voice {
    client: Client;
    servers: Map<K, V>;
    voice: any;
    functionManager: any;
    ytOptions: YTOptions;
    scOptions: SCOptions;
    cacheOptions: CacheOptions;
    cmd: Record<string, Map<K, V>>;
    constructor(client: Client, ytOptions: YTOptions, scOptions: SCOptions, cacheOptions: CacheOptions) {
        this.client = client;
        this.servers = new Map();
        this.voice = client.voice;
        this.functionManager = client.functionManager;
        this.ytOptions = ytOptions;
        this.scOptions = scOptions;
        this.cacheOptions = cacheOptions;
        this.createCommands()
    }
    private createCommands() {
        Object.keys(Events).forEach(event => {
            this.cmd[event] = new Map()
        });
    }
    /**
     * @method events
     * @readonly
     * @description returns Events
     */
    public get events(): string[] {
        return Object.values(Events);
    }
    /**
     * joinVc
     */
    public async joinVc(channel: Record<string, any>, textChannel: Record<string, any>, debug = false) {
        const d = {
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
            debug: debug,
            group: this.client.user.id
        }

        const connection = voice.joinVoiceChannel(d)
        if (debug) {
            connection.on("debug", console.log)
        }
        connection.on('error', console.error)
        try {
            await voice.entersState(connection, voice.VoiceConnectionStatus.Ready, 30000)
            this.servers.set(channel.guild.id, new ServerManager({ connection, channel, textChannel, voice: this }))
        }
        catch (error) {

            connection.destroy()
            console.error("joinVoiceChannelError: " + error);
        }
    }
}