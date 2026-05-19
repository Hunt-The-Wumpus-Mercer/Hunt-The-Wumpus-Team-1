import type { ISound } from "./ISound";
import clickSound from './assets/click.mp3';

export class Sound implements ISound {
    playBackgoundMusic(): void {
            console.log("hello world!");

            const audio = new Audio(clickSound);
            audio.play()
                  .then(() => {
                    console.debug("Audio playing successfully via jQuery trigger");
                  })
                  .catch((error: Error) => {
                    console.error("Playback failed:", error);
                  });
    }
}
