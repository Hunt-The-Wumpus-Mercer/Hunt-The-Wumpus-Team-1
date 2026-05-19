import type { ICave } from "../cave/ICave";
import type { IMap } from "./IMap";
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
    }

    getHazardsInPlayerRoom(): string[] {
        const map = this.requireMap();
        const roomNumber = map.getPlayerRoom();
        const hazards: string[] = [];

        if (map.getWumpusRoom() === roomNumber) {
            hazards.push(HAZARD_WUMPUS);
        }

        if (map.getBatRooms().includes(roomNumber)) {
            hazards.push(HAZARD_BAT);
        }

        if (map.getPitRooms().includes(roomNumber)) {
            hazards.push(HAZARD_PIT);
        }

        return hazards;
    }

    getWarningsNearPlayer(): string[] {
        const cave = this.requireCave();
        const map = this.requireMap();
        const roomNumber = map.getPlayerRoom();
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
        const currentRoom = map.getWumpusRoom();
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
        map.setWumpusRoom(nextRoom);
        return nextRoom;
    }

    getSecret(): string {
        const map = this.requireMap();
        const [bat1Room, bat2Room] = map.getBatRooms();
        const [pit1Room, pit2Room] = map.getPitRooms();

        const secrets = [
            `The Wumpus is in room ${map.getWumpusRoom()}.`,
            `The player is in room ${map.getPlayerRoom()}.`,
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
        const currentRoom = map.getPlayerRoom();
        const excludedRoomSet = new Set<number>([currentRoom, ...excludedRooms]);
        const allOtherRooms = Array.from({ length: cave.getRoomCount() }, (_, index) => index)
            .filter((roomNumber) => roomNumber !== currentRoom);
        const candidateRooms = allOtherRooms.filter((roomNumber) => !excludedRoomSet.has(roomNumber));

        const moveOptions = candidateRooms.length > 0 ? candidateRooms : allOtherRooms;

        if (moveOptions.length === 0) {
            return currentRoom;
        }

        const nextRoom = moveOptions[this.randomIndex(moveOptions.length)];
        map.setPlayerRoom(nextRoom);
        return nextRoom;
    }

    private getValidAdjacentRooms(cave: ICave, roomNumber: number): number[] {
        const roomCount = cave.getRoomCount();
        const neighbors = cave.getAdjacentRooms(roomNumber);
        const uniqueNeighbors = new Set<number>();

        for (const neighbor of neighbors) {
            if (neighbor >= 0 && neighbor < roomCount) {
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

        if (map.getWumpusRoom() === roomNumber) {
            hazards.push(HAZARD_WUMPUS);
        }

        if (map.getBatRooms().includes(roomNumber)) {
            hazards.push(HAZARD_BAT);
        }

        if (map.getPitRooms().includes(roomNumber)) {
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
}
