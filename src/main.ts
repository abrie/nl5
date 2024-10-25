import { App } from './App';
import { Game, AUTO } from 'phaser';

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
  // Create game objects here
}

function update() {
  // Update game objects here
}
