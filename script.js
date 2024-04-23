document.addEventListener('DOMContentLoaded', function () {
  addNumberButtons();
  generateNewPuzzle();
  document
    .getElementById('new-puzzle-button')
    .addEventListener('click', generateNewPuzzle);
});

let selectedCell = null;
let grid = [];

function generateNewPuzzle() {
  grid = [...Array(9)].map(() => Array(9).fill(null));
  fillGrid(grid);

  const board = document.getElementById('sudoku-board');
  board.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const cell = document.createElement('button');
      cell.className = 'sudoku-cell';
      cell.textContent = grid[i][j] || '';
      cell.onclick = () => selectCell(cell, i, j);
      if (grid[i][j]) {
        cell.disabled = true;
      }
      board.appendChild(cell);

      if ((j + 1) % 3 === 0 && j !== 8) {
        cell.classList.add('border-right');
      }
      if ((i + 1) % 3 === 0 && i !== 8) {
        cell.classList.add('border-bottom');
        board.appendChild(cell);
      }
    }
  }
}

function addNumberButtons() {
  const controls = document.querySelector('.game-controls');
  controls.innerHTML = '';

  // Clear button
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear';
  clearButton.onclick = clearSelection;
  controls.appendChild(clearButton);

  // Number buttons 1-9
  for (let i = 1; i <= 9; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.onclick = () => setCellValue(i);
    controls.appendChild(button);
  }
}

function selectCell(cell, i, j) {
  if (selectedCell) {
    selectedCell.classList.remove('selected');
  }
  selectedCell = cell;
  selectedCell.classList.add('selected');
  selectedCell.dataset.row = i;
  selectedCell.dataset.col = j;
}

function setCellValue(value) {
  if (selectedCell) {
    const row = selectedCell.dataset.row;
    const col = selectedCell.dataset.col;
    grid[row][col] = value;
    selectedCell.textContent = value;
    checkForConflicts();
  }
}

function clearSelection() {
  if (selectedCell) {
    const row = selectedCell.dataset.row;
    const col = selectedCell.dataset.col;
    grid[row][col] = null;
    selectedCell.textContent = '';
    selectedCell.classList.remove('conflict');
    checkForConflicts();
  }
}

function checkForConflicts() {
  let conflictFound = false;
  let completedLines = new Set();

  document.querySelectorAll('.sudoku-cell').forEach((cell) => {
    cell.classList.remove('conflict');
  });

  // Check for any conflicts and mark them
  for (let row = 0; row < 9; row++) {
    let rowComplete = true;
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] !== null) {
        // Check row and column
        for (let k = 0; k < 9; k++) {
          if (
            (grid[row][k] === grid[row][col] && k !== col) ||
            (grid[k][col] === grid[row][col] && k !== row)
          ) {
            markConflict(row, col);
            markConflict(k, col);
            markConflict(row, k);
            conflictFound = true;
          }
        }

        // Check 3x3 square
        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        for (let i = startRow; i < startRow + 3; i++) {
          for (let j = startCol; j < startCol + 3; j++) {
            if (grid[i][j] === grid[row][col] && (i !== row || j !== col)) {
              markConflict(row, col);
              markConflict(i, j);
              conflictFound = true;
            }
          }
        }
      } else {
        rowComplete = false; // This row is not completely filled yet
      }
    }
    if (rowComplete) completedLines.add(row);
  }

  if (conflictFound) {
    showToast('Repeated number!', 'error');
  } else if (completedLines.size > 0) {
    showToast('Correct!', 'success');
  }
}

function markConflict(row, col) {
  const conflictCell = document.querySelector(
    `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
  );
  if (conflictCell) {
    conflictCell.classList.add('conflict');
  }
}

function fillGrid(grid) {
  if (solveSudoku(grid)) {
    removeNumbers(grid, 40);
  }
}

function solveSudoku(grid, row = 0, col = 0) {
  if (row === 9 - 1 && col === 9) {
    return true;
  }

  if (col === 9) {
    row++;
    col = 0;
  }

  if (grid[row][col] !== null) {
    return solveSudoku(grid, row, col + 1);
  }

  for (let num = 1; num <= 9; num++) {
    if (isSafe(grid, row, col, num)) {
      grid[row][col] = num;
      if (solveSudoku(grid, row, col + 1)) {
        return true;
      }
      grid[row][col] = null; // Backtrack
    }
  }
  return false; // Trigger backtracking
}

function removeNumbers(grid, count) {
  while (count > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    if (grid[row][col] !== null) {
      grid[row][col] = null;
      count--;
    }
  }
}

function isSafe(grid, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num || grid[x][col] === num) {
      return false;
    }
  }

  let startRow = row - (row % 3);
  let startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }
  return true;
}

function markConflict(row, col) {
  const conflictCell = document.querySelector(
    `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
  );
  if (conflictCell) {
    conflictCell.classList.add('conflict');
  }
}

let timerInterval;
let seconds = 0;
let minutes = 0;

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
    updateTimeDisplay();
  }, 1000);
}

function updateTimeDisplay() {
  const formattedTime =
    (minutes < 10 ? '0' : '') +
    minutes +
    ':' +
    (seconds < 10 ? '0' : '') +
    seconds;
  document.getElementById('timer').textContent = formattedTime;
}

function togglePause() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    document.getElementById('pause-button').textContent = 'Resume';
  } else {
    startTimer();
    document.getElementById('pause-button').textContent = 'Pause';
  }
}

document.addEventListener('DOMContentLoaded', startTimer);

function showToast(message, type) {
  const toastContainer =
    document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  // Set the background color based on the type of message
  if (type === 'error') {
    toast.style.backgroundColor = '#f14539'; // Red for errors
  } else if (type === 'success') {
    toast.style.backgroundColor = '#4CAF50'; // Green for success
  }

  toastContainer.appendChild(toast);
  toastContainer.style.visibility = 'visible';
  toastContainer.style.opacity = '1';

  setTimeout(() => {
    toastContainer.style.visibility = 'hidden';
    toastContainer.style.opacity = '0';
    toastContainer.removeChild(toast);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
  return container;
}

function toggleReset() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  seconds = 0;
  minutes = 0;

  generateNewPuzzle();

  if (selectedCell) {
    selectedCell.classList.remove('selected');
    selectedCell = null;
  }

  startTimer();

  const toastContainer = document.getElementById('toast-container');
  if (toastContainer && toastContainer.childNodes.length > 0) {
    while (toastContainer.firstChild) {
      toastContainer.removeChild(toastContainer.firstChild);
    }
    toastContainer.style.visibility = 'hidden';
    toastContainer.style.opacity = '0';
  }

  document.querySelectorAll('.sudoku-cell.conflict').forEach((cell) => {
    cell.classList.remove('conflict');
  });
}

document.getElementById('reset-button').addEventListener('click', toggleReset);

document.getElementById('what-is-sudoku-btn').onclick = function () {
  document.getElementById('sudoku-dialog').style.display = 'block';
};

// Get the <span> element that closes the modal
var span = document.getElementsByClassName('close')[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  document.getElementById('sudoku-dialog').style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == document.getElementById('sudoku-dialog')) {
    document.getElementById('sudoku-dialog').style.display = 'none';
  }
};
