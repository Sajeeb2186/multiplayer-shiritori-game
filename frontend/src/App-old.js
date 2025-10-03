import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const TURN_TIME = 30; // 30 seconds per turn

function App() {
  // Initialize game state directly on client
  const [gameState, setGameState] = useState({
    players: [
      { id: 1, name: 'Player 1', score: 0 },
      { id: 2, name: 'Player 2', score: 0 }
    ],
    currentPlayer: 1,
    usedWords: [],
    lastWord: '',
    gameStarted: false,
    gameOver: false,
    winner: null
  });
  
  const [currentWord, setCurrentWord] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const [isValidating, setIsValidating] = useState(false);

  // Show message helper
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  // Validate word using Dictionary API directly
  const validateWord = async (word) => {
    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      if (response.status === 200 && response.data) {
        return {
          isValid: true,
          meaning: response.data[0]?.meanings[0]?.definitions[0]?.definition || 'Valid English word'
        };
      }
      return { isValid: false, message: 'Word not found in dictionary' };
    } catch (error) {
      return { isValid: false, message: 'Word not found in dictionary' };
    }
  };

  // Start new game
  const startGame = () => {
    setGameState({
      players: [
        { id: 1, name: 'Player 1', score: 0 },
        { id: 2, name: 'Player 2', score: 0 }
      ],
      currentPlayer: 1,
      usedWords: [],
      lastWord: '',
      gameStarted: true,
      gameOver: false,
      winner: null
    });
    setTimeLeft(TURN_TIME);
    showMessage('Game started! Player 1 goes first.', 'success');
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      players: [
        { id: 1, name: 'Player 1', score: 0 },
        { id: 2, name: 'Player 2', score: 0 }
      ],
      currentPlayer: 1,
      usedWords: [],
      lastWord: '',
      gameStarted: false,
      gameOver: false,
      winner: null
    });
    setCurrentWord('');
    setTimeLeft(TURN_TIME);
    showMessage('Game reset', 'info');
  };

  // Handle timeout
  const handleTimeout = useCallback(() => {
    if (!gameState.gameStarted || gameState.gameOver) return;

    const newGameState = { ...gameState };
    const currentPlayerIndex = newGameState.players.findIndex(p => p.id === gameState.currentPlayer);
    newGameState.players[currentPlayerIndex].score = Math.max(0, newGameState.players[currentPlayerIndex].score - 1);
    newGameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    
    setGameState(newGameState);
    setCurrentWord('');
    setTimeLeft(TURN_TIME);
    showMessage('Time out! -1 point', 'error');
  }, [gameState]);

  // Submit word
  const submitWord = async () => {
    if (!currentWord.trim() || isValidating) return;

    setIsValidating(true);
    const word = currentWord.trim().toLowerCase();

    // Validate word structure
    const errors = [];

    // Check minimum length
    if (word.length < 4) {
      errors.push('Word must be at least 4 letters long');
    }

    // Check if word starts with last letter of previous word
    if (gameState.lastWord && word[0] !== gameState.lastWord.slice(-1)) {
      errors.push(`Word must start with '${gameState.lastWord.slice(-1).toUpperCase()}'`);
    }

    // Check if word has been used before
    if (gameState.usedWords.includes(word)) {
      errors.push('Word has already been used');
    }

    if (errors.length > 0) {
      // Invalid word - player loses a point
      const newGameState = { ...gameState };
      const currentPlayerIndex = newGameState.players.findIndex(p => p.id === gameState.currentPlayer);
      newGameState.players[currentPlayerIndex].score = Math.max(0, newGameState.players[currentPlayerIndex].score - 1);
      newGameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
      
      setGameState(newGameState);
      setCurrentWord('');
      setTimeLeft(TURN_TIME);
      showMessage(`Invalid word! ${errors.join(', ')} -1 point`, 'error');
      setIsValidating(false);
      return;
    }

    // Validate meaning
    try {
      const meaningResult = await validateWord(word);
      
      const newGameState = { ...gameState };
      const currentPlayerIndex = newGameState.players.findIndex(p => p.id === gameState.currentPlayer);

      if (meaningResult.isValid) {
        // Valid word - add point and update game state
        newGameState.players[currentPlayerIndex].score += 1;
        newGameState.usedWords.push(word);
        newGameState.lastWord = word;
        showMessage(`Word accepted! +1 point. Meaning: ${meaningResult.meaning}`, 'success');
      } else {
        // Invalid meaning - lose point
        newGameState.players[currentPlayerIndex].score = Math.max(0, newGameState.players[currentPlayerIndex].score - 1);
        showMessage('Invalid word meaning! -1 point', 'error');
      }

      // Switch to next player
      newGameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
      
      setGameState(newGameState);
      setCurrentWord('');
      setTimeLeft(TURN_TIME);

    } catch (error) {
      showMessage('Error validating word', 'error');
    }

    setIsValidating(false);
  };

  // Timer effect
  useEffect(() => {
    if (!gameState || !gameState.gameStarted || gameState.gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return TURN_TIME;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, handleTimeout]);

  // Reset timer when player changes
  useEffect(() => {
    if (gameState && gameState.gameStarted && !gameState.gameOver) {
      setTimeLeft(TURN_TIME);
    }
  }, [gameState]);

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isValidating) {
      submitWord();
    }
  };

  if (!gameState.gameStarted && !gameState.gameOver) {
    return (
      <div className="game-container">
        <div className="header">
          <h1>🎮 Multiplayer Shiritori Game</h1>
          <p>Each word must start with the last letter of the previous word!</p>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button className="start-btn" onClick={startGame}>
            Start New Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="header">
        <h1>🎮 Multiplayer Shiritori Game</h1>
        <p>Each word must start with the last letter of the previous word!</p>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="game-board">
        <div className={`player-section ${gameState.currentPlayer === 1 ? 'active' : ''}`}>
          <div className="player-name">{gameState.players[0].name}</div>
          <div className="player-score">{gameState.players[0].score}</div>
        </div>

        <div className="game-center">
          <div className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
            {timeLeft}s
          </div>
          
          {gameState.lastWord && (
            <div className="current-word">
              Last word: <strong>{gameState.lastWord.toUpperCase()}</strong>
              <br />
              Next word must start with: <strong>{gameState.lastWord.slice(-1).toUpperCase()}</strong>
            </div>
          )}

          <input
            type="text"
            className="word-input"
            value={currentWord}
            onChange={(e) => setCurrentWord(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={gameState.lastWord ? 
              `Enter word starting with '${gameState.lastWord.slice(-1).toUpperCase()}'` : 
              'Enter any word (min 4 letters)'
            }
            disabled={isValidating}
          />
          
          <div>
            <button 
              className="submit-btn" 
              onClick={submitWord}
              disabled={!currentWord.trim() || isValidating}
            >
              {isValidating ? 'Validating...' : 'Submit Word'}
            </button>
            <button className="reset-btn" onClick={resetGame}>
              Reset Game
            </button>
          </div>
        </div>

        <div className={`player-section ${gameState.currentPlayer === 2 ? 'active' : ''}`}>
          <div className="player-name">{gameState.players[1].name}</div>
          <div className="player-score">{gameState.players[1].score}</div>
        </div>
      </div>

      <div className="word-history">
        <h3>Word History ({gameState.usedWords.length} words)</h3>
        <div className="word-list">
          {gameState.usedWords.map((word, index) => (
            <div key={index} className="word-item">
              {word}
            </div>
          ))}
          {gameState.usedWords.length === 0 && (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>
              No words played yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
);
}

export default App;

export default App;