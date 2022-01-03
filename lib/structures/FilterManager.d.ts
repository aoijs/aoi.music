import Player from "./Player";
export default class FilterManager {
    filters: object;
    player: Player;
    args: any[];
    seekTo: number;
    constructor(player: Player);
    /**
     * @method addFilters
     * @param  {any[]} ...filters
     * @returns void
     */
    addFilters(filters: object): Promise<any[]>;
    /**
     * @method removeFilters
     * @param  {any[]} ...filters
     * @returns void
     */
    removeFilters(...filters: any[]): void;
    _applyFilters(): Promise<any[]>;
}
