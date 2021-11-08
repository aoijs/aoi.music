import Player from "./Player";
import Track from "./Track";
declare class PlayerQueue {
    player: Player;
    list: Track[];
    current: any;
    previus: any;
    setPlayer(player: Player): void;
    setCurrent(track: Track): void;
}
export default PlayerQueue;
