export type QuestionPrompt = {
	question: string;
	answers: string[];
	correctAnswerIndex: number;
};

export interface ITrivia {
	/**
	 * Loads trivia questions from the known CSV source into memory.
	 */
	initialize(): Promise<void>;

	/**
	 * Returns one random question from remaining questions, randomizes answer order,
	 * and removes that question from the remaining pool.
	 */
	getNextQuestion(): QuestionPrompt;

	/**
	 * Returns a hint from one of the remaining questions.
	 */
	getHint(): string;
}