const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Game state
let gameState = {
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
};

// Routes

// Get current game state
app.get('/api/game/state', (req, res) => {
  res.json(gameState);
});

// Start new game
app.post('/api/game/start', (req, res) => {
  gameState = {
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
  };
  res.json({ message: 'Game started', gameState });
});

// Validate word using Dictionary API
app.post('/api/word/validate', async (req, res) => {
  const { word } = req.body;

  try {
    // Check if word exists in dictionary
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    
    if (response.status === 200 && response.data) {
      res.json({ 
        isValid: true, 
        meaning: response.data[0]?.meanings[0]?.definitions[0]?.definition || 'Valid English word',
        word: word.toLowerCase()
      });
    } else {
      res.json({ isValid: false, message: 'Word not found in dictionary' });
    }
  } catch (error) {
    if (error.response?.status === 404) {
      res.json({ isValid: false, message: 'Word not found in dictionary' });
    } else {
      res.status(500).json({ error: 'Error validating word', message: error.message });
    }
  }
});

// Submit word
app.post('/api/game/submit-word', (req, res) => {
  const { word, playerId } = req.body;
  const wordLower = word.toLowerCase();

  // Validate game state
  if (!gameState.gameStarted || gameState.gameOver) {
    return res.status(400).json({ error: 'Game not in progress' });
  }

  if (playerId !== gameState.currentPlayer) {
    return res.status(400).json({ error: 'Not your turn' });
  }

  // Validate word structure
  const errors = [];

  // Check minimum length
  if (wordLower.length < 4) {
    errors.push('Word must be at least 4 letters long');
  }

  // Check if word starts with last letter of previous word
  if (gameState.lastWord && wordLower[0] !== gameState.lastWord.slice(-1)) {
    errors.push(`Word must start with '${gameState.lastWord.slice(-1).toUpperCase()}'`);
  }

  // Check if word has been used before
  if (gameState.usedWords.includes(wordLower)) {
    errors.push('Word has already been used');
  }

  if (errors.length > 0) {
    // Invalid word - player loses a point
    const currentPlayerIndex = gameState.players.findIndex(p => p.id === playerId);
    gameState.players[currentPlayerIndex].score = Math.max(0, gameState.players[currentPlayerIndex].score - 1);
    
    // Switch to next player
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    
    return res.json({ 
      success: false, 
      errors, 
      gameState,
      message: 'Invalid word! Lost 1 point.'
    });
  }

  // Valid word structure - now we need to validate meaning externally
  res.json({ 
    success: true, 
    validStructure: true,
    word: wordLower,
    message: 'Word structure is valid. Please validate meaning.'
  });
});

// Confirm word after meaning validation
app.post('/api/game/confirm-word', (req, res) => {
  const { word, playerId, isValidMeaning } = req.body;
  const wordLower = word.toLowerCase();

  if (playerId !== gameState.currentPlayer) {
    return res.status(400).json({ error: 'Not your turn' });
  }

  const currentPlayerIndex = gameState.players.findIndex(p => p.id === playerId);

  if (isValidMeaning) {
    // Valid word - add point and update game state
    gameState.players[currentPlayerIndex].score += 1;
    gameState.usedWords.push(wordLower);
    gameState.lastWord = wordLower;
  } else {
    // Invalid meaning - lose point
    gameState.players[currentPlayerIndex].score = Math.max(0, gameState.players[currentPlayerIndex].score - 1);
  }

  // Switch to next player
  gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;

  res.json({ 
    success: isValidMeaning, 
    gameState,
    message: isValidMeaning ? 'Word accepted! +1 point' : 'Invalid word meaning! -1 point'
  });
});

// Handle time out
app.post('/api/game/timeout', (req, res) => {
  const { playerId } = req.body;

  if (playerId !== gameState.currentPlayer) {
    return res.status(400).json({ error: 'Not your turn' });
  }

  // Player loses a point for timeout
  const currentPlayerIndex = gameState.players.findIndex(p => p.id === playerId);
  gameState.players[currentPlayerIndex].score = Math.max(0, gameState.players[currentPlayerIndex].score - 1);

  // Switch to next player
  gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;

  res.json({ 
    success: false, 
    gameState,
    message: 'Time out! -1 point'
  });
});

// Reset game
app.post('/api/game/reset', (req, res) => {
  gameState = {
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
  };
  res.json({ message: 'Game reset', gameState });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});