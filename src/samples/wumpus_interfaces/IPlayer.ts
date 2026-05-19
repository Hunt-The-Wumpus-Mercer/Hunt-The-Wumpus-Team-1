export const PlayerResourceType = {
    ARROWS: 'arrows',
    COINS: 'coins',
    TURNS: 'turns',
};
export type PlayerResourceType = (typeof PlayerResourceType)[keyof typeof PlayerResourceType];

export interface IPlayer {
    // returns the current value of the resource
    getResource(resource: PlayerResourceType): number

    // increment the resource and return the new value
    incrementResource(resource: PlayerResourceType): number

    // decrement the resource and return the new value
    decrementtResource(resource: PlayerResourceType): number
}