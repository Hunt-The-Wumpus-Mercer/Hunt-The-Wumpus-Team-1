import type { IUser_assistance } from "./IUser_assistance";

export class UserAssistance implements IUser_assistance {
    show_instructions(onComplete: (playerName: string, caveChoice: string) => void, availableCaves: string[]): void {
        // Create modal overlay
        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100vw";
        modal.style.height = "100vh";
        modal.style.background = "rgba(0,0,0,0.7)";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.zIndex = "10000";

        // Modal content
        const content = document.createElement("div");
        content.style.background = "#fff";
        content.style.padding = "2rem";
        content.style.borderRadius = "8px";
        content.style.maxWidth = "400px";
        content.style.boxShadow = "0 2px 16px rgba(0,0,0,0.3)";
        content.innerHTML = `
            <h2>Welcome to Hunt the Wumpus!</h2>
            <p>Insert tutorial here.</p>
            <form id="user-assist-form">
                <label for="playerName">Your Name:</label><br>
                <input id="playerName" name="playerName" type="text" required style="width: 100%; margin-bottom: 1em;"/><br>
                <label for="caveChoice">Choose a Cave:</label><br>
                <select id="caveChoice" name="caveChoice" style="width: 100%; margin-bottom: 1em;">
                    ${availableCaves.map(cave => `<option value="${cave}">${cave}</option>`).join("")}
                </select><br>
                <button type="submit" style="width: 100%;">Start Game</button>
            </form>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        const form = content.querySelector("#user-assist-form") as HTMLFormElement;
        form.onsubmit = (e) => {
            e.preventDefault();
            const playerName = (content.querySelector("#playerName") as HTMLInputElement).value.trim();
            const caveChoice = (content.querySelector("#caveChoice") as HTMLSelectElement).value;
            document.body.removeChild(modal);
            onComplete(playerName, caveChoice);
        };
    }
}
