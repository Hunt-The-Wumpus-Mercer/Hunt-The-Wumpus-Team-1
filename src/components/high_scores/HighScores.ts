import { HighScoreEntry, IHighScores } from './IHighScores';

export default class HighScores implements IHighScores {
    private storageKey = 'highscores';
    private maxEntries = 10;
    private scores: HighScoreEntry[] = [];

    constructor(maxEntries?: number, storageKey?: string) {
        if (maxEntries && maxEntries > 0) this.maxEntries = maxEntries;
        if (storageKey) this.storageKey = storageKey;
    }

    async load(): Promise<void> {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(this.storageKey) : null;
        if (!raw) {
            this.scores = [];
            return;
        }

        try {
            const parsed = JSON.parse(raw) as HighScoreEntry[];
            this.scores = Array.isArray(parsed)
                ? parsed.slice().sort((a, b) => b.score - a.score).slice(0, this.maxEntries)
                : [];
        } catch {
            this.scores = [];
        }
    }

    async addScore(name: string, score: number): Promise<void> {
        await this.load();
        this.scores.push({ name, score });
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, this.maxEntries);

        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
            }
        } catch {
            // ignore storage errors
        }
    }

    getHighScores(): HighScoreEntry[] {
        return this.scores.slice();
    }
}
