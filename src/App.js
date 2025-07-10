import React, { useState } from "react";
import "./App.css";

const numRows = 15;
const numCols = 30;

const createGrid = () => {
  return Array.from({ length: numRows }, (_, row) =>
    Array.from({ length: numCols }, (_, col) => ({
      row,
      col,
      isStart: false,
      isEnd: false,
      isWall: false,
      visited: false,
      path: false,
    }))
  );
};

function App() {
  const [grid, setGrid] = useState(createGrid);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);

  const updateGrid = (modifier) => setGrid(grid.map(row => row.map(modifier)));

  const toggleWall = (row, col) => {
    updateGrid(cell => {
      if (cell.row === row && cell.col === col && !cell.isStart && !cell.isEnd) {
        return { ...cell, isWall: !cell.isWall }; 
      }
      return cell;
    });
  };

  const setNode = (row, col, type) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
      const cell = newGrid[row][col];

      if (type === "start") {
        if (startNode) newGrid[startNode.row][startNode.col].isStart = false;
        cell.isStart = true;
        setStartNode(cell);
      } else if (type === "end") {
        if (endNode) newGrid[endNode.row][endNode.col].isEnd = false;
        cell.isEnd = true;
        setEndNode(cell);
      }
      return newGrid;
    });
  };

  const resetVisitedAndPath = () => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell, visited: false, path: false })));
    setGrid(newGrid);
    return newGrid;
  };

  const clearGrid = () => {
    setGrid(createGrid());
    setStartNode(null);
    setEndNode(null);
  };

  const bfs = () => searchPath("bfs");
  const dfs = () => searchPath("dfs");

  const searchPath = (method) => {
    if (!startNode || !endNode) return;
    const newGrid = resetVisitedAndPath();
    const structure = [startNode];
    const visited = new Set();
    const prev = {};

    while (structure.length) {
      const current = method === "bfs" ? structure.shift() : structure.pop();
      const key = `${current.row}-${current.col}`;
      if (visited.has(key)) continue;
      visited.add(key);
      newGrid[current.row][current.col].visited = true;
      if (current.row === endNode.row && current.col === endNode.col) break;

      getNeighbors(current, newGrid).forEach(neighbor => {
        const nKey = `${neighbor.row}-${neighbor.col}`;
        if (!visited.has(nKey) && !neighbor.isWall) {
          structure.push(neighbor);
          if (!prev[nKey]) prev[nKey] = current;
        }
      });
    }

    // Trace path
    let current = endNode;
    const path = [];
    while (current && !(current.row === startNode.row && current.col === startNode.col)) {
      path.unshift(current);
      current = prev[`${current.row}-${current.col}`];
    }
    path.forEach(node => {
      if (!node.isStart && !node.isEnd) newGrid[node.row][node.col].path = true;
    });
    setGrid(newGrid);
  };

  const getNeighbors = (node, grid) => {
    const { row, col } = node;
    const neighbors = [];
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < numRows - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < numCols - 1) neighbors.push(grid[row][col + 1]);
    return neighbors;
  };

  const handleCellClick = (row, col) => {
    if (!startNode) setNode(row, col, "start");
    else if (!endNode) setNode(row, col, "end");
    else toggleWall(row, col);
  };

  return (
    <div className="App">
      <h1>Pathfinding Visualizer</h1>
      <p>Click to place Start, End, then walls. Run BFS or DFS to find the path.</p>
      <div className="buttons">
        <button onClick={bfs}>Start BFS</button>
        <button onClick={dfs}>Start DFS</button>
        <button onClick={clearGrid}>Reset Grid</button>
      </div>
      <div className="grid">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="row">
            {row.map((cell, colIdx) => {
              let className = "cell";
              if (cell.isStart) className += " start";
              else if (cell.isEnd) className += " end";
              else if (cell.isWall) className += " wall";
              else if (cell.path) className += " path";
              else if (cell.visited) className += " visited";
              return (
                <div
                  key={colIdx}
                  className={className}
                  onClick={() => handleCellClick(cell.row, cell.col)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
