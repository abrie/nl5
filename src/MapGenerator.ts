class MapGenerator {
	generateMap(
		map: number[][],
		wallThickness: number = 0,
		mapWidth: number,
		mapHeight: number,
	): number[][] {
		const rows = mapHeight;
		const cols = mapWidth;

		// Initialize the map with walls based on wallThickness
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				if (
					row < wallThickness ||
					row >= rows - wallThickness ||
					col < wallThickness ||
					col >= cols - wallThickness
				) {
					map[row][col] = 1;
				} else {
					map[row][col] = Math.random() < 0.2 ? 1 : 0;
				}
			}
		}

		// Apply cellular automata rules to generate caves and caverns
		for (let i = 0; i < 5; i++) {
			const newMap = JSON.parse(JSON.stringify(map));
			for (let row = wallThickness; row < rows - wallThickness; row++) {
				for (let col = wallThickness; col < cols - wallThickness; col++) {
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

		// Validate the playable area size
		if (!this.isPlayableAreaSufficient(map)) {
			return this.generateMap(map, wallThickness, mapWidth, mapHeight);
		}

		return map;
	}

	private countNeighbors(map: number[][], row: number, col: number): number {
		let count = 0;
		for (let i = -1; i <= 1; i++) {
			for (let j = -1; j <= 1; j++) {
				if (i === 0 && j === 0) continue;
				if (map[row + i] && map[row + i][col + j] === 1) count++;
			}
		}
		return count;
	}

	/**
	 * Checks if the playable area in the generated map is sufficient.
	 * This method uses Depth-First Search (DFS) to traverse the map and count the size of the playable area.
	 * A playable area is defined as a contiguous region of empty cells (value 0).
	 * The method starts the DFS from the first empty cell found and counts the number of empty cells in the region.
	 * If the size of the playable area is greater than or equal to the specified threshold, the map is considered playable.
	 *
	 * @param map - The generated map represented as a 2D array of numbers.
	 * @returns boolean - True if the playable area is sufficient, false otherwise.
	 */
	private isPlayableAreaSufficient(map: number[][]): boolean {
		const visited = new Set<string>();
		const rows = map.length;
		const cols = map[0].length;
		let playableAreaSize = 0;

		const dfs = (row: number, col: number) => {
			const key = `${row},${col}`;
			if (
				row < 0 ||
				col < 0 ||
				row >= rows ||
				col >= cols ||
				map[row][col] === 1 ||
				visited.has(key)
			) {
				return;
			}

			visited.add(key);
			playableAreaSize++;

			dfs(row - 1, col);
			dfs(row + 1, col);
			dfs(row, col - 1);
			dfs(row, col + 1);
		};

		// Start DFS from the first empty cell found
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				if (map[row][col] === 0) {
					dfs(row, col);
					return playableAreaSize >= 100; // Adjust the threshold as needed
				}
			}
		}

		return false;
	}

	generatePlayableMap(
		mapWidth: number,
		mapHeight: number,
		wallThickness: number = 0,
	): number[][] {
		let map: number[][] = Array.from({ length: mapHeight }, () =>
			Array(mapWidth).fill(0),
		);
		return this.generateMap(map, wallThickness, mapWidth, mapHeight);
	}
}

export { MapGenerator, generatePlayableMap };
