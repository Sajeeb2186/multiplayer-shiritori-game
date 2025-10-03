import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const TURN_TIME = 30; // 30 seconds per turn
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

function App() {
  const [gameState, setGameState] = useState(null);
  const [currentWord, setCurrentWord] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const [isValidating, setIsValidating] = useState(false);

  // Fetch game state
  const fetchGameState = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/game/state`);
      setGameState(response.data);
    } catch (error) {
      console.error('Error fetching game state:', error);
      showMessage('Error connecting to server', 'error');
    }
  }, []);

  // Show message helper
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  // Start new game
  const startGame = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/game/start`);
      setGameState(response.data.gameState);
      setTimeLeft(TURN_TIME);
      showMessage('Game started! Player 1 goes first.', 'success');
    } catch (error) {
      console.error('Error starting game:', error);
      showMessage('Error starting game', 'error');
    }
  };

  // Reset game
  const resetGame = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/game/reset`);
      setGameState(response.data.gameState);
      setCurrentWord('');
      setTimeLeft(TURN_TIME);
      showMessage('Game reset', 'info');
    } catch (error) {
      console.error('Error resetting game:', error);
      showMessage('Error resetting game', 'error');
    }
  };

  // Handle timeout
  const handleTimeout = useCallback(async () => {
    if (!gameState || !gameState.gameStarted || gameState.gameOver) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/game/timeout`, {
        playerId: gameState.currentPlayer
      });
      setGameState(response.data.gameState);
      setCurrentWord('');
      setTimeLeft(TURN_TIME);
      showMessage(response.data.message, 'error');
    } catch (error) {
      console.error('Error handling timeout:', error);
    }
  }, [gameState]);

  // Submit word
  const submitWord = async () => {
    if (!currentWord.trim() || isValidating) return;

    setIsValidating(true);
    const word = currentWord.trim().toLowerCase();

    try {
      // First, validate word structure
      const structureResponse = await axios.post(`${API_BASE_URL}/game/submit-word`, {
        word,
        playerId: gameState.currentPlayer
      });

      if (!structureResponse.data.success) {
        // Structure validation failed
        setGameState(structureResponse.data.gameState);
        setCurrentWord('');
        setTimeLeft(TURN_TIME);
        showMessage(structureResponse.data.message, 'error');
        setIsValidating(false);
        return;
      }

      // Structure is valid, now validate meaning
      const meaningResponse = await axios.post(`${API_BASE_URL}/word/validate`, {
        word
      });

      // Confirm word with meaning validation result
      const confirmResponse = await axios.post(`${API_BASE_URL}/game/confirm-word`, {
        word,
        playerId: gameState.currentPlayer,
        isValidMeaning: meaningResponse.data.isValid
      });

      setGameState(confirmResponse.data.gameState);
      setCurrentWord('');
      setTimeLeft(TURN_TIME);
      
      if (meaningResponse.data.isValid) {
        showMessage(`${confirmResponse.data.message} Meaning: ${meaningResponse.data.meaning}`, 'success');
      } else {
        showMessage(confirmResponse.data.message, 'error');
      }

    } catch (error) {
      console.error('Error submitting word:', error);
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

  // Initial load
  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  if (!gameState) {
    return <div className="game-container">Loading...</div>;
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

      {!gameState.gameStarted ? (
        <div style={{ textAlign: 'center' }}>
          <button className="start-btn" onClick={startGame}>
            Start New Game
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default App;