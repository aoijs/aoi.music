import Player from "../structures/Player";
import { PossibleStream } from "../utils/typings";
declare class Resource {
    p: Player;
    stream: PossibleStream;
    constructor(player: Player, source: PossibleStream);
}
export default Resource;
