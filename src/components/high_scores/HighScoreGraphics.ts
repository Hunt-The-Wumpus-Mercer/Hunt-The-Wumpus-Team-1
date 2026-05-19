import $ from "jquery";
import type { IHighScoreGraphics } from "./IHighScoreGraphics";
import type { IHighScores } from "./IHighScores";

export class HighScoreGraphics implements IHighScoreGraphics {
    private $overlay: JQuery<HTMLElement> | null = null;
    private previouslyFocusedElement: HTMLElement | null = null;
    private onCloseCallback: (() => void) | null = null;

    show(highScores: IHighScores, playerName?: string, playerScore?: number, onClose?: () => void): void {
        this.close();
        this.onCloseCallback = onClose ?? null;
        this.previouslyFocusedElement = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        const scores = highScores.getHighScores();
        const $overlay = $("<div>", { class: "high-score-overlay", "data-role": "high-score-overlay" });
        const titleId = "high-score-title";
        const $dialog = $("<div>", {
            class: "high-score-dialog",
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": titleId,
            tabindex: "-1"
        });
        const $title = $("<h2>", { id: titleId, text: "High Scores" });
        const $list = $("<ol>", { class: "high-score-list" });

        if (scores.length === 0) {
            $list.append($("<li>", { class: "high-score-empty", text: "No high scores yet." }));
        } else {
            for (const entry of scores) {
                const isHighlight =
                    playerName !== undefined &&
                    playerScore !== undefined &&
                    entry.name === playerName &&
                    entry.score === playerScore;

                const $item = $("<li>", {
                    class: isHighlight ? "high-score-item high-score-highlight" : "high-score-item"
                });
                const $name = $("span", { class: "high-score-name", text: entry.name });
                const $score = $("span", { class: "high-score-value", text: String(entry.score) });
                $item.append($name, $score);
                $list.append($item);
            }
        }

        const $close = $("button", {
            class: "action-button high-score-close",
            "data-action": "close-high-scores",
            text: "Close"
        });

        $close.on("click", () => this.close());
        $overlay.on("click", (event) => {
            if (event.target === $overlay.get(0)) {
                this.close();
            }
        });

        $(document).on("keydown.high-scores", (event: JQuery.KeyDownEvent) => {
            if (this.$overlay === null) {
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                this.close();
                return;
            }

            if (event.key !== "Tab") {
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

        $dialog.append($title, $list, $close);
        $overlay.append($dialog);
        $("body").append($overlay);

        this.$overlay = $overlay;
        $close.trigger("focus");
    }

    close(): void {
        $(document).off("keydown.high-scores");

        if (this.$overlay !== null) {
            this.$overlay.remove();
            this.$overlay = null;
        }

        if (this.previouslyFocusedElement !== null) {
            this.previouslyFocusedElement.focus();
            this.previouslyFocusedElement = null;
        }

        if (this.onCloseCallback !== null) {
            const callback = this.onCloseCallback;
            this.onCloseCallback = null;
            callback();
        }
    }

    private getFocusableElements(): HTMLElement[] {
        if (this.$overlay === null) {
            return [];
        }

        const selector = [
            "button:not([disabled])",
            "a[href]",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "[tabindex]:not([tabindex='-1'])"
        ].join(",");

        return this.$overlay
            .find(selector)
            .toArray()
            .filter((element): element is HTMLElement => element instanceof HTMLElement);
    }
}
