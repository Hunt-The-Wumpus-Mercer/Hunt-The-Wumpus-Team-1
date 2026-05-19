export interface IUser_assistance {
    /**
     * Show the tutorial and collect user info before starting the game.
     * @param onComplete Callback with playerName and caveChoice
     * @param availableCaves List of available cave files
     */
    show_instructions(onComplete: (playerName: string, caveChoice: string) => void, availableCaves: string[]): void;
}







