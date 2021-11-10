import { Queue } from "../utils/decorators/validators";
import Player from "./Player";
import Track from "./Track";

class PlayerQueue {
    public player: Player;
    public list: Track[] = []
    public current: any;
    public previous: any;
    @Queue.validatePlayer()
    setPlayer(player: Player) {
        this.player = player;
    }
    setCurrent(track : Track) {
        this.current = track
    }
}

export default PlayerQueue;