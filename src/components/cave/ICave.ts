export interface ICave {
    /**
    * Loads cave data from one of the available cave files.
    * Each room has six exits (or walls), represented as room numbers or -1.
     */
    loadCave(caveName: string): Promise<void>;

    /**
     * Returns the list of cave file paths that can be loaded.
     */
    getAvailableCaves(): string[];

    /**
     * Returns the number of rooms in the currently loaded cave.
     */
    getRoomCount(): number;

    /**
     * Returns six adjacent room entries for the given room.
     * Each entry is either a destination room number or -1 for a wall.
     */
    getAdjacentRooms(roomNumber: number): number[];
}
