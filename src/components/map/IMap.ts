import type { ICave } from "../cave/ICave";

export interface IMap {
    /**
     * Randomly generates starting locations for bats, pits, wumpus, and player.
     */
    initialize(cave: ICave): void;

    /**
     * Returns both bat room numbers.
     */
    getBatRooms(): number[];

    /**
     * Returns both pit room numbers.
     */
    getPitRooms(): number[];

    /**
     * Returns the room number for the wumpus.
     */
    getWumpusRoom(): number;

    /**
     * Sets the room number for the wumpus.
     */
    setWumpusRoom(roomNumber: number): void;

    /**
     * Returns the room number for the player.
     */
    getPlayerRoom(): number;

    /**
     * Sets the room number for the player.
     */
    setPlayerRoom(roomNumber: number): void;
}
