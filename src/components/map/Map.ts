import { MapObjectType, type IMap, type MapObjectType as MapObjectTypeValue } from "./IMap";

export class Map implements IMap {
    private locations: Record<MapObjectTypeValue, number> = {
        [MapObjectType.PLAYER]: -1,
        [MapObjectType.WUMPUS]: -1,
        [MapObjectType.BAT1]: -1,
        [MapObjectType.BAT2]: -1,
        [MapObjectType.PIT1]: -1,
        [MapObjectType.PIT2]: -1,
    };

    getRoomLocation(type: MapObjectTypeValue): number {
        return this.locations[type];
    }

    setRoomLocation(type: MapObjectTypeValue, roomNumber: number): void {
        this.locations[type] = roomNumber;
    }
}
