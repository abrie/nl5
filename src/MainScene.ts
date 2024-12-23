import { Scene, Input } from "phaser";
import { MapGenerator } from "./MapGenerator";

const Config = {
	TileSize: 16,
	MapWidth: 10,
	MapHeight: 30,
};

class MainScene extends Scene {
	// Use definite assignment assertions for player and cursors properties
	private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private map!: Phaser.Tilemaps.Tilemap;
	private maxHorizontalVelocity: number = 300;
	private loot!: Phaser.Physics.Arcade.StaticGroup;
	private grapplingHookDeployed: boolean = false;
	private grapplingHookLine!: Phaser.GameObjects.Graphics;
	private isZoomed: boolean = false;
	private zoomTween!: Phaser.Tweens.Tween;
	private remainingTimeText!: Phaser.GameObjects.Text;
	private timerEvent!: Phaser.Time.TimerEvent;
	private playerCollider!: Phaser.Physics.Arcade.Collider; // Added playerCollider property

	constructor() {
		super({ key: "MainScene" });
	}

	preload() {
		// Load assets here
	}

	getWallLayer(map: Phaser.Tilemaps.Tilemap): Phaser.Tilemaps.TilemapLayer {
		const layer = map.getLayer(0);
		if (layer === null) {
			throw new Error("No layer with index 0");
		}

		return layer.tilemapLayer;
	}

	instantiateMap(): Phaser.Tilemaps.Tilemap {
		const mapGenerator = new MapGenerator();
		const wallThickness = 2; // Set the desired wall thickness here
		let map = mapGenerator.generatePlayableMap(
			Config.MapWidth,
			Config.MapHeight,
			wallThickness,
		);

		const tilemap = this.make.tilemap({
			data: map,
			tileWidth: Config.TileSize,
			tileHeight: Config.TileSize,
		});
		const tileset = tilemap.addTilesetImage("wall");
		if (tileset === null) {
			throw new Error("Failed to add a Tileset Image");
		}
		const layer = tilemap.createLayer(0, tileset, 0, 0);
		if (layer === null) {
			throw new Error("Failed to create tilemap layer.");
		}

		// Enable collision for wall tiles
		layer.setCollisionByExclusion([-1]);

		return tilemap;
	}

	create() {
		// Generate a Phaser texture given width, height, and color
		function generateTexture(
			this: Phaser.Scene,
			name: string,
			width: number,
			height: number,
			color: number,
		) {
			const graphics = this.make.graphics({ x: 0, y: 0 });
			graphics.fillStyle(color, 1.0);
			graphics.fillRect(0, 0, width, height);
			graphics.generateTexture(name, width, height);
			graphics.destroy();
		}

		// Generate a texture for map walls
		generateTexture.call(
			this,
			"wall",
			Config.TileSize,
			Config.TileSize,
			0x00ff00,
		);

		// Create a Phaser TileMap using the generated map array and the generated wall texture
		// Generate a texture for the player
		generateTexture.call(
			this,
			"player",
			Config.TileSize,
			Config.TileSize,
			0xffff00,
		);

		this.map = this.instantiateMap();
		this.player = this.physics.add.sprite(100, 100, "player");
		this.player.setBounce(0.2);
		this.player.setCollideWorldBounds(false);

		this.playerCollider = this.physics.add.collider(
			this.player,
			this.getWallLayer(this.map),
			() => {},
		);

		// Handle player input for movement and jumping
		if (this.input.keyboard !== null) {
			this.cursors = this.input.keyboard.createCursorKeys();
		}

		// Set player's drag to simulate air friction
		this.player.body.drag.x = 600;

		/*
		// Generate loot and place it randomly in empty tiles
		this.generateLoot(this.map, Config.TileSize);
    */

		// Add collision detection between the player and loot
		this.physics.add.overlap(
			this.player,
			this.loot,
			this.collectLoot,
			undefined,
			this,
		);

		// Initialize grappling hook line
		this.grapplingHookLine = this.add.graphics({
			lineStyle: { width: 2, color: 0xff0000 },
		});

		// Set up the camera to follow the player
		this.cameras.main.startFollow(this.player);

		// Set the camera bounds to match the size of the map
		this.cameras.main.setBounds(
			0,
			0,
			this.map.widthInPixels,
			this.map.heightInPixels,
		);

		// Set the initial camera zoom to unzoomed
		this.cameras.main.setZoom(1);

		// Add input handler for the Z key
		if (this.input.keyboard) {
			this.input.keyboard.on("keydown-Z", () => {
				this.toggleZoom();
			});
		}

		// Add a Phaser text object to display the remaining time
		this.remainingTimeText = this.add.text(10, 10, "Time: 30", {
			fontSize: "20px",
			color: "#ffffff",
		});

		// Add a timer to regenerate the map every 30 seconds
		this.timerEvent = this.time.addEvent({
			delay: 3000,
			callback: () => this.regenerateMap(this.map),
			callbackScope: this,
			loop: true,
		});
	}

