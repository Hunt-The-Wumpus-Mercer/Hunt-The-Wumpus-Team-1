import type { CaveRoomDirections } from "../shared/CaveRoomDirections";

export interface IGameControl {
    init(containerSelector: string): Promise<void>;
    movePlayer(caveRoomDirection: CaveRoomDirections): string;
    shootArrow(caveRoomDirection: CaveRoomDirections): string;
    purchaseArrow(): string;
    purchaseSecret(): string;
    viewHighScores(): string;
}
