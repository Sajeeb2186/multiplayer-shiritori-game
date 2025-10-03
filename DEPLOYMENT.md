# 🚀 Vercel Deployment Guide for Multiplayer Shiritori Game

## Prerequisites
- [Vercel Account](https://vercel.com) (free signup with GitHub)
- [Vercel CLI](https://vercel.com/cli) installed globally

## Quick Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   cd /home/sajeeb/web/multiplayer-shiritori-game
   vercel
   ```

4. **Follow the prompts**:
   - Select "yes" to setup and deploy
   - Choose your scope (personal or team)
   - Link to existing project or create new one
   - Select "N" for source directory (use root)
   - Accept the detected framework settings

### Option 2: Deploy via GitHub + Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   # Create GitHub repository first, then:
   git remote add origin https://github.com/yourusername/multiplayer-shiritori-game.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings (auto-detected)
   - Deploy!

## Configuration Details

### Environment Variables
No additional environment variables needed - the app auto-detects production mode.

### Build Settings (Auto-configured)
- **Framework Preset**: Other
- **Build Command**: Automatic (uses vercel.json)
- **Output Directory**: Automatic
- **Install Command**: Automatic

### Project Structure for Vercel
```
multiplayer-shiritori-game/
├── vercel.json                 # Vercel configuration
├── frontend/                   # React app
│   ├── public/index.html      # HTML template
│   ├── src/                   # React components
│   └── package.json           # Frontend dependencies
└── backend/                   # Express API
    ├── server.js              # API routes
    └── package.json           # Backend dependencies
```

## Post-Deployment

1. **Test your deployment**:
   - Frontend will be available at your Vercel URL
   - API routes will be at `your-url/api/*`

2. **Custom Domain** (optional):
   - Go to Vercel dashboard
   - Settings → Domains
   - Add your custom domain

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   ```bash
   # Clear cache and rebuild
   vercel --prod --force
   ```

2. **API Routes Not Working**:
   - Check `vercel.json` routing configuration
   - Ensure backend/server.js exports properly

3. **Environment Issues**:
   - Verify API_BASE_URL logic in App.js
   - Check browser console for CORS errors

### Production URLs:
- **Frontend**: `https://your-project-name.vercel.app`
- **API**: `https://your-project-name.vercel.app/api/*`

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch auto-deploys
- Pull requests create preview deployments
- Rollback available in Vercel dashboard

---

🎉 **Your Multiplayer Shiritori Game is now ready for deployment!**