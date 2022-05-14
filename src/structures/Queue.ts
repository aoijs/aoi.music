import { Queue } from "../utils/decorators/validators";
import Player from "./Player";
import Track from "./Track";

class PlayerQueue {
  public player: Player;
  public list: Track[] = [];
  public current: Track = null;
  public previous: Track = null;
  @Queue.validatePlayer()
  setPlayer(player: Player): void {
    this.player = player;
  }
  setCurrent(track: Track) {
    this.current = track;
  }
  reOrder() {
    this.list.forEach((x, y) => {
      x.position = y;
    });
  }
  originalOrder() {
        this.list = this.list.sort((a, b) => a._ogPos - b._ogPos);
        this.reOrder();
  }
}

export default PlayerQueue;
