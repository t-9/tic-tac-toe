document.addEventListener('DOMContentLoaded', () => {
  const cells = document.querySelectorAll('.cell');
  const message = document.getElementById('message');
  const restartButton = document.getElementById('restart');
  const themeToggle = document.getElementById('theme-toggle');
  const scoreX = document.getElementById('score-x');
  const scoreO = document.getElementById('score-o');

  let board = ['', '', '', '', '', '', '', '', ''];
  let currentPlayer = 'X'; // 人間: X, AI: O
  let gameActive = true;
  let scores = { X: 0, O: 0 };
  let aiLevel = 'random';

  const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // 縦
    [0, 4, 8], [2, 4, 6]             // 斜め
  ];

  // 人間の手を処理する関数
  const handleCellClick = (e) => {
    if (currentPlayer !== 'X' || !gameActive) return; // AIのターン中はクリック無効
    const index = e.target.dataset.index;
    if (board[index] !== '') return;

    board[index] = 'X';
    e.target.classList.add('x');
    e.target.textContent = 'X';

    if (checkWin('X')) {
      message.textContent = 'Player X wins!';
      scores.X++;
      updateScoreboard();
      highlightWinningCells();
      gameActive = false;
    } else if (board.every(cell => cell !== '')) {
      message.textContent = 'Draw!';
      gameActive = false;
    } else {
      currentPlayer = 'O';
      message.textContent = 'AI (O) is thinking...';
      setTimeout(aiMove, 500); // AIが少し待ってから手を打つ
    }
  };

  // AIレベル選択の変更を検知
  document.getElementById('ai-level').addEventListener('change', (e) => {
    aiLevel = e.target.value;
  });

  // ランダムAIの手を打つ関数
  const randomMove = () => {
    const emptyCells = board.map((val, index) => val === '' ? index : null).filter(val => val !== null);
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return randomIndex;
  };

  // AIの手を打つ関数（レベルに応じて切り替え）
  const aiMove = () => {
    if (!gameActive) return;
    let move;
    if (aiLevel === 'random') {
      move = randomMove();
    } else if (aiLevel === 'minimax') {
      move = getBestMove(board, 'O');
    }
    board[move] = 'O';
    const cell = document.querySelector(`.cell[data-index="${move}"]`);
    cell.classList.add('o');
    cell.textContent = 'O';

    if (checkWin('O')) {
      message.textContent = 'AI (O) wins!';
      scores.O++;
      updateScoreboard();
      highlightWinningCells();
      gameActive = false;
    } else if (board.every(cell => cell !== '')) {
      message.textContent = 'Draw!';
      gameActive = false;
    } else {
      currentPlayer = 'X';
      message.textContent = `Player X's turn`;
    }
  };

  // ミニマックス法を用いて最適な手を返す関数
  const getBestMove = (board, player) => {
    let bestScore = player === 'O' ? -Infinity : Infinity;
    let move;

    // 空いているセルを探索
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = player;
        const score = minimax(board, 0, false, player === 'O' ? 'X' : 'O');
        board[i] = '';
        if (player === 'O' && score > bestScore) {
          bestScore = score;
          move = i;
        } else if (player === 'X' && score < bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  // ミニマックス法の再帰関数
  const minimax = (board, depth, isMaximizing, player) => {
    const result = checkWinner(board);
    if (result !== null) {
      return result === 'O' ? 1 : result === 'X' ? -1 : 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
          board[i] = player;
          const score = minimax(board, depth + 1, false, player === 'O' ? 'X' : 'O');
          board[i] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
          board[i] = player;
          const score = minimax(board, depth + 1, true, player === 'O' ? 'X' : 'O');
          board[i] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  // 勝者を判定する関数
  const checkWinner = (board) => {
    for (const condition of winningConditions) {
      const [a, b, c] = condition;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return board.every(cell => cell !== '') ? 'Draw' : null;
  };

  // 勝敗を判定する関数（プレイヤー指定）
  const checkWin = (player) => {
    return winningConditions.some(condition => {
      const [a, b, c] = condition;
      return board[a] === player && board[b] === player && board[c] === player;
    });
  };

  // 勝利セルのハイライト
  const highlightWinningCells = () => {
    winningConditions.forEach(condition => {
      const [a, b, c] = condition;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        cells[a].classList.add('winner');
        cells[b].classList.add('winner');
        cells[c].classList.add('winner');
      }
    });
  };

  // スコアボードの更新
  const updateScoreboard = () => {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
  };

  // ゲームのリスタート
  const handleRestart = () => {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    message.textContent = `Player X's turn`;
    cells.forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('x', 'o', 'winner');
    });
    // AIのレベルを反映
    aiLevel = document.getElementById('ai-level').value;
  };

  const handleThemeToggle = () => {
    document.body.classList.toggle('night');
  };

  cells.forEach(cell => cell.addEventListener('click', handleCellClick));
  restartButton.addEventListener('click', handleRestart);
  themeToggle.addEventListener('click', handleThemeToggle);
});