import type { ISoundManager, SoundEventType } from "./ISoundManager";

type SoundTheme = Record<SoundEventType, string>;

const DEFAULT_THEME: SoundTheme = {
    walk: "/sounds/default/theme.wav",
    shoot_arrow: "/sounds/default/theme.wav",
    win: "/sounds/default/theme.wav",
    lose: "/sounds/default/theme.wav",
    warning_bat: "/sounds/default/theme.wav",
    warning_pit: "/sounds/default/theme.wav",
    warning_wumpus: "/sounds/default/theme.wav",
};

export class SoundManager implements ISoundManager {
    private readonly theme: SoundTheme;

    constructor(caveChoice: string) {
        this.theme = this.resolveTheme(caveChoice);
    }

    playSound(soundEventType: SoundEventType): void {
        const src = this.theme[soundEventType];
        const audio = new Audio(src);
        audio.loop = false;
        audio.currentTime = 0;
        void audio.play().catch(() => {
            // Intentionally ignore autoplay/path errors for placeholder files.
        });
    }

    private resolveTheme(_caveChoice: string): SoundTheme {
        // Only one cave/theme currently.
        return DEFAULT_THEME;
    }
}
