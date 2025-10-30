const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes for mock data
app.get('/api/games', (req, res) => {
  const mockGameData = [
    { home: 'LAL', away: 'GSW', homeScore: 118, awayScore: 112, date: '2024-01-15', status: 'Final' },
    { home: 'BOS', away: 'MIA', homeScore: 108, awayScore: 102, date: '2024-01-14', status: 'Final' },
    { home: 'CHI', away: 'LAL', homeScore: 95, awayScore: 110, date: '2024-01-13', status: 'Final' },
    { home: 'GSW', away: 'BOS', homeScore: 121, awayScore: 118, date: '2024-01-12', status: 'Final' },
    { home: 'MIA', away: 'CHI', homeScore: 106, awayScore: 98, date: '2024-01-11', status: 'Final' }
  ];
  res.json(mockGameData);
});

app.get('/api/sentiment', (req, res) => {
  const mockSentiment = {
    overall: 'positive',
    score: 0.642,
    posts: [
      { title: 'Lakers dominate in overtime thriller!', author: 'u/lakers_fan', sentiment: 0.8, subreddit: 'lakers', timestamp: '2024-01-15T20:30:00Z' },
      { title: 'Trade deadline predictions', author: 'u/nba_insider', sentiment: 0.1, subreddit: 'nba', timestamp: '2024-01-15T18:15:00Z' },
      { title: 'LeBron\'s incredible stats this season', author: 'u/king_james', sentiment: 0.9, subreddit: 'lakers', timestamp: '2024-01-15T16:45:00Z' },
      { title: 'Coaching decisions in close games', author: 'u/basketball_analyst', sentiment: -0.2, subreddit: 'lakers', timestamp: '2024-01-15T14:20:00Z' },
      { title: 'Davis injury update', author: 'u/sports_reporter', sentiment: -0.4, subreddit: 'nba', timestamp: '2024-01-15T12:00:00Z' }
    ]
  };
  res.json(mockSentiment);
});

app.get('/api/highlights', (req, res) => {
  const mockHighlights = [
    { 
      id: '1',
      title: 'LeBron James INCREDIBLE Dunk vs Warriors', 
      channel: 'NBA', 
      duration: '0:45', 
      views: '2.1M',
      thumbnail: 'https://picsum.photos/320/180?random=1',
      publishedAt: '2024-01-15T22:00:00Z'
    },
    { 
      id: '2',
      title: 'Anthony Davis Game Winner!', 
      channel: 'House of Highlights', 
      duration: '1:23', 
      views: '856K',
      thumbnail: 'https://picsum.photos/320/180?random=2',
      publishedAt: '2024-01-15T21:30:00Z'
    },
    { 
      id: '3',
      title: 'Lakers Full Game Highlights', 
      channel: 'NBA', 
      duration: '9:47', 
      views: '1.5M',
      thumbnail: 'https://picsum.photos/320/180?random=3',
      publishedAt: '2024-01-15T21:00:00Z'
    },
    {
      id: '4',
      title: 'Best Plays of the Night',
      channel: 'ESPN',
      duration: '3:21',
      views: '987K',
      thumbnail: 'https://picsum.photos/320/180?random=4',
      publishedAt: '2024-01-15T20:15:00Z'
    }
  ];
  res.json(mockHighlights);
});

app.post('/api/predict', (req, res) => {
  const { homeTeam, awayTeam } = req.body;
  
  if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
    return res.status(400).json({ error: 'Invalid team selection' });
  }

  // Mock prediction logic
  const confidence = Math.random() * 0.3 + 0.55; // 55-85%
  const winner = Math.random() > 0.5 ? homeTeam : awayTeam;
  const predictedScore = {
    home: Math.floor(Math.random() * 30) + 95,
    away: Math.floor(Math.random() * 30) + 95
  };

  res.json({
    winner,
    confidence: Math.round(confidence * 1000) / 10,
    predictedScore,
    factors: [
      'Recent team performance',
      'Head-to-head matchups',
      'Home court advantage',
      'Player injuries and availability'
    ]
  });
});

// Serve the main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🏀 NBA Analytics Hub running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} to view the application`);
});
