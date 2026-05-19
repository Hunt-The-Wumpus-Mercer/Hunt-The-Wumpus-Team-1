import type { CaveRoomDirections } from '../../components/shared/CaveRoomDirections';

export interface IGameControl {

    // moves the player from their current room to the room in the caveRoomDirection
    movePlayer(caveRoomDirection: CaveRoomDirections): void

    // shoots an arrow from the player's current room in the caveRoomDirection
    shootArrow(caveRoomDirection: CaveRoomDirections): void

    purchaseArrow(): void
    purchaseHint(): void
}