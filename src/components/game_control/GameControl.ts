import type { IGameControl } from "./IGameControl";
import type { CaveRoomDirections } from "../shared/CaveRoomDirections";
import { Cave } from "../cave/Cave";
import type { ICave } from "../cave/ICave";
import { Map } from "../map/Map";
import type { IMap } from "../map/IMap";
import { Player } from "../player/Player";
import type { IPlayer } from "../player/IPlayer";
import { Trivia } from "../trivia/Trivia";
import type { ITrivia } from "../trivia/ITrivia";
import { TriviaGraphics } from "../trivia/TriviaGraphics";
import {
    TriviaChallengeResult,
    type ITriviaGraphics,
    type TriviaChallengeResult as TriviaChallengeOutcome,
} from "../trivia/ITriviaGraphics";
import { HighScores } from "../high_scores/HighScores";
import type { IHighScores } from "../high_scores/IHighScores";
import { HighScoreGraphics } from "../high_scores/HighScoreGraphics";
import type { IHighScoreGraphics } from "../high_scores/IHighScoreGraphics";
import { MapHelper } from "../map/MapHelper";
import type { IMapHelper } from "../map/IMapHelper";

import { Graphics } from "../graphics/Graphics";
import type { IGraphics } from "../graphics/IGraphics";
import { UserAssistance } from "../user_assistance/UserAssistance";
import { SoundManager } from "../sound/SoundManager";
import { SoundEventType, type ISoundManager } from "../sound/ISoundManager";

const DIRECTION_INDEX: Record<CaveRoomDirections, number> = {
    north: 0,
    northeast: 1,
    southeast: 2,
    south: 3,
    southwest: 4,
    northwest: 5
};

export class GameControl implements IGameControl {
    private cave: ICave | null = null;
    private map: IMap | null = null;
    private player: IPlayer | null = null;
    private trivia: ITrivia | null = null;
    private triviaGraphics: ITriviaGraphics | null = null;
    private highScores: IHighScores | null = null;
    private highScoreGraphics: IHighScoreGraphics | null = null;
    private mapHelper: IMapHelper | null = null;
    private graphics: IGraphics | null = null;
    private soundManager: ISoundManager | null = null;
    private gameOver = false;
    private gameOverStatus = "";

    async init(containerSelector: string): Promise<void> {
        const cave = new Cave();
        const map = new Map();
        const player = new Player();
        const trivia = new Trivia();
        const triviaGraphics = new TriviaGraphics();
        const highScores = new HighScores();
        const highScoreGraphics = new HighScoreGraphics();
        const mapHelper = new MapHelper();
        const userAssistance = new UserAssistance();

        const availableCaves = cave.getAvailableCaves();
        if (availableCaves.length === 0) {
            throw new Error("No cave files are available.");
        }

        // Show tutorial and get user info before starting game
        await new Promise<void>((resolve) => {
            userAssistance.showInstructions((playerName, caveChoice) => {
                void (async () => {
                    await cave.loadCave(caveChoice);
                    map.initialize(cave);
                    player.setPlayerName(playerName);
                    player.setCoins(2);
                    await Promise.all([trivia.initialize(), highScores.load()]);
                    mapHelper.initialize(cave, map);
                    this.cave = cave;
                    this.map = map;
                    this.player = player;
                    this.trivia = trivia;
                    this.triviaGraphics = triviaGraphics;
                    this.highScores = highScores;
                    this.highScoreGraphics = highScoreGraphics;
                    this.mapHelper = mapHelper;
                    this.graphics = new Graphics(containerSelector, this);
                    this.soundManager = new SoundManager(caveChoice);
                    this.refreshGraphicsState("Walk mode active: click a doorway to move.");
                    resolve();
                })();
            }, availableCaves);
        });
    }

    async runTriviaChallenge(
        questionCount: number,
        requiredCorrectAnswers: number,
    ): Promise<TriviaChallengeOutcome> {
        const result = await this.performTriviaChallenge(questionCount, requiredCorrectAnswers);

        this.refreshGraphicsState(this.getTriviaChallengeStatus(result));
        return result;
    }

