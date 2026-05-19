export const SoundEventType = {
    WUMPUS_NEARBY: 'wumpus_nearby',
    SHOOT_ARROW: 'shoot_arrow',
    WIN: 'win',
    LOSE: 'lose'
};
export type SoundEventType = (typeof SoundEventType)[keyof typeof SoundEventType];

export interface ISoundManager {
    // plays the specified sound event type
    playSound(soundEventType: SoundEventType): void
}