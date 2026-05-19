import type { ICave } from "./ICave";

const ROOM_COUNT = 30;
const WALL_COUNT = 6;

export class Cave implements ICave {

    // 2D array: rooms[roomNumber] = [wall0, wall1, wall2, wall3, wall4, wall5]
    // Each wall is either a destination room number or -1 (solid wall).
    private rooms: number[][] = [];

    async loadCave(caveName: string): Promise<void> {
        const cavePath = `/caves/${caveName}.csv`;
        const response = await fetch(cavePath);
        if (!response.ok) {
            throw new Error(`Failed to load cave file "${cavePath}": ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        const lines = text.trim().split(/\r?\n/);

        if (lines.length !== ROOM_COUNT) {
            throw new Error(`Cave file must have exactly ${ROOM_COUNT} lines, but got ${lines.length}.`);
        }

        this.rooms = lines.map((line, roomIndex) => {
            const walls = line.split(",").map(s => parseInt(s.trim(), 10));
            if (walls.length !== WALL_COUNT) {
                throw new Error(`Room ${roomIndex} must have exactly ${WALL_COUNT} values, but got ${walls.length}.`);
            }
            return walls;
        });
    }

    getRoomCount(): number {
        return this.rooms.length;
    }

    getAvailableCaves(): string[] {
        return [
            "cave1",
        ];
    }

    getAdjacentRooms(roomNumber: number): number[] {
        if (this.rooms.length === 0) {
            throw new Error("No cave is loaded. Call loadCave() first.");
        }
        if (roomNumber < 0 || roomNumber >= ROOM_COUNT) {
            throw new Error(`Room number must be between 0 and ${ROOM_COUNT - 1}.`);
        }
        return [...this.rooms[roomNumber]];
    }
}
