import { GuildMember, TextChannel, VoiceChannel } from "discord.js";
import { joinVoiceChannel, VoiceConnection } from "../../node_modules/@discordjs/voice/dist";
import { LoopMode, PlayerStates } from "../utils/constants";
import { PlayerOptions, voiceState } from "../utils/typings";
import { AudioPlayer, createAudioResource } from "../../node_modules/@discordjs/voice/dist";
import Manager from "./Manager";
import Queue from "./Queue";
import { setTimeout } from 'timers/promises'
import Track from "./Track";
import requestManager from "./requestManager";

class Player {
    public voiceState: voiceState = {} as any;
    public requestManager: requestManager
    public manager: Manager;
    public connection: VoiceConnection;
    public voiceChannel: VoiceChannel;
    public textChannel: TextChannel;
    public mode: LoopMode = LoopMode.None;
    public queue: Queue = new Queue();
    private _state: PlayerStates = PlayerStates.Idling;
    private player: AudioPlayer = new AudioPlayer();
    constructor(data: PlayerOptions) {
        this.connection = data.connection;
        this.voiceChannel = data.voiceChannel;
        this.textChannel = data.textChannel;
        this.manager = data.manager
        this.requestManager = new requestManager(this)
        this.connection.subscribe(this.player)
    }

    get state() { return PlayerStates[this._state] };
    set state(n) {
        if (this.state === n) return;
        this._state = PlayerStates[n];
    }

    /**
     * search
     */
    public async search(query: string, type: number): Promise<any[]> {
        return await this.manager.searchManager.search({ query, type })
    }

    /**
     * addTrack
     */
    public async addTrack({ urls, type, member }: { urls: any[]; type: number; member: GuildMember; }): Promise<void> {
        if (type === 0) {
            for (const url of urls) {
                const info = await this.manager.searchManager.soundCloud.getInfo(url);
                if (!info) {
                    console.error(`Cannot Get Data Of ${url}`);
                    continue;
                }
                const track: Track = new Track({ requestUser: member, rawinfo: info, type })
                this.queue.list.push(track);
                if (this.queue.list.length === 1) {
                    this.queue.setCurrent(track);
                    this.requestManager.setCurrentStream(track)
                    this.play()
                }
                if (this.queue.list.length === 2) {
                    this.requestManager.setNextStream(this.queue.list[1])
                }
                await setTimeout(5000)
            }
        }
        else if (type === 1) {
            for (const url of urls) {
                const info = await this.manager.searchManager.localFile.getInfo(url);
                if (!info) {
                    console.error(`Cannot Get Data Of ${url}`);
                    continue;
                }
                const track: Track = new Track({ requestUser: member, rawinfo: info, type })
                this.queue.list.push(track);
                if (this.queue.list.length === 1) {
                    this.queue.setCurrent(track);
                    this.requestManager.setCurrentStream(track)
                    this.play()
                }
                if (this.queue.list.length === 2) {
                    this.requestManager.setNextStream(this.queue.list[1])
                }
                await setTimeout(5000)
            }
        }
        else if (type === 2) {
            for (const url of urls) {
                const info = await this.manager.searchManager.attachment.getInfo(url);
                if (!info) {
                    console.error(`Cannot Get Data Of ${url}`);
                    continue;
                }
                const track: Track = new Track({ requestUser: member, rawinfo: info, type })
                this.queue.list.push(track);
                if (this.queue.list.length === 1) {
                    this.queue.setCurrent(track);
                    this.requestManager.setCurrentStream(track)
                    this.play()
                }
                if (this.queue.list.length === 2) {
                    this.requestManager.setNextStream(this.queue.list[1])
                }
                await setTimeout(5000)
            }
        }
        else throw new Error(`Invalid Type: '${type}' Provided`);

    }

    play() {
        const stream = this.requestManager.currentStream;
        const resource = createAudioResource(stream)
        this.player.play(resource)
    };

    join(channel: VoiceChannel) {
        this.voiceState.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
            group: channel.client.user.id
        });
        this.voiceState.channel = channel;
    };
}

export default Player;