	update() {
		if (this.cursors.left.isDown && !this.grapplingHookDeployed) {
			this.player.body.acceleration.x = -600;
		} else if (this.cursors.right.isDown && !this.grapplingHookDeployed) {
			this.player.body.acceleration.x = 600;
		} else {
			this.player.body.acceleration.x = 0;
		}

		if (this.cursors.up.isDown && this.player.body.blocked.down) {
			this.player.setVelocityY(-400);
		}

		// Ensure the player's velocity does not exceed the maximum horizontal velocity
		if (this.player.body.velocity.x > this.maxHorizontalVelocity) {
			this.player.body.velocity.x = this.maxHorizontalVelocity;
		} else if (this.player.body.velocity.x < -this.maxHorizontalVelocity) {
			this.player.body.velocity.x = -this.maxHorizontalVelocity;
		}

		// Handle grappling hook deployment and release
		if (this.input.keyboard) {
			if (this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SHIFT).isDown) {
				if (!this.grapplingHookDeployed) {
					this.grapplingHookDeployed = true;
					this.drawGrapplingHook();
				}
			} else {
				if (this.grapplingHookDeployed) {
					this.grapplingHookDeployed = false;
					this.grapplingHookLine.clear();
				}
			}
		}

		// Handle vertical movement while grappling hook is deployed
		if (this.grapplingHookDeployed) {
			if (this.cursors.up.isDown) {
				this.player.setVelocityY(-200);
			} else if (this.cursors.down.isDown) {
				this.player.setVelocityY(200);
			} else {
				this.player.setVelocityY(0);
			}
			this.player.setVelocityX(0); // Set horizontal velocity to zero
			this.player.body.acceleration.x = 0; // Set horizontal acceleration to zero
			this.drawGrapplingHook();
		}

		// Update the remaining time text
		const remainingTime = Math.ceil(
			(this.timerEvent.delay - this.timerEvent.getElapsed()) / 1000,
		);
		this.remainingTimeText.setText(`Time: ${remainingTime}`);
	}

	private drawGrapplingHook() {
		this.grapplingHookLine.clear();
		this.grapplingHookLine.lineStyle(2, 0xff0000);
		this.grapplingHookLine.beginPath();
		this.grapplingHookLine.moveTo(this.player.x, this.player.y);
		const anchorPoint = this.getNearestTileAbovePlayer();
		this.grapplingHookLine.lineTo(anchorPoint.x, anchorPoint.y);
		this.grapplingHookLine.strokePath();
	}

	private getNearestTileAbovePlayer(): { x: number; y: number } {
		const playerTileX = Math.floor(this.player.x / Config.TileSize);
		const playerTileY = Math.floor(this.player.y / Config.TileSize);
		for (let y = playerTileY; y >= 0; y--) {
			const tile = this.map.getTileAt(playerTileX, y);
			if (tile && tile.index === 1) {
				return {
					x: tile.pixelX + Config.TileSize / 2,
					y: tile.pixelY + Config.TileSize,
				};
			}
		}
		return { x: this.player.x, y: 0 };
	}

	private generateLoot(map: number[][], tileSize: number) {
		this.loot = this.physics.add.staticGroup();

		// Generate a texture for the loot
		this.generateTexture("loot", Config.TileSize, Config.TileSize, 0xff0000);

		for (let row = 0; row < map.length; row++) {
			for (let col = 0; col < map[row].length; col++) {
				if (map[row][col] === -1 && Math.random() < 0.1) {
					const lootItem = this.loot.create(
						col * tileSize,
						row * tileSize,
						"loot",
						);
					lootItem.setOrigin(0, 0);
				}
			}
		}
	}

	private collectLoot(
		player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
		lootItem: Phaser.Types.Physics.Arcade.GameObjectWithBody,
	) {
		(lootItem as Phaser.Physics.Arcade.Sprite).destroy();
		// Add loot to player's inventory (to be implemented)
	}

	private generateTexture(
		name: string,
		width: number,
		height: number,
		color: number,
	) {
		const graphics = this.make.graphics({ x: 0, y: 0 });
		graphics.fillStyle(color, 1.0);
		graphics.fillRect(0, 0, width, height);
		graphics.generateTexture(name, width, height);
		graphics.destroy();
	}

	private toggleZoom() {
		const targetZoom = this.isZoomed ? 1 : 2;
		this.isZoomed = !this.isZoomed;
		if (this.zoomTween) {
			this.zoomTween.stop();
		}
		this.zoomTween = this.tweens.add({
			targets: this.cameras.main,
			zoom: targetZoom,
			duration: 500,
			ease: "Power2",
		});
	}

	private regenerateMap(tilemap: Phaser.Tilemaps.Tilemap) {
		const mapGenerator = new MapGenerator();
		const wallThickness = 2; // Set the desired wall thickness here
		let map = mapGenerator.generatePlayableMap(
			Config.MapWidth,
			Config.MapHeight,
			wallThickness,
		);

		// Enable collision between the player and the tilemap layer
		const layer = tilemap.getLayer(0);
		if (layer === null) {
			throw new Error("No layer with index 0");
		}

		for (let row = 0; row < map.length; row++) {
			for (let col = 0; col < map[row].length; col++) {
				const tile = layer.tilemapLayer.getTileAt(col, row);
				if (tile) {
					layer.tilemapLayer.putTileAt(map[row][col] === -1 ? -1 : 0, col, row);
				}
			}
		}

		layer.tilemapLayer.setCollisionByExclusion([-1]);

		this.physics.world.colliders.remove(this.playerCollider);
		this.playerCollider = this.physics.add.collider(
			this.player,
			this.getWallLayer(this.map),
			() => {},
		);
	}
}

export { MainScene };