    private readonly onMovePlayer = async (direction: CaveRoomDirections): Promise<string> => {
        console.log("movePlayer", direction);
        const blockedStatus = this.getBlockedStatus();
        if (blockedStatus !== null) {
            return blockedStatus;
        }

        const cave = this.requireCave();
        const map = this.requireMap();
        const mapHelper = this.requireMapHelper();
        const player = this.requirePlayer();
        const trivia = this.requireTrivia();
        const graphics = this.requireGraphics();

        // Move logic: get destination
        const currentRoom = map.getPlayerRoom();
        const adjacentRooms = cave.getAdjacentRooms(currentRoom);
        const destinationRoom = adjacentRooms[DIRECTION_INDEX[direction]];

        if (destinationRoom === -1) {
            return "That direction is a wall.";
        }

        // Award a coin (up to 100)
        let coins = player.getCoins();
        if (coins < 100) {
            coins += 1;
            player.setCoins(coins);
        }

        // Show trivia answer (does not consume a question)
        let triviaMessage = "";
        try {
            const hint = trivia.getHint();
            triviaMessage = `Trivia hint: ${hint}`;
        } catch {
            triviaMessage = "No trivia hints available.";
        }
        graphics.updateSecret(triviaMessage);

        // Move the player
        map.setPlayerRoom(destinationRoom);
        player.incrementTurns();
        this.requireSoundManager().playSound(SoundEventType.WALK);

        // Check for hazards (bat effect may chain)
        const encounterStatuses: string[] = [];
        let continueCheckingHazards = true;
        const visitedBatRooms = new Set<number>([destinationRoom]);

        while (continueCheckingHazards) {
            continueCheckingHazards = false;
            const hazards = mapHelper.getHazardsInPlayerRoom();

            for (const hazard of hazards) {
                if (hazard === "wumpus") {
                    const result = await this.performTriviaChallenge(5, 3);
                    if (result === TriviaChallengeResult.SUCCEEDED) {
                        encounterStatuses.push("You survived the Wumpus encounter.");
                        continue;
                    }

                    return this.finishGame(
                        result === TriviaChallengeResult.OUT_OF_COINS
                            ? "You ran out of gold and lost to the Wumpus."
                            : "You failed the Wumpus trivia challenge and lost the game.",
                    );
                }

                if (hazard === "pit") {
                    const result = await this.performTriviaChallenge(3, 2);
                    if (result === TriviaChallengeResult.SUCCEEDED) {
                        encounterStatuses.push("You escaped the pit.");
                        continue;
                    }

                    return this.finishGame(
                        result === TriviaChallengeResult.OUT_OF_COINS
                            ? "You ran out of gold in the pit and lost the game."
                            : "You failed the pit trivia challenge and lost the game.",
                    );
                }

                if (hazard === "bat") {
                    const newRoom = mapHelper.movePlayerAfterBatEncounter(Array.from(visitedBatRooms));
                    visitedBatRooms.add(newRoom);
                    encounterStatuses.push(`Bats carried you to room ${newRoom}.`);
                    continueCheckingHazards = true;
                    break;
                }
            }
        }

        if (encounterStatuses.length > 0) {
            return encounterStatuses.join(" ");
        }

        return `You moved ${direction}.`;
    };

    private readonly onShootArrow = async (direction: CaveRoomDirections): Promise<string> => {
        console.log("shootArrow", direction);
        const blockedStatus = this.getBlockedStatus();
        if (blockedStatus !== null) {
            return blockedStatus;
        }

        const cave = this.requireCave();
        const map = this.requireMap();
        const player = this.requirePlayer();
        const mapHelper = this.requireMapHelper();

        if (player.getArrows() <= 0) {
            player.incrementTurns();
            return this.finishGame("You ran out of arrows and lost the game.");
        }

        this.requireSoundManager().playSound(SoundEventType.SHOOT_ARROW);

        const currentRoom = map.getPlayerRoom();
        const adjacentRooms = cave.getAdjacentRooms(currentRoom);
        const targetRoom = adjacentRooms[DIRECTION_INDEX[direction]];

        // Only allow shooting into adjacent rooms
        if (targetRoom === -1) {
            player.setArrows(player.getArrows() - 1);
            if (player.getArrows() <= 0) {
                return this.finishGame("You ran out of arrows and lost the game.");
            }
            return "Your arrow hit a wall.";
        }

        // Win condition: shoot wumpus from adjacent room
        if (targetRoom === map.getWumpusRoom()) {
            player.setArrows(player.getArrows() - 1);
            player.incrementTurns();
            player.setWumpusKilled();
            return this.finishGame("You win! You killed the Wumpus!", true);
        }

        // Miss: lose arrow, wumpus moves up to 2 rooms away
        player.setArrows(player.getArrows() - 1);
        player.incrementTurns();
        if (player.getArrows() <= 0) {
            return this.finishGame("You ran out of arrows and lost the game.");
        }
        mapHelper.moveWumpusAfterMiss();
        return "You missed. The Wumpus moved.";
    };

