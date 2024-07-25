import { useEffect, useState } from 'react'
import './App.css'
import clsx from 'clsx'

/*
GameBoard child component 
  - Considered a presentational or "dumb" component 
    because it doesn't maintain any state. It simply translates inputs
    from parent component to UI elements

Receives props "board" and "onSelectMove" from parent
(props are essentially arguments)

props:
 1) board: game state representing tic-tac-toe board
 2) onSelectMove: function to update board state with selected move

Returns:
  A jsx/html representation of the 2-d array board prop
*/

function GameBoard({board, onSelectMove}) {
  return (
    <div className="board">
      {board.map((row, rowIndex) => {
        return (
          <div key={rowIndex} className="board-row">
            {row.map((symbol, colIndex) => {
              return (
                <div 
                  className={clsx(
                    "board-cell",
                    rowIndex > 0 && "border-top",
                    rowIndex < 2 && "border-bottom",
                    colIndex > 0 && "border-left",
                    colIndex < 2 && "border-right"
                  )}
                  onClick={() => onSelectMove(rowIndex,colIndex)}
                  key={`${rowIndex}${colIndex}`}
                >
                  {symbol}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

/*
App component 

Maintains and controls the game state

Returns the current game board UI
Conditionally renders an outcome message at the end of the game. 
*/
function App() {
  const [board, setBoard] = useState([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ]);

  const [currPlayer, setCurrentPlayer] = useState("x");
  
  const [outcome, setOutcome] = useState(null);

  useEffect(() => {
    // check for game over conditions
    const {
      isGameOver, 
      hasWinner,
      winner
    } = checkGameState(board)

    if (isGameOver && !hasWinner) {
      setOutcome('Cat\'s game!')
    } else if (isGameOver && hasWinner) {
      setOutcome(`${winner} wins!`)
    } 

    // The array at the bottom (i.e. [currPlayer]) is a dependency array
    // whenever currPlayer updates, the above 'effect' code runs
    // Essentially this allows us to check for a game over condition after every turn
  }, [currPlayer])

  const handleSelectMove = (i, j) => {
    if (board[i][j] !== "") {
      // invalid/repeat move
      return;
    }
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);
      newBoard[i][j] = currPlayer;
      return newBoard;
    })

    // toggle to next player
    setCurrentPlayer(prev => prev === "x" ? "o" : "x")
  }

  const handleReset = () => {
    setBoard([
      ["", "", ""],
      ["", "", ""],
      ["", "", ""]
    ])
    setOutcome(null)
    setCurrentPlayer('x')
  }

  return (
    <div className="app">
      {outcome && (
        <span className="gameover-message">{outcome}</span>
      )}

      {
        /* 
        GameBoard Component:
          receives board state and handleSelectMove props

        We pass props to children components with the syntax prop={value}
        The "onEvent" - "handleEvent" pattern is pretty common here
        Mirrors js/html event handler names like onClick, onHover, etc
        */
      }
      <GameBoard 
        board={board} 
        onSelectMove={handleSelectMove}
      />

      <ResetBtn
        board={board}
        onReset={handleReset}
      />

    </div>
  )
}

function ResetBtn({ board, onReset }) {
  
  const isBoardEmpty = board.every(row => row.every(cell => cell === ''));

  return (
    <>
      {!isBoardEmpty && (
        <button
          className="reset-btn"
          onClick={onReset}
        >
          Reset
        </button>
      )}
    </>
  )
}

function checkGameState(board) {
  const paths = getAllPaths(board);
  // check for winning paths
  const winningPath = paths.find(path => isWinningPath(path));
  if (winningPath) {
    return { isGameOver: true, hasWinner: true, winner: winningPath[0] };
  }
  // check for catz game i.e. no viable winning paths 
  const isCatzGame = paths.every(path => isMixedPath(path))
  if (isCatzGame) {
    return { isGameOver: true, hasWinner: false, winner: null };
  }
  // default: game still active
  return { isGameOver: false, hasWinner: false, winner: null };
}

function getAllPaths(board) {
  const diag1 = [0,1,2].map(i => board[i][i])
  const diag2 = [0,1,2].map(i => board[i][2-i])
  const rows = [0,1,2].map(i => [0,1,2].map(j => board[i][j]));
  const cols = [0,1,2].map(i => [0,1,2].map(j => board[j][i]));
  const paths = [diag1, diag2, ...rows, ...cols];
  return paths;
}

function isWinningPath(path) {
  return path[0] === path[1] && path[1] === path[2] && path[0] !== "";
}

function isMixedPath(path) {
  return path.some(symbol => symbol === "x") && path.some(symbol => symbol === "o")
}

export default App

