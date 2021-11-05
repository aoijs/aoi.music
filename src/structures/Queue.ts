import { Queue } from "../utils/decorators/validators";
import Player from "./Player";

class PlayerQueue {
    public player: Player;
    public current: any;
    public previus: any;
    @Queue.validatePlayer()
    setPlayer(player: Player) {
        this.player = player;
    }
}

export default PlayerQueue;