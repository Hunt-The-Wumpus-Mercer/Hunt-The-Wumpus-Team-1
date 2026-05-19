import type { CaveRoomDirections } from "../shared/CaveRoomDirections";
import type { TriviaChallengeResult } from "../trivia/ITriviaGraphics";

export interface IGameControl {
    init(containerSelector: string): Promise<void>;
    runTriviaChallenge(questionCount: number, requiredCorrectAnswers: number): Promise<TriviaChallengeResult>;
    movePlayer(caveRoomDirection: CaveRoomDirections): Promise<string>;
    shootArrow(caveRoomDirection: CaveRoomDirections): Promise<string>;
    purchaseArrow(): Promise<string>;
    purchaseSecret(): Promise<string>;
    viewHighScores(): Promise<string>;
}
