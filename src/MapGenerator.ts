class MapGenerator {
  generateMap(map: number[][]): number[][] {
    const rows = map.length;
    const cols = map[0].length;

    // Initialize the map with random values
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        map[row][col] = Math.random() < 0.4 ? 1 : 0;
      }
    }

    // Apply cellular automata rules to generate caves and caverns
    for (let i = 0; i < 5; i++) {
      const newMap = JSON.parse(JSON.stringify(map));
      for (let row = 1; row < rows - 1; row++) {
        for (let col = 1; col < cols - 1; col++) {
          const neighbors = this.countNeighbors(map, row, col);
          if (map[row][col] === 1) {
            newMap[row][col] = neighbors >= 4 ? 1 : 0;
          } else {
            newMap[row][col] = neighbors >= 5 ? 1 : 0;
          }
        }
      }
      map = newMap;
    }

    return map;
  }

  private countNeighbors(map: number[][], row: number, col: number): number {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        if (map[row + i][col + j] === 1) count++;
      }
    }
    return count;
  }
}

export { MapGenerator };
