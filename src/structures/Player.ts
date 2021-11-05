import { VoiceChannel } from "discord.js";
import { joinVoiceChannel } from "../../node_modules/@discordjs/voice/dist";
import { LoopMode, PlayerStates } from "../utils/constants";
import { voiceState } from "../utils/typings";
import { AudioPlayer } from "../../node_modules/@discordjs/voice/dist";
import Manager from "./Manager";
import Queue from "./Queue";

class Player {
    public voiceState: voiceState = {} as any;
    public mode: LoopMode = LoopMode.None;
    public queue: Queue = new Queue();
    private _state: PlayerStates = PlayerStates.Idling;
    private player: AudioPlayer = new AudioPlayer();

    get state() { return PlayerStates[this._state] };
    set state(n) {
        if (this.state === n) return;
        this._state = PlayerStates[n];
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