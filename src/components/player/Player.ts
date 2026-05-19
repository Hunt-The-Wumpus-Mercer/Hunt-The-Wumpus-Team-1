import { PlayerResourceType, type IPlayer, type PlayerResourceType as PlayerResourceTypeValue } from "./IPlayer";

const STARTING_ARROWS = 3;
const STARTING_COINS = 0;
const STARTING_TURNS = 0;
const WUMPUS_KILL_BONUS = 50;

export class Player implements IPlayer {
    private playerName = "";
    private resources: Record<PlayerResourceTypeValue, number> = {
        [PlayerResourceType.ARROWS]: STARTING_ARROWS,
        [PlayerResourceType.COINS]: STARTING_COINS,
        [PlayerResourceType.TURNS]: STARTING_TURNS,
    };
    private wumpusKilled = false;

    getPlayerName(): string {
        return this.playerName;
    }

    setPlayerName(name: string): void {
        this.playerName = name;
    }

    getResource(resource: PlayerResourceTypeValue): number {
        return this.resources[resource];
    }

    incrementResource(resource: PlayerResourceTypeValue, amount = 1): number {
        this.resources[resource] += amount;
        return this.resources[resource];
    }

    decrementResource(resource: PlayerResourceTypeValue, amount = 1): number {
        this.resources[resource] -= amount;
        return this.resources[resource];
    }

    setWumpusKilled(): void {
        this.wumpusKilled = true;
    }

    getScore(): number {
        const wumpusScore = this.wumpusKilled ? WUMPUS_KILL_BONUS : 0;
        const turns = this.getResource(PlayerResourceType.TURNS);
        const coins = this.getResource(PlayerResourceType.COINS);
        const arrows = this.getResource(PlayerResourceType.ARROWS);
        return 100 - turns + coins + (5 * arrows) + wumpusScore;
    }
}
