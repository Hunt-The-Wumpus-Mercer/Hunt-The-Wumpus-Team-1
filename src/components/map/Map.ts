import type { ICave } from "../cave/ICave";
import type { IMap } from "./IMap";

export class Map implements IMap {
    private bat1Room = -1;
    private bat2Room = -1;
    private pit1Room = -1;
    private pit2Room = -1;
    private wumpusRoom = -1;
    private playerRoom = -1;

    initialize(cave: ICave): void {
        const roomCount = cave.getRoomCount();
        if (roomCount < 5) {
            throw new Error("Cave must have at least 5 rooms to place all game objects.");
        }

        const allRooms = this.buildRoomList(roomCount);
        this.shuffleInPlace(allRooms);

        this.playerRoom = allRooms[0];

        // Place hazards in unique rooms that are not the player's room.
        this.bat1Room = allRooms[1];
        this.bat2Room = allRooms[2];
        this.pit1Room = allRooms[3];
        this.pit2Room = allRooms[4];

        // Wumpus can be in any room except the player's room.
        const wumpusCandidates = allRooms.filter((room) => room !== this.playerRoom);
        this.wumpusRoom = wumpusCandidates[this.randomIndex(wumpusCandidates.length)];
    }

    getBatRooms(): number[] {
        return [this.bat1Room, this.bat2Room];
    }

    getPitRooms(): number[] {
        return [this.pit1Room, this.pit2Room];
    }

    getWumpusRoom(): number {
        return this.wumpusRoom;
    }

    setWumpusRoom(roomNumber: number): void {
        this.wumpusRoom = roomNumber;
    }

    getPlayerRoom(): number {
        return this.playerRoom;
    }

    setPlayerRoom(roomNumber: number): void {
        this.playerRoom = roomNumber;
    }

    private buildRoomList(roomCount: number): number[] {
        return Array.from({ length: roomCount }, (_, index) => index);
    }

    private randomIndex(maxExclusive: number): number {
        return Math.floor(Math.random() * maxExclusive);
    }

    private shuffleInPlace(values: number[]): void {
        for (let i = values.length - 1; i > 0; i--) {
            const j = this.randomIndex(i + 1);
            [values[i], values[j]] = [values[j], values[i]];
        }
    }
}
