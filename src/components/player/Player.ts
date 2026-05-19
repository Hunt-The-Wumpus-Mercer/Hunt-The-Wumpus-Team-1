import type { IPlayer } from "./IPlayer";

const STARTING_ARROWS = 3;
const STARTING_COINS = 0;
const STARTING_TURNS = 0;
const WUMPUS_KILL_BONUS = 50;

export class Player implements IPlayer {
    private playerName = "";
    private arrows = STARTING_ARROWS;
    private coins = STARTING_COINS;
    private turns = STARTING_TURNS;
    private wumpusKilled = false;

    getPlayerName(): string {
        return this.playerName;
    }

    setPlayerName(name: string): void {
        this.playerName = name;
    }

    getArrows(): number {
        return this.arrows;
    }

    setArrows(arrows: number): void {
        this.arrows = arrows;
    }

    getCoins(): number {
        return this.coins;
    }

    setCoins(coins: number): void {
        this.coins = coins;
    }

    getTurns(): number {
        return this.turns;
    }

    incrementTurns(): number {
        this.turns += 1;
        return this.turns;
    }

    setWumpusKilled(): void {
        this.wumpusKilled = true;
    }

    getScore(): number {
        const wumpusScore = this.wumpusKilled ? WUMPUS_KILL_BONUS : 0;
        return 100 - this.turns + this.coins + (5 * this.arrows) + wumpusScore;
    }
}
