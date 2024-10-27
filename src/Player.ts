class Player {
  inventory: string[];

  constructor() {
    this.inventory = [];
  }

  collectLoot(loot: string) {
    this.inventory.push(loot);
  }
}

export { Player };
