export interface IPlayer {
    /**
     * Returns the player's name.
     */
    getPlayerName(): string;

    /**
     * Sets the player's name.
     */
    setPlayerName(name: string): void;

    /**
     * Returns the number of arrows the player currently has.
     */
    getArrows(): number;

    /**
     * Sets the player's number of arrows.
     */
    setArrows(arrows: number): void;

    /**
     * Returns the number of coins the player currently has.
     */
    getCoins(): number;

    /**
     * Sets the player's number of coins.
     */
    setCoins(coins: number): void;

    /**
     * Returns the number of turns taken so far.
     */
    getTurns(): number;

    /**
     * Increments turns by 1 and returns the new turn count.
     */
    incrementTurns(): number;

    /**
     * Marks that the player has killed the wumpus.
     */
    setWumpusKilled(): void;

    /**
     * Returns the current score:
     * 100 - N + G + (5 * A) + W
     */
    getScore(): number;
}
