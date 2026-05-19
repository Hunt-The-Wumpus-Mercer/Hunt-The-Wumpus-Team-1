import type { IHighScores } from "./IHighScores";

export type HighScoreHighlight = {
    name: string;
    score: number;
};

export interface IHighScoreGraphics {
    /**
     * Opens the high score modal.
     * Optionally highlights one score and runs a callback when closed.
     */
    show(highScores: IHighScores, highlight?: HighScoreHighlight, onClose?: () => void): void;

    /**
     * Closes the high score modal if it is open.
     */
    close(): void;
}
