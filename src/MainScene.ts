import { Scene } from "phaser";
import { MapGenerator } from "./MapGenerator";

class MainScene extends Scene {
  // Use definite assignment assertions for player and cursors properties
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    // Load assets here
  }

  create() {
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
    this.player = this.physics.add.sprite(100, 100, "player");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Enable collision between the player and the tilemap layer
    this.physics.add.collider(this.player, layer, () =>
      console.log("Player collided with a wall tile."),
    );

    // Handle player input for movement and jumping
    this.cursors = this.input.keyboard.createCursorKeys();

    // Set player's drag to simulate air friction
    this.player.body.drag.x = 600;
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.body.acceleration.x = -600;
    } else if (this.cursors.right.isDown) {
      this.player.body.acceleration.x = 600;
    } else {
      this.player.body.acceleration.x = 0;
    }

    if (this.cursors.up.isDown) {
      console.log("Up arrow key detected");
    }
    if (this.player.body.touching.down) {
      console.log("Player is touching the ground");
    }
    if (this.player.body.blocked.down) {
      console.log("Player is blocked by the ground");
    }
    if (this.cursors.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-330);
      console.log("Player's vertical velocity set to -330");
    }
  }
}

export { MainScene };