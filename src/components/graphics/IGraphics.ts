export interface IGraphics {
    updatePlayerName(name: string): void;
    updateArrowCount(arrows: number): void;
    updateCoinCount(coins: number): void;
    updateTurnCount(turns: number): void;
    updateCurrentRoom(roomNumber: number): void;
    updateRoomExits(adjacentRooms: number[]): void;
    updateWarnings(warnings: string[]): void;
    updateStatusMessage(message: string): void;
    updateSecret(secret: string): void;
    setShootMode(enabled: boolean): void;
    updateScreen(): void;
}
