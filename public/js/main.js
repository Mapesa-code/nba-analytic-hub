// Main application logic for NBA Analytics Hub

class NBAApp {
    constructor() {
        this.activeTab = 'predictions';
        this.isLoading = false;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupDarkMode();
        await this.loadInitialData();
    }

    setupDarkMode() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
    }

    setupEventListeners() {
        // Tab functionality
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Game prediction
        document.getElementById('predictGame').addEventListener('click', () => this.handlePrediction());

        // Refresh data
        document.getElementById('refreshAll').addEventListener('click', () => this.refreshAllData());

        // Highlight search
        document.getElementById('searchHighlights').addEventListener('click', () => this.searchHighlights());

        // Enter key support for search
        document.getElementById('highlightSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchHighlights();
            }
        });
    }

    switchTab(tabName) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active', 'border-blue-500', 'text-blue-600');
            button.classList.add('text-gray-500');
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Add active class to clicked tab
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        activeButton.classList.add('active', 'border-b-2', 'border-blue-500', 'text-blue-600');
        activeButton.classList.remove('text-gray-500');

        document.getElementById(`${tabName}-tab`).classList.remove('hidden');
        this.activeTab = tabName;

        // Load tab-specific data if needed
        if (tabName === 'analytics' && !window.chartManager.charts.performance) {
            this.loadAnalyticsData();
        }
    }

    async loadInitialData() {
        this.showLoading(true);
        
        try {
            await Promise.all([
                this.updateStats(),
                this.loadRecentGames(),
                this.loadSentimentData(),
                this.loadHighlights()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showCustomAlert('Failed to load some data. Using fallback data.');
        } finally {
            this.showLoading(false);
        }
    }

    async updateStats() {
        try {
            const stats = window.dataManager.getMockStats();
            
            document.getElementById('modelAccuracy').textContent = stats.modelAccuracy;
            
            const sentimentElement = document.getElementById('sentimentScore');
            sentimentElement.textContent = stats.sentimentScore;
            sentimentElement.className = `text-2xl font-bold ${stats.sentimentClass}`;
            
            document.getElementById('activeGames').textContent = stats.activeGames;
            document.getElementById('newHighlights').textContent = stats.newHighlights;
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    async loadRecentGames() {
        try {
            const games = await window.dataManager.getGames();
            const container = document.getElementById('recentGames');
            
            container.innerHTML = games.map(game => `
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex justify-between items-center card-hover">
                    <div>
                        <span class="font-medium">${game.home} vs ${game.away}</span>
                        <span class="text-sm text-gray-600 dark:text-gray-400 ml-2">${window.dataManager.formatDate(game.date)}</span>
                    </div>
                    <div class="text-right">
                        <div class="font-medium">${game.homeScore} - ${game.awayScore}</div>
                        <div class="text-xs text-gray-500">${game.status}</div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading recent games:', error);
            document.getElementById('recentGames').innerHTML = '<p class="text-gray-500">Failed to load recent games</p>';
        }
    }

    async loadSentimentData() {
        try {
            const sentimentData = await window.dataManager.getSentiment();
            const container = document.getElementById('redditPosts');
            
            container.innerHTML = sentimentData.posts.map(post => `
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 card-hover">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-medium text-sm flex-1 mr-2">${post.title}</h4>
                        <span class="${window.dataManager.getSentimentClass(post.sentiment)} text-lg">
                            ${window.dataManager.getSentimentEmoji(post.sentiment)}
                        </span>
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                        <span>by ${post.author} in r/${post.subreddit}</span>
                        <span>${window.dataManager.formatDate(post.timestamp)}</span>
                    </div>
                </div>
            `).join('');

            // Update sentiment display
            this.updateSentimentDisplay(sentimentData.score);
            
            // Initialize sentiment chart
            window.chartManager.createSentimentChart(sentimentData);
        } catch (error) {
            console.error('Error loading sentiment data:', error);
            document.getElementById('redditPosts').innerHTML = '<p class="text-gray-500">Failed to load sentiment data</p>';
        }
    }

    updateSentimentDisplay(score) {
        const indicator = document.getElementById('sentimentIndicator');
        const label = document.getElementById('sentimentLabel');
        const value = document.getElementById('sentimentValue');

        indicator.textContent = window.dataManager.getSentimentEmoji(score);
        label.textContent = window.dataManager.getSentimentLabel(score);
        label.className = `text-lg font-medium ${window.dataManager.getSentimentClass(score)}`;
        value.textContent = `Score: ${score.toFixed(3)}`;
    }

    async loadHighlights() {
        try {
            const highlights = await window.dataManager.getHighlights();
            const container = document.getElementById('highlightsList');
            
            container.innerHTML = highlights.map(highlight => `
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 highlight-card cursor-pointer" 
                     onclick="app.playHighlight('${highlight.id}', '${highlight.title.replace(/'/g, "\\'")}')">
                    <div class="aspect-video bg-gray-200 dark:bg-gray-600 rounded mb-3 flex items-center justify-center overflow-hidden">
                        <img src="${highlight.thumbnail}" alt="${highlight.title}" class="w-full h-full object-cover" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="text-3xl" style="display: none;">▶️</div>
                    </div>
                    <h4 class="font-medium text-sm mb-1 line-clamp-2">${highlight.title}</h4>
                    <div class="text-xs text-gray-600 dark:text-gray-400">
                        ${highlight.channel} • ${highlight.duration} • ${window.dataManager.formatViews(highlight.views)} views
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading highlights:', error);
            document.getElementById('highlightsList').innerHTML = '<p class="text-gray-500">Failed to load highlights</p>';
        }
    }

    playHighlight(id, title) {
        const player = document.getElementById('videoPlayer');
        player.innerHTML = `
            <div class="w-full h-full bg-black rounded-lg flex items-center justify-center">
                <div class="text-center text-white p-6">
                    <div class="text-4xl mb-4">▶️</div>
                    <p class="text-lg mb-2">Now Playing:</p>
                    <p class="font-medium mb-4">${title}</p>
                    <p class="text-sm opacity-75">Demo: Video player would be embedded here</p>
                    <p class="text-xs opacity-50 mt-2">Video ID: ${id}</p>
                </div>
            </div>
        `;
    }

    async handlePrediction() {
        const homeTeam = document.getElementById('homeTeam').value;
        const awayTeam = document.getElementById('awayTeam').value;

        if (!homeTeam || !awayTeam) {
            this.showCustomAlert('Please select both teams');
            return;
        }

        if (homeTeam === awayTeam) {
            this.showCustomAlert('Please select different teams');
            return;
        }

        const button = document.getElementById('predictGame');
        const originalText = button.textContent;
        button.textContent = 'Predicting...';
        button.disabled = true;

        try {
            const prediction = await window.dataManager.predictGame(homeTeam, awayTeam);
            
            document.getElementById('predictionResult').classList.remove('hidden');
            document.getElementById('predictionDetails').innerHTML = `
                <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600 mb-2">${prediction.winner} Wins</div>
                    <div class="text-lg text-gray-700 dark:text-gray-300 mb-2">
                        Confidence: ${prediction.confidence}%
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Predicted Score: ${prediction.predictedScore.home} - ${prediction.predictedScore.away}
                    </div>
                    <div class="text-left">
                        <p class="text-sm font-medium mb-2">Key Factors:</p>
                        <ul class="text-xs text-gray-500 space-y-1">
                            ${prediction.factors.map(factor => `<li>• ${factor}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Prediction error:', error);
            this.showCustomAlert('Prediction failed: ' + error.message);
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    async refreshAllData() {
        const button = document.getElementById('refreshAll');
        const spinner = document.getElementById('refreshSpinner');
        
        button.disabled = true;
        spinner.classList.remove('hidden');
        
        // Clear cache
        window.dataManager.clearCache();
        
        try {
            await this.loadInitialData();
            this.showCustomAlert('Data refreshed successfully!');
        } catch (error) {
            console.error('Refresh error:', error);
            this.showCustomAlert('Failed to refresh some data');
        } finally {
            button.disabled = false;
            spinner.classList.add('hidden');
        }
    }

    searchHighlights() {
        const query = document.getElementById('highlightSearch').value.trim();
        if (!query) {
            this.showCustomAlert('Please enter a search query');
            return;
        }
        
        this.showCustomAlert(`Searching for: "${query}"\n\nIn a real implementation, this would:\n• Query YouTube API\n• Filter results by duration and relevance\n• Update the highlights list\n• Cache results for better performance`);
    }

    async loadAnalyticsData() {
        try {
            // Initialize charts if not already done
            if (!window.chartManager.charts.performance) {
                window.chartManager.createPerformanceChart();
            }
            if (!window.chartManager.charts.feature) {
                window.chartManager.createFeatureChart();
            }
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
        this.isLoading = show;
    }

    showCustomAlert(message) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <div class="flex items-start space-x-3">
                    <div class="text-blue-600 text-xl">ℹ️</div>
                    <div class="flex-1">
                        <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">${message}</p>
                    </div>
                </div>
                <div class="flex justify-end mt-6">
                    <button class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors" onclick="this.closest('.fixed').remove()">
                        OK
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Auto-remove after 5 seconds for simple messages
        if (message.length < 100) {
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 5000);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NBAApp();
});
