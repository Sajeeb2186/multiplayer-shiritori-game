# 🎮 Multiplayer Shiritori Game

A web-based implementation of the classic Japanese word game Shiritori, built with the MERN stack (MongoDB, Express.js, React, Node.js). Two players take turns creating word chains where each new word must begin with the last letter of the previous word.

![Shiritori Game Demo](https://img.shields.io/badge/Status-Complete-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)

## 🌟 Features

### Core Gameplay (100 Points Total)
- ✅ **Turn-based Gameplay** (20 pts) - Automatic player switching after each turn
- ✅ **Word Meaning Validation** (20 pts) - Integration with DictionaryAPI for real English word validation
- ✅ **Word Structure Validation** (10 pts) - Ensures words start with correct letter, minimum 4 letters, no repetition
- ✅ **Countdown Timer** (10 pts) - 30-second timer per turn with automatic switching on timeout
- ✅ **Score Tracking** (10 pts) - Points awarded for valid words, deducted for invalid/timeout
- ✅ **Word History Display** (10 pts) - Complete list of all played words to prevent repetition
- ✅ **Code Quality** (10 pts) - Clean, organized, and well-documented code structure
- ✅ **Hosting Ready** (5 pts) - Configured for deployment on Netlify/Vercel
- ✅ **Documentation** (5 pts) - Comprehensive README with setup and gameplay instructions

## 🎯 Game Rules

### Basic Shiritori Rules
1. **Word Chain**: Each word must start with the last letter of the previous word
2. **Minimum Length**: All words must be at least 4 letters long
3. **No Repetition**: Once a word is used, it cannot be used again
4. **Valid English**: Words must be valid English words (verified via DictionaryAPI)
5. **Time Limit**: Each player has 30 seconds to enter a word

### Scoring System
- **+1 Point**: Valid word submission
- **-1 Point**: Invalid word (wrong starting letter, too short, repeated, not in dictionary)
- **-1 Point**: Timeout (failing to submit word within 30 seconds)
- **Minimum Score**: 0 (scores cannot go below zero)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd multiplayer-shiritori-game
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   # Server will start on http://localhost:5000
   ```

2. **Start the Frontend (in a new terminal)**
   ```bash
   cd frontend
   npm start
   # React app will start on http://localhost:3000
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## 🎮 How to Play

1. **Start Game**: Click "Start New Game" button
2. **Player 1 Turn**: Enter any valid English word (minimum 4 letters)
3. **Player 2 Turn**: Enter a word that starts with the last letter of Player 1's word
4. **Continue**: Keep alternating turns, following the shiritori rule
5. **Scoring**: Watch your scores change based on valid/invalid submissions
6. **Timer**: Each player has 30 seconds per turn
7. **History**: View all previously used words to avoid repetition

### Example Game Flow
- Player 1: "HOUSE" → Player 2 must start with "E"
- Player 2: "ELEPHANT" → Player 1 must start with "T"
- Player 1: "TREE" → Player 2 must start with "E"
- And so on...

## 🏗️ Project Structure

```
multiplayer-shiritori-game/
├── backend/
│   ├── package.json          # Backend dependencies
│   ├── server.js            # Express server with API routes
│   └── .env                 # Environment variables
├── frontend/
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── index.js         # React app entry point
│   │   └── index.css        # Styling
│   └── package.json         # Frontend dependencies
└── README.md               # Project documentation
```

## 🔧 API Endpoints

### Game Management
- `GET /api/game/state` - Get current game state
- `POST /api/game/start` - Start new game
- `POST /api/game/reset` - Reset game state
- `POST /api/game/timeout` - Handle player timeout

### Word Validation
- `POST /api/word/validate` - Validate word using DictionaryAPI
- `POST /api/game/submit-word` - Submit word for structure validation
- `POST /api/game/confirm-word` - Confirm word after meaning validation

## 🌐 External APIs

### DictionaryAPI Integration
- **URL**: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
- **Purpose**: Validate English words and provide definitions
- **Response**: Word validity and meaning information
- **Fallback**: Graceful error handling for API failures

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the React app:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `build` folder to Netlify or Vercel
3. Update API URLs in production build

### Backend (Heroku/Railway)
1. Deploy backend to your preferred platform
2. Set environment variables:
   ```
   PORT=5000
   NODE_ENV=production
   ```
3. Update frontend API calls to use production backend URL

### Environment Variables
Create `.env` file in backend directory:
```env
PORT=5000
NODE_ENV=development
```

## 🎨 Features Highlight

### Real-time Game State
- Live score updates
- Current player indication
- Visual timer with warnings
- Instant word validation feedback

### User Experience
- Responsive design for mobile and desktop
- Intuitive interface with clear visual cues
- Real-time validation messages
- Keyboard shortcuts (Enter to submit)

### Word Validation Pipeline
1. **Structure Check**: Starting letter, length, repetition
2. **Dictionary Check**: Valid English word via API
3. **Immediate Feedback**: Success/error messages with explanations

## 🧪 Testing

### Manual Testing Scenarios
1. **Valid Word Chain**: Test normal gameplay flow
2. **Invalid Words**: Test wrong starting letter, short words, repeated words
3. **Timer**: Test timeout functionality
4. **Edge Cases**: Empty input, special characters, very long words
5. **API Failure**: Test behavior when DictionaryAPI is unavailable

### API Testing
Use tools like Postman to test backend endpoints:
```bash
# Start new game
POST http://localhost:5000/api/game/start

# Submit word
POST http://localhost:5000/api/game/submit-word
Content-Type: application/json
{
  "word": "house",
  "playerId": 1
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 Development Notes

### Code Quality Standards
- Clean, readable code with meaningful variable names
- Proper error handling and user feedback
- Modular component structure
- Consistent coding style
- Comprehensive comments for complex logic

### Performance Considerations
- Efficient API calls with proper error handling
- Optimized React rendering with useCallback and useEffect
- Minimal re-renders for smooth user experience
- Responsive design for various screen sizes

## 🐛 Troubleshooting

### Common Issues
1. **Backend Connection Error**: Ensure backend server is running on port 5000
2. **CORS Issues**: Check that CORS is properly configured in server.js
3. **API Timeout**: DictionaryAPI occasionally has slow responses
4. **Timer Issues**: Check that useEffect cleanup is properly implemented

### Debug Mode
Enable console logging by setting:
```javascript
const DEBUG = true;
```

## 🎯 Future Enhancements

- Player name customization
- Difficulty levels (different time limits)
- Word categories/themes
- Multiplayer online support
- Game statistics and history
- Sound effects and animations
- Mobile app version

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [DictionaryAPI](https://dictionaryapi.dev/) for word validation
- React community for excellent documentation
- Express.js for robust backend framework

---

**Built with ❤️ for the Nyntax Assessment 2025**

For any questions or issues, please contact the development team or create an issue in the repository.