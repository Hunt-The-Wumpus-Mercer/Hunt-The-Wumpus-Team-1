export interface ICave {
    /**
     * Loads cave data from a CSV file. Each line has 6 comma-separated ints
     * representing the 6 walls of that room: the room number the exit leads to,
     * or -1 if that wall is solid.
     * @param cavePath path to the cave CSV file (relative to the site root, e.g. "/caves/cave1.csv")
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
     * Returns an array of 6 ints representing the 6 walls of the given room.
     * Each entry is either a room number (the exit destination) or -1 (solid wall).
     * @param roomNumber the 0-based index of the room (0–29)
     */
    getAdjacentRooms(roomNumber: number): number[];
}
