import Player from "../structures/Player";
import { PossibleStream } from "../utils/typings";

class Resource {
  p: Player;
  stream: PossibleStream;
  constructor(player: Player, source: PossibleStream) {
    this.p = player;
    this.stream = source;
  }
}

export default Resource;
