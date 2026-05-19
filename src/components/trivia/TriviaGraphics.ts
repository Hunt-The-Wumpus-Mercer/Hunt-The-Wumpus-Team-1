import $ from "jquery";
import type { IPlayer } from "../player/IPlayer";
import type { ITrivia, QuestionPrompt } from "./ITrivia";
import {
    TriviaChallengeResult,
    type ITriviaGraphics,
    type TriviaChallengeResult as TriviaChallengeOutcome,
} from "./ITriviaGraphics";

type ChallengeState = {
    trivia: ITrivia;
    player: IPlayer;
    totalQuestions: number;
    requiredCorrectAnswers: number;
    askedQuestions: number;
    correctAnswers: number;
    resolve: (result: TriviaChallengeOutcome) => void;
};

export class TriviaGraphics implements ITriviaGraphics {
    private $overlay: JQuery<HTMLElement> | null = null;
    private previouslyFocusedElement: HTMLElement | null = null;
    private state: ChallengeState | null = null;

    runChallenge(
        trivia: ITrivia,
        player: IPlayer,
        questionCount: number,
        requiredCorrectAnswers: number,
    ): Promise<TriviaChallengeOutcome> {
        this.validateChallenge(questionCount, requiredCorrectAnswers);
        this.close();

        this.previouslyFocusedElement = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        return new Promise((resolve) => {
            this.state = {
                trivia,
                player,
                totalQuestions: questionCount,
                requiredCorrectAnswers,
                askedQuestions: 0,
                correctAnswers: 0,
                resolve,
            };

            this.renderShell();
            this.showNextQuestion();
        });
    }

    close(): void {
        $(document).off("keydown.trivia-challenge");

        if (this.$overlay !== null) {
            this.$overlay.remove();
            this.$overlay = null;
        }

        this.state = null;

        if (this.previouslyFocusedElement !== null) {
            this.previouslyFocusedElement.focus();
            this.previouslyFocusedElement = null;
        }
    }

    private renderShell(): void {
        const titleId = "trivia-challenge-title";
        const $overlay = $("<div>", { class: "trivia-overlay", "data-role": "trivia-overlay" });
        const $dialog = $("<div>", {
            class: "trivia-dialog",
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": titleId,
            tabindex: "-1"
        });
        const $title = $("<h2>", { id: titleId, text: "Trivia Challenge" });
        const $progress = $("<p>", { class: "trivia-progress", "data-role": "trivia-progress" });
        const $coins = $("<p>", { class: "trivia-coins", "data-role": "trivia-coins" });
        const $question = $("<p>", { class: "trivia-question", "data-role": "trivia-question" });
        const $feedback = $("<p>", { class: "trivia-feedback", "data-role": "trivia-feedback" });
        const $answers = $("<div>", { class: "trivia-answers", "data-role": "trivia-answers" });

        $(document).on("keydown.trivia-challenge", (event: JQuery.KeyDownEvent) => {
            if (this.$overlay === null || event.key !== "Tab") {
                return;
            }

            const focusableElements = this.getFocusableElements();
            if (focusableElements.length === 0) {
                event.preventDefault();
                $dialog.trigger("focus");
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            const activeElement = document.activeElement;

            if (event.shiftKey && activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
                return;
            }

            if (!event.shiftKey && activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        });

        $dialog.append($title, $progress, $coins, $question, $feedback, $answers);
        $overlay.append($dialog);
        $("body").append($overlay);

        this.$overlay = $overlay;
    }

    private showNextQuestion(): void {
        const state = this.requireState();
        if (state.player.getCoins() <= 0) {
            this.finishChallenge(TriviaChallengeResult.OUT_OF_COINS);
            return;
        }

        if (state.correctAnswers >= state.requiredCorrectAnswers) {
            this.finishChallenge(TriviaChallengeResult.SUCCEEDED);
            return;
        }

        const wrongAnswers = state.askedQuestions - state.correctAnswers;
        const maxWrongAnswers = state.totalQuestions - state.requiredCorrectAnswers;
        if (wrongAnswers > maxWrongAnswers || state.askedQuestions >= state.totalQuestions) {
            this.finishChallenge(TriviaChallengeResult.FAILED);
            return;
        }

        const prompt = this.tryGetNextQuestion(state.trivia);
        if (prompt === null) {
            this.finishChallenge(
                state.correctAnswers >= state.requiredCorrectAnswers
                    ? TriviaChallengeResult.SUCCEEDED
                    : TriviaChallengeResult.FAILED,
            );
            return;
        }

        this.renderQuestion(prompt);
    }

    private renderQuestion(prompt: QuestionPrompt): void {
        const state = this.requireState();
        const player = state.player;
        const $overlay = this.requireOverlay();
        const $progress = $overlay.find("[data-role='trivia-progress']");
        const $coins = $overlay.find("[data-role='trivia-coins']");
        const $question = $overlay.find("[data-role='trivia-question']");
        const $feedback = $overlay.find("[data-role='trivia-feedback']");
        const $answers = $overlay.find("[data-role='trivia-answers']");

        player.setCoins(player.getCoins() - 1);

        $progress.text(
            `Question ${state.askedQuestions + 1} of ${state.totalQuestions} • Correct ${state.correctAnswers}/${state.requiredCorrectAnswers}`,
        );
        $coins.text(`Gold coins remaining: ${player.getCoins()}`);
        $question.text(prompt.question);
        $feedback.text("You paid 1 gold coin to see this question.");
        $answers.empty();

        prompt.answers.forEach((answer, index) => {
            const $button = $("<button>", {
                class: "action-button trivia-answer-button",
                text: answer,
                type: "button"
            });

            $button.on("click", () => {
                this.onAnswerSelected(index, prompt.correctAnswerIndex);
            });

            $answers.append($button);
        });

        const firstButton = $answers.find("button").first();
        if (firstButton.length > 0) {
            firstButton.trigger("focus");
        }
    }

    private onAnswerSelected(selectedIndex: number, correctAnswerIndex: number): void {
        const state = this.requireState();
        state.askedQuestions += 1;

        if (selectedIndex === correctAnswerIndex) {
            state.correctAnswers += 1;
        }

        this.showNextQuestion();
    }

    private finishChallenge(result: TriviaChallengeOutcome): void {
        const state = this.requireState();
        state.resolve(result);
        this.close();
    }

    private tryGetNextQuestion(trivia: ITrivia): QuestionPrompt | null {
        try {
            return trivia.getNextQuestion();
        } catch {
            return null;
        }
    }

    private validateChallenge(questionCount: number, requiredCorrectAnswers: number): void {
        if (questionCount <= 0) {
            throw new Error("questionCount must be greater than 0.");
        }
        if (requiredCorrectAnswers <= 0 || requiredCorrectAnswers > questionCount) {
            throw new Error("requiredCorrectAnswers must be between 1 and questionCount.");
        }
    }

    private requireState(): ChallengeState {
        if (this.state === null) {
            throw new Error("TriviaGraphics is not running a challenge.");
        }
        return this.state;
    }

    private requireOverlay(): JQuery<HTMLElement> {
        if (this.$overlay === null) {
            throw new Error("TriviaGraphics overlay is not available.");
        }
        return this.$overlay;
    }

    private getFocusableElements(): HTMLElement[] {
        if (this.$overlay === null) {
            return [];
        }

        return this.$overlay
            .find("button:not([disabled]), [tabindex]:not([tabindex='-1'])")
            .toArray()
            .filter((element): element is HTMLElement => element instanceof HTMLElement);
    }
}