    private readonly onPurchaseArrow = async (): Promise<string> => {
        console.log("purchaseArrow");
        const blockedStatus = this.getBlockedStatus();
        if (blockedStatus !== null) {
            return blockedStatus;
        }

        const player = this.requirePlayer();
        player.incrementTurns();
        const result = await this.performTriviaChallenge(3, 2);
        if (result === TriviaChallengeResult.OUT_OF_COINS) {
            return this.finishGame("You ran out of gold while trying to buy arrows.");
        }

        if (result !== TriviaChallengeResult.SUCCEEDED) {
            return "You failed the trivia challenge and did not buy arrows.";
        }

        player.setArrows(player.getArrows() + 2);
        return "You bought two arrows.";
    };

    private readonly onPurchaseSecret = async (): Promise<string> => {
        console.log("purchaseSecret");
        const blockedStatus = this.getBlockedStatus();
        if (blockedStatus !== null) {
            return blockedStatus;
        }

        const trivia = this.requireTrivia();
        const mapHelper = this.requireMapHelper();
        const graphics = this.requireGraphics();
        this.requirePlayer().incrementTurns();

        const result = await this.performTriviaChallenge(3, 2);
        if (result === TriviaChallengeResult.OUT_OF_COINS) {
            return this.finishGame("You ran out of gold while trying to buy a secret.");
        }

        if (result !== TriviaChallengeResult.SUCCEEDED) {
            return "You failed the trivia challenge and did not get a secret.";
        }

        const secret = this.getPurchasedSecret(trivia, mapHelper);
        graphics.updateSecret(secret);
        return "A secret has been revealed.";
    };

    private readonly onViewHighScores = async (): Promise<string> => {
        console.log("viewHighScores");
        const player = this.requirePlayer();
        const highScores = this.requireHighScores();
        const highScoreGraphics = this.requireHighScoreGraphics();

        highScoreGraphics.show(highScores, {
            name: player.getPlayerName(),
            score: player.getScore()
        });

        const topScore = highScores.getHighScores()[0];
        if (!topScore) {
            return "No high scores recorded yet.";
        }
        return `Top score: ${topScore.name} (${topScore.score}).`;
    };

    async movePlayer(caveRoomDirection: CaveRoomDirections): Promise<string> {
        const status = await this.onMovePlayer(caveRoomDirection);
        this.refreshGraphicsState(status);
        return status;
    }

    async shootArrow(caveRoomDirection: CaveRoomDirections): Promise<string> {
        const status = await this.onShootArrow(caveRoomDirection);
        this.refreshGraphicsState(status);
        return status;
    }

    async purchaseArrow(): Promise<string> {
        const status = await this.onPurchaseArrow();
        this.refreshGraphicsState(status);
        return status;
    }

    async purchaseSecret(): Promise<string> {
        const status = await this.onPurchaseSecret();
        this.refreshGraphicsState(status);
        return status;
    }

    async viewHighScores(): Promise<string> {
        const status = await this.onViewHighScores();
        this.refreshGraphicsState(status);
        return status;
    }

    private async performTriviaChallenge(
        questionCount: number,
        requiredCorrectAnswers: number,
    ): Promise<TriviaChallengeOutcome> {
        const trivia = this.requireTrivia();
        const player = this.requirePlayer();
        const triviaGraphics = this.requireTriviaGraphics();

        return triviaGraphics.runChallenge(trivia, player, questionCount, requiredCorrectAnswers);
    }

    private refreshGraphicsState(statusMessage?: string): void {
        const graphics = this.requireGraphics();
        const cave = this.requireCave();
        const map = this.requireMap();
        const player = this.requirePlayer();
        const mapHelper = this.requireMapHelper();

        const currentRoom = map.getPlayerRoom();
        const warnings = mapHelper.getWarningsNearPlayer();

        graphics.updatePlayerName(player.getPlayerName());
        graphics.updateArrowCount(player.getArrows());
        graphics.updateCoinCount(player.getCoins());
        graphics.updateTurnCount(player.getTurns());
        graphics.updateCurrentRoom(currentRoom);
        graphics.updateRoomExits(cave.getAdjacentRooms(currentRoom));
        graphics.updateWarnings(warnings);

        this.playWarningSounds(warnings);

        if (statusMessage !== undefined) {
            graphics.updateStatusMessage(statusMessage);
        }
    }

