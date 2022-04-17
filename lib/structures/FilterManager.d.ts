import Player from "./Player";
export default class FilterManager {
    filters: string[];
    player: Player;
    args: string[];
    constructor(player: Player);
    /**
     * @method addFilters
     * @param  {any[]} ...filters
     * @returns void
     */
    addFilters(filters: object): Promise<string[]>;
    /**
     * @method removeFilters
     * @param  {any[]} ...filters
     * @returns void
     */
    removeFilters(...filters: any[]): void;
    setFilters(filters: object): Promise<string[]>;
    resetFilters(): Promise<string[]>;
    setComplexFilters(filters: string): Promise<void>;
    _applyFilters(): Promise<string[]>;
    seekTo(time: number): Promise<void>;
}
