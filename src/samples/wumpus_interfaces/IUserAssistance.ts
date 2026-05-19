export type UserAssistanceTipType = {
    SHOOT_AN_ARROW: 'shoot_an_arrow',
    MOVE_ROOM: 'move_room'
};

export interface IUserAssistance {
    // displays the instructions UI
    showInstructions(): void

    // show a specific tip
    showTip(tipType: UserAssistanceTipType): void

    // show the debug menu, used for manipulating the game
    showDebugMenu(): void
}