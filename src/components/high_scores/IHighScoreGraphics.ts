import type { IHighScores } from "./IHighScores";

export type HighScoreHighlight = {
    name: string;
    score: number;
};

export interface IHighScoreGraphics {
    show(highScores: IHighScores, highlight?: HighScoreHighlight): void;
    close(): void;
}
