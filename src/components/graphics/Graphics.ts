import $ from "jquery";
import type { IGraphics } from "./IGraphics";
import type { IGameControl } from "../game_control/IGameControl";
import { CaveRoomDirections } from "../shared/CaveRoomDirections";
import type { CaveRoomDirections as CaveRoomDirection } from "../shared/CaveRoomDirections";

type GraphicsState = {
    playerName: string;
    arrows: number;
    coins: number;
    turns: number;
    currentRoom: number;
    exits: number[];
    warnings: string[];
    statusMessage: string;
    secretMessage: string;
    shootMode: boolean;
};

const DIRECTION_ORDER: CaveRoomDirection[] = [
    CaveRoomDirections.NORTH,
    CaveRoomDirections.NORTHEAST,
    CaveRoomDirections.SOUTHEAST,
    CaveRoomDirections.SOUTH,
    CaveRoomDirections.SOUTHWEST,
    CaveRoomDirections.NORTHWEST
];

const DIRECTION_INDEX: Record<CaveRoomDirection, number> = {
    [CaveRoomDirections.NORTH]: 0,
    [CaveRoomDirections.NORTHEAST]: 1,
    [CaveRoomDirections.SOUTHEAST]: 2,
    [CaveRoomDirections.SOUTH]: 3,
    [CaveRoomDirections.SOUTHWEST]: 4,
    [CaveRoomDirections.NORTHWEST]: 5
};

export class Graphics implements IGraphics {
    private readonly $container: JQuery<HTMLElement>;
    private readonly gameControl: IGameControl;
    private readonly state: GraphicsState = {
        playerName: "Player",
        arrows: 0,
        coins: 0,
        turns: 0,
        currentRoom: 0,
        exits: [-1, -1, -1, -1, -1, -1],
        warnings: [],
        statusMessage: "Welcome to Hunt the Wumpus.",
        secretMessage: "",
        shootMode: false
    };

    constructor(containerSelector: string, gameControl: IGameControl) {
        const $container = $(containerSelector);
        if ($container.length === 0) {
            throw new Error(`Graphics container \"${containerSelector}\" was not found.`);
        }
        this.$container = $container;
        this.gameControl = gameControl;
        this.render();
        this.bindEvents();
        this.updateScreen();
    }

    updatePlayerName(name: string): void {
        this.state.playerName = name;
        this.$container.find("[data-role='player-name']").text(name);
    }

    updateArrowCount(arrows: number): void {
        this.state.arrows = arrows;
        this.$container.find("[data-role='arrows']").text(String(arrows));
    }

    updateCoinCount(coins: number): void {
        this.state.coins = coins;
        this.$container.find("[data-role='coins']").text(String(coins));
    }

    updateTurnCount(turns: number): void {
        this.state.turns = turns;
        this.$container.find("[data-role='turns']").text(String(turns));
    }

    updateCurrentRoom(roomNumber: number): void {
        this.state.currentRoom = roomNumber;
        this.$container.find("[data-role='room-number']").text(String(roomNumber));
    }

    updateRoomExits(adjacentRooms: number[]): void {
        this.state.exits = [...adjacentRooms];
        this.refreshRoomButtons();
    }

    updateWarnings(warnings: string[]): void {
        this.state.warnings = [...new Set(warnings)];
        this.renderWarnings();
    }

    updateStatusMessage(message: string): void {
        this.state.statusMessage = message;
        this.$container.find("[data-role='status']").text(message);
    }

    updateSecret(secret: string): void {
        this.state.secretMessage = secret;
        this.$container.find("[data-role='secret']").text(secret);
    }

    setShootMode(enabled: boolean): void {
        this.state.shootMode = enabled;
        this.refreshShootButton();
    }

    updateScreen(): void {
        this.updatePlayerName(this.state.playerName);
        this.updateArrowCount(this.state.arrows);
        this.updateCoinCount(this.state.coins);
        this.updateTurnCount(this.state.turns);
        this.updateCurrentRoom(this.state.currentRoom);
        this.updateStatusMessage(this.state.statusMessage);
        this.updateSecret(this.state.secretMessage);
        this.refreshRoomButtons();
        this.refreshShootButton();
        this.renderWarnings();
    }

