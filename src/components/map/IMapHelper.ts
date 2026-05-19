import type { ICave } from "../cave/ICave";
import type { IMap } from "./IMap";

export interface IMapHelper {
    /**
     * Initializes the helper with cave and map dependencies.
     */
    initialize(cave: ICave, map: IMap): void;

    /**
        * Returns hazards in the player's current room.
     * Hazard names are "wumpus", "bat", and "pit".
     * If multiple hazards are present and one is wumpus, wumpus is first.
     */
        getHazardsInPlayerRoom(): string[];

    /**
        * Returns warning messages for hazards in rooms adjacent to the player.
     * Warning messages are unique and may include multiple entries.
     */
        getWarningsNearPlayer(): string[];

    /**
     * Moves the wumpus after a missed shot to a room up to two moves away.
     * Returns the new room number.
     */
    moveWumpusAfterMiss(): number;

    /**
     * Returns a secret fact about current map state.
     */
    getSecret(): string;
}
