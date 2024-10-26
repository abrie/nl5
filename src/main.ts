import { App } from "./App";
import { Game, AUTO } from "phaser";
import { MapGenerator } from "./MapGenerator";

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
			gravity: { y: 300 },
			debug: false,
		},
	},
	scene: {
		preload: preload,
		create: create,
		update: update,
	},
};

const game = new Game(config);

let player;
let cursors;

function preload() {
	// Load assets here
}

function create() {
	const mapGenerator = new MapGenerator();
	const wallThickness = 2; // Set the desired wall thickness here
	const map = mapGenerator.generateMap(
		Array(30)
			.fill(0)
			.map(() => Array(40).fill(0)),
		wallThickness,
	);

	const tileSize = 16;

	// Generate a Phaser texture given width, height, and color
	function generateTexture(
		this: Phaser.Scene,
		name: string,
		width: number,
		height: number,
		color: number,
	) {
		const graphics = this.make.graphics({ x: 0, y: 0, add: false });
		graphics.fillStyle(color, 1.0);
		graphics.fillRect(0, 0, width, height);
		graphics.generateTexture(name, width, height);
		graphics.destroy();
	}

	// Generate a texture for map walls
	generateTexture.call(this, "wall", tileSize, tileSize, 0x00ff00);

	// Create a Phaser TileMap using the generated map array and the generated wall texture
	const tilemap = this.make.tilemap({
		data: map,
		tileWidth: tileSize,
		tileHeight: tileSize,
	});
	const tileset = tilemap.addTilesetImage("wall");
	const layer = tilemap.createLayer(0, tileset, 0, 0);

	// Enable collision for wall tiles
	layer.setCollisionByExclusion([0]);

	// Generate a texture for the player
	generateTexture.call(this, "player", tileSize, tileSize, 0xffff00);

	// Create the player sprite and enable physics for it
	player = this.physics.add.sprite(100, 100, "player");
	player.setBounce(0.2);
	player.setCollideWorldBounds(true);

	// Enable collision between the player and the tilemap layer
	this.physics.add.collider(player, layer, () =>
		console.log("Player collided with a wall tile."),
	);

	// Handle player input for movement and jumping
	cursors = this.input.keyboard.createCursorKeys();

	// Set player's drag to simulate air friction
	player.body.drag.x = 600;
}

function update() {
	if (cursors.left.isDown) {
		player.body.acceleration.x = -600;
	} else if (cursors.right.isDown) {
		player.body.acceleration.x = 600;
	} else {
		player.body.acceleration.x = 0;
	}

	if (cursors.up.isDown) {
		console.log("Up arrow key detected");
	}
	if (player.body.touching.down) {
		console.log("Player is touching the ground");
	}
	if (player.body.blocked.down) {
		console.log("Player is blocked by the ground");
	}
	if (cursors.up.isDown && player.body.blocked.down) {
		player.setVelocityY(-330);
		console.log("Player's vertical velocity set to -330");
	}
}
