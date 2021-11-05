import { TextChannel, VoiceChannel } from "discord.js";
import { joinVoiceChannel, VoiceConnection } from "../../node_modules/@discordjs/voice/dist";
import { LoopMode, PlayerStates } from "../utils/constants";
import { PlayerOptions, voiceState } from "../utils/typings";
import { AudioPlayer } from "../../node_modules/@discordjs/voice/dist";
import Manager from "./Manager";
import Queue from "./Queue";
import {setTimeout} from 'timers/promises'
import Track from "./Track";

class Player {
    public voiceState: voiceState = {} as any;
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
        return await this.manager.searchManager.search(query, type)
    }

    /**
     * addTrack
     */
    public addTrack(urls : any[],type : number) {
        if(type === 0) {
            for(const url of urls){
                const info = this.manager.searchManager.soundCloud.getInfo(url);
                if(!info) {
                    console.error(`Cannot Get Data Of ${url}`);
                    continue;
                }
                //this.queue.list.push(new Track())
            }
        }
    }

    play() {
        this._play(this.queue.current, 0);
    };

    _play(track, startTime: number) {

    }

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