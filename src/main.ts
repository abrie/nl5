import { App } from './App';
import Phaser from 'phaser';

const app = new App();
app.mount(document.getElementById('app'));

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 480,
  parent: 'phaser-game',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

function preload() {
  // Load assets here
}

function create() {
  // Create game objects here
}

function update() {
  // Update game objects here
}
