// Data management for NBA Analytics Hub

class DataManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async fetchWithCache(url, cacheKey) {
        const cached = this.cache.get(cacheKey);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            this.cache.set(cacheKey, {
                data,
                timestamp: now
            });

            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            // Return cached data if available, even if expired
            if (cached) {
                return cached.data;
            }
            throw error;
        }
    }

    async getGames() {
        return this.fetchWithCache('/api/games', 'games');
    }

    async getSentiment() {
        return this.fetchWithCache('/api/sentiment', 'sentiment');
    }

    async getHighlights() {
        return this.fetchWithCache('/api/highlights', 'highlights');
    }

    async predictGame(homeTeam, awayTeam) {
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ homeTeam, awayTeam })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Prediction failed');
        }

        return response.json();
    }

    clearCache() {
        this.cache.clear();
    }

    // Mock data fallback
    getMockStats() {
        return {
            modelAccuracy: '73.2%',
            sentimentScore: 'Positive',
            sentimentClass: 'sentiment-positive',
            activeGames: Math.floor(Math.random() * 15) + 5,
            newHighlights: Math.floor(Math.random() * 20) + 8
        };
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatViews(views) {
        if (typeof views === 'string' && views.includes('M')) {
            return views;
        }
        const num = parseInt(views);
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    getSentimentEmoji(score) {
        if (score > 0.3) return '😊';
        if (score < -0.3) return '😞';
        return '😐';
    }

    getSentimentLabel(score) {
        if (score > 0.3) return 'Positive';
        if (score < -0.3) return 'Negative';
        return 'Neutral';
    }

    getSentimentClass(score) {
        if (score > 0.3) return 'sentiment-positive';
        if (score < -0.3) return 'sentiment-negative';
        return 'sentiment-neutral';
    }
}

// Global data manager instance
window.dataManager = new DataManager();
