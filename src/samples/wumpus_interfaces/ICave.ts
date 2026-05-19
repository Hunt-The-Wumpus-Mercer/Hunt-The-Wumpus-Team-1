export interface ICave {
    // returns an array containing the connected room number if connected, or 0 if there's a wall, 
    // ordered by direction (North, NorthWest, SouthWest, etc.) 0 if no connection
    getConnectedRooms(roomNumber: number): Array<number>

    // returns an array of the room numbers of adjacent rooms (regardless of whether there's a wall), 
    // ordered by direction (North, NorthWest, SouthWest, etc.)
    getAdjacentRooms(roomNumber: number): Array<number>
}