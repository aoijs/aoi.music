import Player from "./Player";
import Track from "./Track";
declare class PlayerQueue {
    player: Player;
    list: Track[];
    current: Track;
    previous: Track;
    setPlayer(player: Player): void;
    setCurrent(track: Track): void;
}
export default PlayerQueue;
