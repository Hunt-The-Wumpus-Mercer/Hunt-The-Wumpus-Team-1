export interface IHighScores {
    // adds the high score (if applicable) and returns true if successful
    addHighScore(name: string, score: number): boolean

    // displays high score UI
    viewHighScores(): void
}