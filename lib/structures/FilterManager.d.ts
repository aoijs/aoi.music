import Player from "./Player";
export default class FilterManager {
    filters: object;
    player: Player;
    args: string[];
    constructor(player: Player);
    /**
     * @method addFilters
     * @param  {any[]} ...filters
     * @returns void
     */
    addFilters(filters: object): Promise<object>;
    /**
     * @method removeFilters
     * @param  {any[]} ...filters
     * @returns void
     */
    removeFilters(...filters: any[]): void;
    setFilters(filters: object): Promise<object>;
    resetFilters(): Promise<object>;
    _applyFilters(): Promise<object>;
    seekTo(time: number): Promise<void>;
}
