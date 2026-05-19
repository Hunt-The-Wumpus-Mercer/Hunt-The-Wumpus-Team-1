import type { ICave } from "../cave/ICave";
import { MapObjectType, type IMap } from "./IMap";
import type { IMapHelper } from "./IMapHelper";

const HAZARD_WUMPUS = "wumpus";
const HAZARD_BAT = "bat";
const HAZARD_PIT = "pit";

const WARNING_WUMPUS = "I smell a Wumpus!";
const WARNING_BAT = "Bats Nearby.";
const WARNING_PIT = "I feel a draft.";

export class MapHelper implements IMapHelper {
    private cave: ICave | null = null;
    private map: IMap | null = null;

    initialize(cave: ICave, map: IMap): void {
        this.cave = cave;
        this.map = map;
        this.initializeMapObjects();
    }

    getHazardsInPlayerRoom(): string[] {
        const map = this.requireMap();
        const roomNumber = map.getRoomLocation(MapObjectType.PLAYER);
        const hazards: string[] = [];

        if (map.getRoomLocation(MapObjectType.WUMPUS) === roomNumber) {
            hazards.push(HAZARD_WUMPUS);
        }

        if (
            map.getRoomLocation(MapObjectType.BAT1) === roomNumber ||
            map.getRoomLocation(MapObjectType.BAT2) === roomNumber
        ) {
            hazards.push(HAZARD_BAT);
        }

        if (
            map.getRoomLocation(MapObjectType.PIT1) === roomNumber ||
            map.getRoomLocation(MapObjectType.PIT2) === roomNumber
        ) {
            hazards.push(HAZARD_PIT);
        }

        return hazards;
    }

    getWarningsNearPlayer(): string[] {
        const cave = this.requireCave();
        const map = this.requireMap();
        const roomNumber = map.getRoomLocation(MapObjectType.PLAYER);
        const adjacentRooms = this.getValidAdjacentRooms(cave, roomNumber);

        let hasNearbyWumpus = false;
        let hasNearbyBat = false;
        let hasNearbyPit = false;

        for (const adjacentRoom of adjacentRooms) {
            const hazards = this.getHazardsInRoom(adjacentRoom);
            hasNearbyWumpus = hasNearbyWumpus || hazards.includes(HAZARD_WUMPUS);
            hasNearbyBat = hasNearbyBat || hazards.includes(HAZARD_BAT);
            hasNearbyPit = hasNearbyPit || hazards.includes(HAZARD_PIT);
        }

        const warnings: string[] = [];
        if (hasNearbyWumpus) {
            warnings.push(WARNING_WUMPUS);
        }
        if (hasNearbyBat) {
            warnings.push(WARNING_BAT);
        }
        if (hasNearbyPit) {
            warnings.push(WARNING_PIT);
        }

        return warnings;
    }

    moveWumpusAfterMiss(): number {
        const cave = this.requireCave();
        const map = this.requireMap();
        const currentRoom = map.getRoomLocation(MapObjectType.WUMPUS);
        const oneStepRooms = this.getValidAdjacentRooms(cave, currentRoom);
        const candidateRooms = new Set<number>(oneStepRooms);

        for (const room of oneStepRooms) {
            const secondStepRooms = this.getValidAdjacentRooms(cave, room);
            for (const secondRoom of secondStepRooms) {
                candidateRooms.add(secondRoom);
            }
        }

        candidateRooms.delete(currentRoom);

        const moveOptions = Array.from(candidateRooms);
        if (moveOptions.length === 0) {
            return currentRoom;
        }

        const nextRoom = moveOptions[this.randomIndex(moveOptions.length)];
        map.setRoomLocation(MapObjectType.WUMPUS, nextRoom);
        return nextRoom;
    }

    getSecret(): string {
        const map = this.requireMap();
        const bat1Room = map.getRoomLocation(MapObjectType.BAT1);
        const bat2Room = map.getRoomLocation(MapObjectType.BAT2);
        const pit1Room = map.getRoomLocation(MapObjectType.PIT1);
        const pit2Room = map.getRoomLocation(MapObjectType.PIT2);

        const secrets = [
            `The Wumpus is in room ${map.getRoomLocation(MapObjectType.WUMPUS)}.`,
            `The player is in room ${map.getRoomLocation(MapObjectType.PLAYER)}.`,
            `There are bats in room ${bat1Room}.`,
            `There are bats in room ${bat2Room}.`,
            `There is a pit in room ${pit1Room}.`,
            `There is a pit in room ${pit2Room}.`
        ];

        return secrets[this.randomIndex(secrets.length)];
    }

