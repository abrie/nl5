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
  const map = mapGenerator.generateMap(Array(30).fill(0).map(() => Array(40).fill(0)));

  const graphics = this.add.graphics();
  const tileSize = 16;

  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 1) {
        graphics.fillStyle(0x00ff00, 1.0);
        graphics.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }
  }
}

function update() {
  // Update game objects here
}
