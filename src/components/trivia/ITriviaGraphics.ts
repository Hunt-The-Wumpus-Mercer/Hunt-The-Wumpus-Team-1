import type { IPlayer } from "../player/IPlayer";
import type { ITrivia } from "./ITrivia";

export const TriviaChallengeResult = {
    SUCCEEDED: "succeeded",
    FAILED: "failed",
    OUT_OF_COINS: "out_of_coins"
} as const;

export type TriviaChallengeResult = typeof TriviaChallengeResult[keyof typeof TriviaChallengeResult];

export interface ITriviaGraphics {
    /**
     * Presents a trivia challenge and returns the final outcome.
     */
    runChallenge(
        trivia: ITrivia,
        player: IPlayer,
        questionCount: number,
        requiredCorrectAnswers: number,
    ): Promise<TriviaChallengeResult>;

    /**
     * Closes the trivia challenge UI if it is currently open.
     */
    close(): void;
}
