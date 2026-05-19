export type HighScoreEntry = {
	name: string;
	score: number;
};

export interface IHighScores {
	/** Load high scores from persistent storage. */
	load(): Promise<void>;

	/** Add a score and persist the updated list. */
	addScore(name: string, score: number): Promise<void>;

	/** Get the current high score list (sorted descending). */
	getHighScores(): HighScoreEntry[];
}