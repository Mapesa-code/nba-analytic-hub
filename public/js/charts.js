// Chart management for NBA Analytics Hub

class ChartManager {
    constructor() {
        this.charts = {};
        this.isDark = document.documentElement.classList.contains('dark');
        this.setupThemeWatcher();
    }

    setupThemeWatcher() {
        const observer = new MutationObserver(() => {
            const isDarkNow = document.documentElement.classList.contains('dark');
            if (isDarkNow !== this.isDark) {
                this.isDark = isDarkNow;
                this.updateChartsTheme();
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    getThemeColors() {
        return {
            text: this.isDark ? '#F3F4F6' : '#374151',
            grid: this.isDark ? '#374151' : '#E5E7EB',
            background: this.isDark ? '#1F2937' : '#FFFFFF'
        };
    }

    createSentimentChart(sentimentData) {
        const ctx = document.getElementById('sentimentChart');
        if (!ctx) return;

        if (this.charts.sentiment) {
            this.charts.sentiment.destroy();
        }

        const colors = this.getThemeColors();
        const posts = sentimentData.posts || [];
        
        const sentimentCounts = {
            positive: posts.filter(p => p.sentiment > 0.3).length,
            neutral: posts.filter(p => p.sentiment >= -0.3 && p.sentiment <= 0.3).length,
            negative: posts.filter(p => p.sentiment < -0.3).length
        };

        this.charts.sentiment = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    data: [sentimentCounts.positive, sentimentCounts.neutral, sentimentCounts.negative],
                    backgroundColor: ['#10B981', '#6B7280', '#EF4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: colors.text,
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        const colors = this.getThemeColors();
        
        // Mock performance data
        const performanceData = [
            { week: 'Week 1', accuracy: 68 },
            { week: 'Week 2', accuracy: 71 },
            { week: 'Week 3', accuracy: 69 },
            { week: 'Week 4', accuracy: 73 },
            { week: 'Week 5', accuracy: 75 }
        ];

        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: performanceData.map(d => d.week),
                datasets: [{
                    label: 'Prediction Accuracy (%)',
                    data: performanceData.map(d => d.accuracy),
                    borderColor: '#5D5CDE',
                    backgroundColor: '#5D5CDE20',
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#5D5CDE',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: colors.grid
                        },
                        ticks: {
                            color: colors.text
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: colors.grid
                        },
                        ticks: {
                            color: colors.text,
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: colors.text
                        }
                    }
                }
            }
        });
    }

    createFeatureChart() {
        const ctx = document.getElementById('featureChart');
        if (!ctx) return;

        if (this.charts.feature) {
            this.charts.feature.destroy();
        }

        const colors = this.getThemeColors();
        
        const featureData = [
            { feature: 'Home Advantage', importance: 0.8 },
            { feature: 'Recent Form', importance: 0.72 },
            { feature: 'Team Rating', importance: 0.65 },
            { feature: 'Injuries', importance: 0.45 },
            { feature: 'Rest Days', importance: 0.38 }
        ];

        this.charts.feature = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: featureData.map(d => d.feature),
                datasets: [{
                    label: 'Importance Score',
                    data: featureData.map(d => d.importance),
                    backgroundColor: '#5D5CDE',
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: colors.text,
                            maxRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 1,
                        grid: {
                            color: colors.grid
                        },
                        ticks: {
                            color: colors.text,
                            callback: function(value) {
                                return (value * 100).toFixed(0) + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateChartsTheme() {
        // Recreate all charts with new theme
        Object.keys(this.charts).forEach(chartKey => {
            if (this.charts[chartKey]) {
                const chart = this.charts[chartKey];
                const colors = this.getThemeColors();
                
                // Update chart options
                if (chart.options.scales) {
                    Object.keys(chart.options.scales).forEach(scaleKey => {
                        if (chart.options.scales[scaleKey].grid) {
                            chart.options.scales[scaleKey].grid.color = colors.grid;
                        }
                        if (chart.options.scales[scaleKey].ticks) {
                            chart.options.scales[scaleKey].ticks.color = colors.text;
                        }
                    });
                }
                
                if (chart.options.plugins?.legend?.labels) {
                    chart.options.plugins.legend.labels.color = colors.text;
                }
                
                chart.update();
            }
        });
    }

    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }

    initializeAllCharts(sentimentData) {
        this.createSentimentChart(sentimentData);
        this.createPerformanceChart();
        this.createFeatureChart();
    }
}

// Global chart manager instance
window.chartManager = new ChartManager();
