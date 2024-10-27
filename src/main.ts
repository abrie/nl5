import { App } from "./App";
import { Game, AUTO } from "phaser";
import { MainScene } from "./MainScene";

const app = new App();
app.mount(document.getElementById("app"));

const config = {
	type: AUTO,
	width: 640,
	height: 480,
	parent: "phaser-game",
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 1500, x: 0 },
			debug: false,
		},
	},
	scene: MainScene,
};

const game = new Game(config);