    private requireCave(): ICave {
        if (this.cave === null) {
            throw new Error("GameControl is not initialized. Call init() first.");
        }
        return this.cave;
    }

    private requireMap(): IMap {
        if (this.map === null) {
            throw new Error("GameControl is not initialized. Call init() first.");
        }
        return this.map;
    }

    private requirePlayer(): IPlayer {
        if (this.player === null) {
            throw new Error("GameControl is not initialized. Call init() first.");
        }
        return this.player;
    }

    private requireHighScores(): IHighScores {
        if (this.highScores === null) {
            throw new Error("GameControl is not initialized. Call init() first.");
        }
        return this.highScores;
    }

    private requireHighScoreGraphics(): IHighScoreGraphics {
        if (this.highScoreGraphics === null) {
            throw new Error("GameControl is not initialized. Call init() first.");
        }
        return this.highScoreGraphics;
    }

    private requireTrivia(): ITrivia {
        if (this.trivia === null) {
            throw new Error("GameControl is not initialized. Call init() first.");
        }
        return this.trivia;
    }

    private requireTriviaGraphics(): ITriviaGraphics {
        if (this.triviaGraphics === null) {
            throw new Error("GameControl is not initialized. Call init() first.");
        }
        return this.triviaGraphics;
    }

    private requireMapHelper(): IMapHelper {
        if (this.mapHelper === null) {
            throw new Error("GameControl is not initialized. Call init() first.");
        }
        return this.mapHelper;
    }

    private requireGraphics(): IGraphics {
        if (this.graphics === null) {
            throw new Error("GameControl is not initialized. Call init() first.");
        }
        return this.graphics;
    }

    private requireSoundManager(): ISoundManager {
        if (this.soundManager === null) {
            throw new Error("GameControl is not initialized. Call init() first.");
        }
        return this.soundManager;
    }

    private getBlockedStatus(): string | null {
        return this.gameOver ? this.gameOverStatus : null;
    }

    private async finishGame(status: string, isWin = false): Promise<string> {
        if (this.gameOver) {
            return this.gameOverStatus;
        }

        this.gameOver = true;
        this.gameOverStatus = status;
        this.requireSoundManager().playSound(isWin ? SoundEventType.WIN : SoundEventType.LOSE);

        await this.recordAndDisplayEndGameScores();
        return status;
    }

    private async recordAndDisplayEndGameScores(): Promise<void> {
        const player = this.requirePlayer();
        const highScores = this.requireHighScores();
        const highScoreGraphics = this.requireHighScoreGraphics();
        const entry = {
            name: player.getPlayerName(),
            score: player.getScore(),
        };

        await highScores.addScore(entry.name, entry.score);
        highScoreGraphics.show(highScores, entry, () => {
            window.location.reload();
        });
    }

    private playWarningSounds(warnings: string[]): void {
        const soundManager = this.requireSoundManager();

        for (const warning of warnings) {
            const normalized = warning.toLowerCase();

            if (normalized.includes("wumpus")) {
                soundManager.playSound(SoundEventType.WARNING_WUMPUS);
                continue;
            }

            if (normalized.includes("bat")) {
                soundManager.playSound(SoundEventType.WARNING_BAT);
                continue;
            }

            if (normalized.includes("draft") || normalized.includes("pit")) {
                soundManager.playSound(SoundEventType.WARNING_PIT);
            }
        }
    }

    private getTriviaChallengeStatus(result: TriviaChallengeResult): string {
        switch (result) {
            case "succeeded":
                return "You passed the trivia challenge.";
            case "failed":
                return "You failed the trivia challenge.";
            case "out_of_coins":
                return "You ran out of gold during the trivia challenge.";
            default:
                return "Trivia challenge completed.";
        }
    }

    private getPurchasedSecret(trivia: ITrivia, mapHelper: IMapHelper): string {
        if (Math.random() < 0.5) {
            return mapHelper.getSecret();
        }

        try {
            const hint = trivia.getHint();
            return `Trivia hint: ${hint}`;
        } catch {
            return mapHelper.getSecret();
        }
    }
}
