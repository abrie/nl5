import { App } from './App';
import { Game, AUTO } from 'phaser';
import { MapGenerator } from './MapGenerator';

const app = new App();
app.mount(document.getElementById('app'));

const config = {
  type: AUTO,
  width: 640,
  height: 480,
  parent: 'phaser-game',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Game(config);

function preload() {
  // Load assets here
}

function create() {
  const mapGenerator = new MapGenerator();
  const wallThickness = 2; // Set the desired wall thickness here
  const map = mapGenerator.generateMap(Array(30).fill(0).map(() => Array(40).fill(0)), wallThickness);

  const tileSize = 16;

  // Generate a Phaser texture given width, height, and color
  function generateTexture(width: number, height: number, color: number) {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(color, 1.0);
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture('wall', width, height);
    graphics.destroy();
  }

  // Generate a texture for map walls
  generateTexture.call(this, tileSize, tileSize, 0x00ff00);

  // Create a Phaser TileMap using the generated map array and the generated wall texture
  const tilemap = this.make.tilemap({ data: map, tileWidth: tileSize, tileHeight: tileSize });
  const tileset = tilemap.addTilesetImage('wall');
  const layer = tilemap.createLayer(0, tileset, 0, 0);
}

function update() {
  // Update game objects here
}
