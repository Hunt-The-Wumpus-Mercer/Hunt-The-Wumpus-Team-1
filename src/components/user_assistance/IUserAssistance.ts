export interface IUserAssistance {
    /**
     * Displays the tutorial/startup UI and collects player name and cave choice.
     */
    showInstructions(
        onComplete: (playerName: string, caveChoice: string) => void,
        availableCaves: string[],
    ): void;
}







