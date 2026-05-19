import type { HighScoreEntry, IHighScores } from "./IHighScores";

const MAX_HIGH_SCORES = 10;
const HIGH_SCORES_FILE_PATH = "/high_scores/HighScores.csv";
const HIGH_SCORES_STORAGE_KEY = "wumpus_high_scores_csv";

export class HighScores implements IHighScores {
    private highScores: HighScoreEntry[] = [];

    async load(): Promise<void> {
        const cachedCsv = this.readCachedCsv();
        if (cachedCsv !== null) {
            this.highScores = this.parseCsv(cachedCsv);
            return;
        }

        const response = await fetch(HIGH_SCORES_FILE_PATH);
        if (!response.ok) {
            throw new Error(
                `Failed to load high scores from ${HIGH_SCORES_FILE_PATH}: ${response.status} ${response.statusText}`,
            );
        }

        const csv = await response.text();
        this.highScores = this.parseCsv(csv);
    }

    async addScore(name: string, score: number): Promise<void> {
        if (this.highScores.length === 0) {
            await this.load();
        }

        const normalizedName = name.trim();
        if (normalizedName.length === 0) {
            throw new Error("Player name cannot be empty.");
        }

        this.highScores.push({ name: normalizedName, score });
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, MAX_HIGH_SCORES);

        const csv = this.toCsv(this.highScores);
        this.cacheCsv(csv);
    }

    getHighScores(): HighScoreEntry[] {
        return this.highScores.map((entry) => ({ ...entry }));
    }

    private parseCsv(csv: string): HighScoreEntry[] {
        const lines = csv
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        const entries: HighScoreEntry[] = [];
        for (const line of lines) {
            const parts = line.split(",");
            if (parts.length !== 2) {
                continue;
            }

            const name = parts[0].trim();
            const score = Number.parseInt(parts[1].trim(), 10);
            if (name.length === 0 || Number.isNaN(score)) {
                continue;
            }

            entries.push({ name, score });
        }

        entries.sort((a, b) => b.score - a.score);
        return entries.slice(0, MAX_HIGH_SCORES);
    }

    private toCsv(entries: HighScoreEntry[]): string {
        return entries.map((entry) => `${entry.name},${entry.score}`).join("\n");
    }

    private readCachedCsv(): string | null {
        if (typeof window === "undefined" || !window.localStorage) {
            return null;
        }
        return window.localStorage.getItem(HIGH_SCORES_STORAGE_KEY);
    }

    private cacheCsv(csv: string): void {
        if (typeof window === "undefined" || !window.localStorage) {
            return;
        }
        window.localStorage.setItem(HIGH_SCORES_STORAGE_KEY, csv);
    }
}