    private render(): void {
        this.$container.html(`
            <section class="wumpus-ui">
                <div class="wumpus-topbar">
                    <div class="stat"><span>Player</span><strong data-role="player-name"></strong></div>
                    <div class="stat"><span>Arrows</span><strong data-role="arrows"></strong></div>
                    <div class="stat"><span>Gold</span><strong data-role="coins"></strong></div>
                    <div class="stat"><span>Turns</span><strong data-role="turns"></strong></div>
                    <div class="stat"><span>Room</span><strong data-role="room-number"></strong></div>
                </div>

                <div class="wumpus-main">
                    <div class="hex-room" data-role="room-control">
                        ${this.buildSideButtonMarkup(CaveRoomDirections.NORTH)}
                        ${this.buildSideButtonMarkup(CaveRoomDirections.NORTHEAST)}
                        ${this.buildSideButtonMarkup(CaveRoomDirections.SOUTHEAST)}
                        ${this.buildSideButtonMarkup(CaveRoomDirections.SOUTH)}
                        ${this.buildSideButtonMarkup(CaveRoomDirections.SOUTHWEST)}
                        ${this.buildSideButtonMarkup(CaveRoomDirections.NORTHWEST)}
                        <div class="room-core">Current Room</div>
                    </div>

                    <aside class="controls-panel">
                        <button class="action-button mode-toggle" data-role="toggle-shoot">Switch to Shoot Mode</button>
                        <button class="action-button" data-role="buy-arrow">Purchase Arrow</button>
                        <button class="action-button" data-role="buy-secret">Purchase Secret</button>
                        <button class="action-button" data-role="view-high-scores">View High Scores</button>
                        <div class="status" data-role="status"></div>
                        <div class="secret" data-role="secret"></div>
                        <ul class="warnings" data-role="warnings"></ul>
                    </aside>
                </div>
            </section>
        `);
    }

    private bindEvents(): void {
        this.$container.on("click", "[data-role='toggle-shoot']", () => {
            this.onToggleShootModeClicked();
        });

        this.$container.on("click", "[data-role='buy-arrow']", () => {
            this.onPurchaseArrowClicked();
        });

        this.$container.on("click", "[data-role='buy-secret']", () => {
            this.onPurchaseSecretClicked();
        });

        this.$container.on("click", "[data-role='view-high-scores']", () => {
            this.onViewHighScoresClicked();
        });

        this.$container.on("click", "[data-direction]", (event) => {
            const directionText = String($(event.currentTarget).data("direction"));
            const direction = directionText as CaveRoomDirection;
            this.onDirectionClicked(direction);
        });
    }

    private onDirectionClicked(direction: CaveRoomDirection): void {
        const directionIndex = DIRECTION_INDEX[direction];
        const hasDoorway = this.state.exits[directionIndex] !== -1;

        if (!hasDoorway) {
            this.updateStatusMessage("Solid wall. Choose a doorway.");
            return;
        }

        if (this.state.shootMode) {
            const status = this.gameControl.shootArrow(direction);
            this.updateStatusMessage(status);
            this.setShootMode(false);
            return;
        }

        const status = this.gameControl.movePlayer(direction);
        this.updateStatusMessage(status);
    }

    private onToggleShootModeClicked(): void {
        this.setShootMode(!this.state.shootMode);
        if (this.state.shootMode) {
            this.updateStatusMessage("Shoot mode active: click a doorway to fire.");
            return;
        }
        this.updateStatusMessage("Walk mode active: click a doorway to move.");
    }

    private onPurchaseArrowClicked(): void {
        const status = this.gameControl.purchaseArrow();
        this.updateStatusMessage(status);
    }

    private onPurchaseSecretClicked(): void {
        const status = this.gameControl.purchaseSecret();
        this.updateStatusMessage(status);
    }

    private onViewHighScoresClicked(): void {
        const status = this.gameControl.viewHighScores();
        this.updateStatusMessage(status);
    }

    private buildSideButtonMarkup(direction: CaveRoomDirection): string {
        const imagePath = this.getImagePath(direction, false);
        return `
            <button class="hex-side ${direction}" data-direction="${direction}" aria-label="${direction}">
                <img src="${imagePath}" alt="${direction} side" />
            </button>
        `;
    }

    private refreshRoomButtons(): void {
        for (const direction of DIRECTION_ORDER) {
            const directionIndex = DIRECTION_INDEX[direction];
            const hasDoorway = this.state.exits[directionIndex] !== -1;
            const imagePath = this.getImagePath(direction, hasDoorway);
            const $button = this.$container.find(`[data-direction='${direction}']`);
            $button.toggleClass("open", hasDoorway);
            $button.find("img").attr("src", imagePath);
        }
    }

    private refreshShootButton(): void {
        const $button = this.$container.find("[data-role='toggle-shoot']");
        if (this.state.shootMode) {
            $button.text("Shoot Mode: ON (Next Click Fires)");
            $button.addClass("shoot-mode-on");
            return;
        }
        $button.text("Switch to Shoot Mode");
        $button.removeClass("shoot-mode-on");
    }

    private renderWarnings(): void {
        const $warnings = this.$container.find("[data-role='warnings']");
        $warnings.empty();

        if (this.state.warnings.length === 0) {
            $warnings.append("<li>No nearby hazards detected.</li>");
            return;
        }

        for (const warning of this.state.warnings) {
            $warnings.append(`<li>${warning}</li>`);
        }
    }

    private getImagePath(direction: CaveRoomDirection, hasDoorway: boolean): string {
        void direction;
        const suffix = hasDoorway ? "door" : "wall";
        return `/ui/hex/${suffix}.svg`;
    }
}
