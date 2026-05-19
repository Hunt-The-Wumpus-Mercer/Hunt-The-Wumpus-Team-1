export type HighScoreEntry = {
	name: string;
	score: number;
};

export interface IHighScores {
	/**
	 * Loads the high score list from the known CSV source.
	 */
	load(): Promise<void>;

	/**
	 * Adds a score, sorts descending, keeps top 10, and persists.
	 */
	addScore(name: string, score: number): Promise<void>;

	/**
	 * Returns the currently loaded high score list.
	 */
	getHighScores(): HighScoreEntry[];
}