    movePlayerAfterBatEncounter(excludedRooms: number[] = []): number {
        const cave = this.requireCave();
        const map = this.requireMap();
        const currentRoom = map.getRoomLocation(MapObjectType.PLAYER);
        const excludedRoomSet = new Set<number>([currentRoom, ...excludedRooms]);
        const allOtherRooms = Array.from({ length: cave.getRoomCount() }, (_, index) => index + 1)
            .filter((roomNumber) => roomNumber !== currentRoom);
        const candidateRooms = allOtherRooms.filter((roomNumber) => !excludedRoomSet.has(roomNumber));

        const moveOptions = candidateRooms.length > 0 ? candidateRooms : allOtherRooms;

        if (moveOptions.length === 0) {
            return currentRoom;
        }

        const nextRoom = moveOptions[this.randomIndex(moveOptions.length)];
        map.setRoomLocation(MapObjectType.PLAYER, nextRoom);
        return nextRoom;
    }

    private getValidAdjacentRooms(cave: ICave, roomNumber: number): number[] {
        const roomCount = cave.getRoomCount();
        const neighbors = cave.getAdjacentRooms(roomNumber);
        const uniqueNeighbors = new Set<number>();

        for (const neighbor of neighbors) {
            if (neighbor > 0 && neighbor <= roomCount) {
                uniqueNeighbors.add(neighbor);
            }
        }

        return Array.from(uniqueNeighbors);
    }

    private randomIndex(maxExclusive: number): number {
        return Math.floor(Math.random() * maxExclusive);
    }

    private getHazardsInRoom(roomNumber: number): string[] {
        const map = this.requireMap();
        const hazards: string[] = [];

        if (map.getRoomLocation(MapObjectType.WUMPUS) === roomNumber) {
            hazards.push(HAZARD_WUMPUS);
        }

        if (
            map.getRoomLocation(MapObjectType.BAT1) === roomNumber ||
            map.getRoomLocation(MapObjectType.BAT2) === roomNumber
        ) {
            hazards.push(HAZARD_BAT);
        }

        if (
            map.getRoomLocation(MapObjectType.PIT1) === roomNumber ||
            map.getRoomLocation(MapObjectType.PIT2) === roomNumber
        ) {
            hazards.push(HAZARD_PIT);
        }

        return hazards;
    }

    private requireCave(): ICave {
        if (this.cave === null) {
            throw new Error("MapHelper is not initialized. Call initialize(cave, map) first.");
        }
        return this.cave;
    }

    private requireMap(): IMap {
        if (this.map === null) {
            throw new Error("MapHelper is not initialized. Call initialize(cave, map) first.");
        }
        return this.map;
    }

    private initializeMapObjects(): void {
        const cave = this.requireCave();
        const map = this.requireMap();
        const roomCount = cave.getRoomCount();

        if (roomCount < 5) {
            throw new Error("Cave must have at least 5 rooms to place all game objects.");
        }

        const allRooms = Array.from({ length: roomCount }, (_, index) => index + 1);
        this.shuffleInPlace(allRooms);

        const playerRoom = allRooms[0];
        map.setRoomLocation(MapObjectType.PLAYER, playerRoom);
        map.setRoomLocation(MapObjectType.BAT1, allRooms[1]);
        map.setRoomLocation(MapObjectType.BAT2, allRooms[2]);
        map.setRoomLocation(MapObjectType.PIT1, allRooms[3]);
        map.setRoomLocation(MapObjectType.PIT2, allRooms[4]);

        const wumpusCandidates = allRooms.filter((room) => room !== playerRoom);
        map.setRoomLocation(
            MapObjectType.WUMPUS,
            wumpusCandidates[this.randomIndex(wumpusCandidates.length)],
        );
    }

    private shuffleInPlace(values: number[]): void {
        for (let i = values.length - 1; i > 0; i--) {
            const j = this.randomIndex(i + 1);
            [values[i], values[j]] = [values[j], values[i]];
        }
    }
}
