import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("#game");
const startScreen = document.querySelector<HTMLElement>("#start-screen");
const startButton = document.querySelector<HTMLButtonElement>("#start-button");

if (!canvas || !startScreen || !startButton)
  throw new Error("Game bootstrap elements were not found");

const launch = async (): Promise<void> => {
  startButton.disabled = true;
  startButton.textContent = "Spinning up…";

  const { Game } = await import("./core/Game");
  const game = new Game(canvas);
  await game.load();
  game.start();

  startScreen.classList.add("leaving");
  globalThis.setTimeout(
    () => startScreen.classList.remove("visible", "leaving"),
    700
  );
};

startButton.addEventListener("click", () => void launch());

if (location.hash.startsWith("#fly")) {
  startButton.click();
  startScreen.classList.remove("visible");
}
