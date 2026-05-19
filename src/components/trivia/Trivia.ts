import type { ITrivia, QuestionPrompt } from "./ITrivia";

type TriviaEntry = {
    question: string;
    correctAnswer: string;
    wrongAnswers: string[];
    hint: string;
};

const TRIVIA_FILE_PATH = "/trivia/Trivia.csv";

export class Trivia implements ITrivia {
    private remainingQuestions: TriviaEntry[] = [];

    async initialize(): Promise<void> {
        const response = await fetch(TRIVIA_FILE_PATH);
        if (!response.ok) {
            throw new Error(
                `Failed to load trivia from ${TRIVIA_FILE_PATH}: ${response.status} ${response.statusText}`,
            );
        }

        const csv = await response.text();
        this.remainingQuestions = this.parseCsv(csv);
    }

    getNextQuestion(): QuestionPrompt {
        if (this.remainingQuestions.length === 0) {
            throw new Error("No trivia questions remaining.");
        }

        const questionIndex = this.randomIndex(this.remainingQuestions.length);
        const entry = this.remainingQuestions.splice(questionIndex, 1)[0];

        const answers = [entry.correctAnswer, ...entry.wrongAnswers];
        const shuffled = this.shuffleAnswers(answers, 0);

        return {
            question: entry.question,
            answers: shuffled.answers,
            correctAnswerIndex: shuffled.correctAnswerIndex,
        };
    }

    getHint(): string {
        if (this.remainingQuestions.length === 0) {
            throw new Error("No trivia questions remaining for hints.");
        }

        const index = this.randomIndex(this.remainingQuestions.length);
        return this.remainingQuestions[index].hint;
    }

    private parseCsv(csv: string): TriviaEntry[] {
        const lines = csv
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        const entries: TriviaEntry[] = [];
        for (const line of lines) {
            const parts = line.split(",").map((part) => part.trim());
            if (parts.length !== 6) {
                continue;
            }

            const [question, answer1, answer2, answer3, answer4, hint] = parts;
            entries.push({
                question,
                correctAnswer: answer1,
                wrongAnswers: [answer2, answer3, answer4],
                hint,
            });
        }

        return entries;
    }

    private shuffleAnswers(
        answers: string[],
        correctAnswerIndex: number,
    ): { answers: string[]; correctAnswerIndex: number } {
        const indexedAnswers = answers.map((answer, index) => ({
            answer,
            isCorrect: index === correctAnswerIndex,
        }));

        for (let i = indexedAnswers.length - 1; i > 0; i--) {
            const j = this.randomIndex(i + 1);
            [indexedAnswers[i], indexedAnswers[j]] = [indexedAnswers[j], indexedAnswers[i]];
        }

        const shuffledAnswers = indexedAnswers.map((item) => item.answer);
        const shuffledCorrectIndex = indexedAnswers.findIndex((item) => item.isCorrect);

        return {
            answers: shuffledAnswers,
            correctAnswerIndex: shuffledCorrectIndex,
        };
    }

    private randomIndex(maxExclusive: number): number {
        return Math.floor(Math.random() * maxExclusive);
    }
}
