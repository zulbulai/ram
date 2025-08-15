// Ram Naam Jap Counter App - Mobile Optimized with Dual Audio
class RamNameJapApp {
    constructor() {
        this.currentCount = 0;
        this.dailyGoal = 2400;
        this.currentScreen = 'home';
        this.chart = null;
        this.currentPeriod = 'daily';
        this.soundEnabled = true;
        this.backgroundMusicEnabled = true;
        this.backgroundVolume = 0.3;
        this.tapVolume = 0.7;
        this.achievements = [100, 500, 1000, 2400, 5000, 10000, 25000, 50000, 100000];
        this.audioInitialized = false;
        
        // Audio elements
        this.backgroundAudio = null;
        this.namAudio = null;
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadData();
        this.initializeAudio();
        this.setupEventListeners();
        this.updateDisplay();
        this.hideLoadingScreen();
        this.updateProgressRing();
        this.updateDailyGoal();
        this.renderAchievements();
        
        // Try to start background music immediately and set up fallbacks
        setTimeout(() => {
            this.startBackgroundMusic();
        }, 500);
    }

    initializeAudio() {
        // Initialize background audio
        this.backgroundAudio = document.getElementById('background-audio');
        if (this.backgroundAudio) {
            this.backgroundAudio.volume = this.backgroundVolume;
            this.backgroundAudio.loop = true;
            this.backgroundAudio.preload = 'auto';
            
            // Add event listeners for audio
            this.backgroundAudio.addEventListener('canplaythrough', () => {
                console.log('Background audio can play through');
                if (this.backgroundMusicEnabled) {
                    this.tryPlayBackgroundMusic();
                }
            });
            
            this.backgroundAudio.addEventListener('loadeddata', () => {
                console.log('Background audio loaded');
                if (this.backgroundMusicEnabled) {
                    this.tryPlayBackgroundMusic();
                }
            });
        }

        // Initialize tap audio
        this.namAudio = document.getElementById('nam-audio');
        if (this.namAudio) {
            this.namAudio.volume = this.tapVolume;
            this.namAudio.preload = 'auto';
        }
        
        this.audioInitialized = true;
    }

    tryPlayBackgroundMusic() {
        if (!this.backgroundAudio || !this.backgroundMusicEnabled) return;
        
        const playPromise = this.backgroundAudio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Background music started successfully');
            }).catch(error => {
                console.log('Background music autoplay prevented:', error);
                // Don't set up fallback here, it's handled in startBackgroundMusic
            });
        }
    }

    startBackgroundMusic() {
        if (!this.backgroundMusicEnabled || !this.backgroundAudio) return;

        // Multiple attempts to play background music
        this.tryPlayBackgroundMusic();
        
        // Set up autoplay fallback for first user interaction
        this.setupAutoplayFallback();
        
        // Try again after a short delay
        setTimeout(() => {
            if (this.backgroundAudio && this.backgroundAudio.paused && this.backgroundMusicEnabled) {
                this.tryPlayBackgroundMusic();
            }
        }, 1000);
    }

    setupAutoplayFallback() {
        let musicStarted = false;
        
        const startMusic = () => {
            if (musicStarted || !this.backgroundMusicEnabled || !this.backgroundAudio) return;
            
            this.backgroundAudio.play().then(() => {
                musicStarted = true;
                console.log('Background music started via user interaction');
            }).catch(console.error);
        };

        // Add multiple event listeners to catch first interaction
        const events = ['touchstart', 'touchend', 'click', 'keydown'];
        events.forEach(eventType => {
            document.addEventListener(eventType, startMusic, { once: true, passive: true });
        });
        
        // Clean up after 10 seconds
        setTimeout(() => {
            events.forEach(eventType => {
                document.removeEventListener(eventType, startMusic);
            });
        }, 10000);
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.classList.add('hidden');
            
            // Try to start music again after loading screen disappears
            setTimeout(() => {
                if (this.backgroundAudio && this.backgroundAudio.paused && this.backgroundMusicEnabled) {
                    this.tryPlayBackgroundMusic();
                }
            }, 100);
        }, 1500);
    }

    setupEventListeners() {
        // Set up navigation first
        this.setupNavigation();
        
        // Set up tap areas for counter (everywhere except header and footer)
        this.setupTapAreas();
        
        // Set up other interactive elements
        this.setupOtherEventListeners();

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.currentScreen === 'home') {
                e.preventDefault();
                this.incrementCounter();
            }
        });

        // Page visibility change - pause/resume background music
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.backgroundAudio && !this.backgroundAudio.paused) {
                    this.backgroundAudio.pause();
                }
            } else {
                if (this.backgroundAudio && this.backgroundMusicEnabled) {
                    this.tryPlayBackgroundMusic();
                }
            }
        });
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            // Use both touch and click events for better mobile support
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const screen = btn.getAttribute('data-screen');
                this.navigateToScreen(screen);
                
                // Try to start background music on first navigation
                this.ensureBackgroundMusic();
            }, { passive: false });

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const screen = btn.getAttribute('data-screen');
                this.navigateToScreen(screen);
                
                // Try to start background music on first click
                this.ensureBackgroundMusic();
            });
        });
    }

    ensureBackgroundMusic() {
        if (this.backgroundAudio && this.backgroundAudio.paused && this.backgroundMusicEnabled) {
            this.tryPlayBackgroundMusic();
        }
    }

    setupTapAreas() {
        // Create tap areas covering the entire screen except header and footer
        document.addEventListener('touchend', (e) => {
            this.handleTap(e);
        }, { passive: false });

        document.addEventListener('click', (e) => {
            this.handleTap(e);
        });
    }

    handleTap(e) {
        // Only handle taps on home screen
        if (this.currentScreen !== 'home') return;

        // Check if tap is in excluded areas
        const target = e.target;
        const excludedSelectors = ['.header', '.bottom-nav', 'header', 'footer', 'nav', '.nav-btn'];
        
        for (let selector of excludedSelectors) {
            if (target.closest(selector)) {
                return; // Don't increment counter for excluded areas
            }
        }

        // Don't handle taps on interactive elements like buttons or links
        if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'INPUT') {
            return;
        }

        // Increment counter for valid tap areas
        e.preventDefault();
        this.incrementCounter();
        
        // Ensure background music starts on first tap
        this.ensureBackgroundMusic();
    }

    setupOtherEventListeners() {
        // Chart tabs
        const chartTabs = document.querySelectorAll('.chart-tab');
        chartTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation();
                const period = tab.getAttribute('data-period');
                this.switchChartPeriod(period);
            });
        });

        // Settings event listeners
        this.setupSettingsEventListeners();

        // Achievement modal
        const closeAchievementBtn = document.getElementById('close-achievement');
        if (closeAchievementBtn) {
            closeAchievementBtn.addEventListener('click', () => {
                this.hideAchievementModal();
            });
        }
    }

    setupSettingsEventListeners() {
        // Save daily goal
        const saveGoalBtn = document.getElementById('save-goal-btn');
        if (saveGoalBtn) {
            saveGoalBtn.addEventListener('click', () => {
                this.saveDailyGoal();
            });
        }

        // Sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                this.soundEnabled = e.target.checked;
                this.saveData();
            });
        }

        // Background music toggle
        const backgroundMusicToggle = document.getElementById('background-music-toggle');
        if (backgroundMusicToggle) {
            backgroundMusicToggle.addEventListener('change', (e) => {
                this.backgroundMusicEnabled = e.target.checked;
                this.toggleBackgroundMusic();
                this.saveData();
            });
        }

        // Background volume
        const backgroundVolumeSlider = document.getElementById('background-volume');
        if (backgroundVolumeSlider) {
            backgroundVolumeSlider.addEventListener('input', (e) => {
                this.backgroundVolume = e.target.value / 100;
                if (this.backgroundAudio) {
                    this.backgroundAudio.volume = this.backgroundVolume;
                }
                this.saveData();
            });
        }

        // Tap volume
        const tapVolumeSlider = document.getElementById('tap-volume');
        if (tapVolumeSlider) {
            tapVolumeSlider.addEventListener('input', (e) => {
                this.tapVolume = e.target.value / 100;
                if (this.namAudio) {
                    this.namAudio.volume = this.tapVolume;
                }
                this.saveData();
            });
        }

        // Data management buttons
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        const resetBtn = document.getElementById('reset-data-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetData();
            });
        }
    }

    toggleBackgroundMusic() {
        if (!this.backgroundAudio) return;

        if (this.backgroundMusicEnabled) {
            this.tryPlayBackgroundMusic();
        } else {
            this.backgroundAudio.pause();
        }
    }

    incrementCounter() {
        this.currentCount++;
        this.storeTodayCount();
        this.updateDisplay();
        this.updateProgressRing();
        this.updateDailyGoal();
        this.saveData();
        this.checkAchievements();
        this.playTapSound();
        this.addCountAnimation();

        // Haptic feedback if supported
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    storeTodayCount() {
        const today = new Date().toDateString();
        const dailyData = this.getData('dailyData') || {};
        dailyData[today] = (dailyData[today] || 0) + 1;
        this.setData('dailyData', dailyData);
    }

    addCountAnimation() {
        const countDisplay = document.getElementById('count-display');
        if (countDisplay) {
            countDisplay.classList.add('animate');
            setTimeout(() => {
                countDisplay.classList.remove('animate');
            }, 300);
        }
    }

    playTapSound() {
        if (!this.soundEnabled) return;
        
        if (this.namAudio) {
            try {
                // Reset audio to beginning and play
                this.namAudio.currentTime = 0;
                this.namAudio.play().catch(console.error);
            } catch (e) {
                console.log('Error playing tap sound:', e);
            }
        } else {
            // Fallback beep sound using Web Audio API
            this.playBeepSound();
        }
    }

    playBeepSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(this.tapVolume * 0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    updateDisplay() {
        const countDisplay = document.getElementById('count-display');
        const lifetimeCount = document.getElementById('lifetime-count');
        
        if (countDisplay) {
            countDisplay.textContent = this.currentCount.toLocaleString('hi-IN');
        }
        if (lifetimeCount) {
            lifetimeCount.textContent = this.currentCount.toLocaleString('hi-IN');
        }
    }

    updateProgressRing() {
        const progressRing = document.querySelector('.progress-ring-circle');
        if (!progressRing) return;
        
        const radius = 130;
        const circumference = 2 * Math.PI * radius;
        
        const dailyProgress = Math.min(this.getTodayCount() / this.dailyGoal, 1);
        const offset = circumference - (dailyProgress * circumference);
        
        progressRing.style.strokeDasharray = circumference;
        progressRing.style.strokeDashoffset = offset;
    }

    updateDailyGoal() {
        const todayCount = this.getTodayCount();
        const percentage = Math.min((todayCount / this.dailyGoal) * 100, 100);
        
        const goalText = document.getElementById('daily-goal-text');
        const goalPercentage = document.getElementById('goal-percentage');
        const goalFill = document.getElementById('goal-progress-fill');
        
        if (goalText) goalText.textContent = this.dailyGoal.toLocaleString('hi-IN');
        if (goalPercentage) goalPercentage.textContent = percentage.toFixed(0) + '%';
        if (goalFill) goalFill.style.width = percentage + '%';
        
        if (percentage >= 100 && goalPercentage) {
            goalPercentage.style.color = 'var(--devotional-gold)';
        }
    }

    getTodayCount() {
        const today = new Date().toDateString();
        const dailyData = this.getData('dailyData') || {};
        return dailyData[today] || 0;
    }

    navigateToScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        // Update navigation active state
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll(`[data-screen="${screenName}"]`).forEach(btn => {
            btn.classList.add('active');
        });
        
        this.currentScreen = screenName;
        
        // Initialize chart if navigating to dashboard
        if (screenName === 'dashboard') {
            setTimeout(() => {
                this.initializeChart();
                this.renderAchievements();
            }, 100);
        }
    }

    initializeChart() {
        const ctx = document.getElementById('stats-chart');
        if (!ctx) return;

        if (this.chart) {
            this.chart.destroy();
        }

        const chartData = this.getChartData(this.currentPeriod);
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'नाम जप',
                    data: chartData.data,
                    backgroundColor: '#1FB8CD',
                    borderColor: '#FFD700',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 140, 0, 0.1)'
                        },
                        ticks: {
                            color: '#8B4513',
                            font: {
                                family: 'Noto Sans Devanagari'
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#8B4513',
                            font: {
                                family: 'Noto Sans Devanagari'
                            }
                        }
                    }
                }
            }
        });
    }

    getChartData(period) {
        const dailyData = this.getData('dailyData') || {};
        const now = new Date();
        
        let labels = [];
        let data = [];
        
        if (period === 'daily') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = date.toDateString();
                const dayName = date.toLocaleDateString('hi-IN', { weekday: 'short' });
                
                labels.push(dayName);
                data.push(dailyData[dateStr] || 0);
            }
        } else if (period === 'weekly') {
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date(now);
                weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
                
                let weekTotal = 0;
                for (let j = 0; j < 7; j++) {
                    const date = new Date(weekStart);
                    date.setDate(date.getDate() + j);
                    const dateStr = date.toDateString();
                    weekTotal += dailyData[dateStr] || 0;
                }
                
                labels.push(`सप्ताह ${4-i}`);
                data.push(weekTotal);
            }
        } else if (period === 'monthly') {
            for (let i = 5; i >= 0; i--) {
                const month = new Date(now);
                month.setMonth(month.getMonth() - i);
                const monthName = month.toLocaleDateString('hi-IN', { month: 'short' });
                
                let monthTotal = 0;
                const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
                
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(month.getFullYear(), month.getMonth(), day);
                    const dateStr = date.toDateString();
                    monthTotal += dailyData[dateStr] || 0;
                }
                
                labels.push(monthName);
                data.push(monthTotal);
            }
        } else if (period === 'yearly') {
            for (let i = 2; i >= 0; i--) {
                const year = now.getFullYear() - i;
                let yearTotal = 0;
                
                for (let month = 0; month < 12; month++) {
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day);
                        const dateStr = date.toDateString();
                        yearTotal += dailyData[dateStr] || 0;
                    }
                }
                
                labels.push(year.toString());
                data.push(yearTotal);
            }
        }
        
        return { labels, data };
    }

    switchChartPeriod(period) {
        this.currentPeriod = period;
        
        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const targetTab = document.querySelector(`[data-period="${period}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        this.initializeChart();
    }

    checkAchievements() {
        this.achievements.forEach(milestone => {
            if (this.currentCount === milestone && !this.hasAchievement(milestone)) {
                this.showAchievementModal(milestone);
                this.saveAchievement(milestone);
            }
        });
    }

    hasAchievement(milestone) {
        const achievements = this.getData('achievements') || [];
        return achievements.includes(milestone);
    }

    saveAchievement(milestone) {
        const achievements = this.getData('achievements') || [];
        achievements.push(milestone);
        this.setData('achievements', achievements);
    }

    showAchievementModal(milestone) {
        const modal = document.getElementById('achievement-modal');
        const title = document.getElementById('achievement-title');
        const message = document.getElementById('achievement-message');
        
        if (modal && title && message) {
            title.textContent = 'बधाई हो! 🎉';
            message.textContent = `आपने ${milestone.toLocaleString('hi-IN')} नाम जप पूरे किए हैं!`;
            
            modal.classList.remove('hidden');
            
            setTimeout(() => {
                this.hideAchievementModal();
            }, 3000);
        }
    }

    hideAchievementModal() {
        const modal = document.getElementById('achievement-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    renderAchievements() {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;
        
        const earnedAchievements = this.getData('achievements') || [];
        
        grid.innerHTML = this.achievements.map(milestone => {
            const earned = earnedAchievements.includes(milestone);
            return `
                <div class="achievement-badge ${earned ? 'earned' : ''}">
                    <div class="achievement-icon">${earned ? '🏆' : '🔒'}</div>
                    <div class="achievement-count">${milestone.toLocaleString('hi-IN')}</div>
                </div>
            `;
        }).join('');
    }

    saveDailyGoal() {
        const input = document.getElementById('daily-goal-input');
        if (!input) return;
        
        const newGoal = parseInt(input.value);
        
        if (newGoal && newGoal > 0) {
            this.dailyGoal = newGoal;
            this.saveData();
            this.updateDailyGoal();
            this.updateProgressRing();
            
            const btn = document.getElementById('save-goal-btn');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = 'सेव हो गया! ✓';
                btn.style.background = '#28a745';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                }, 2000);
            }
        }
    }

    exportData() {
        const data = {
            currentCount: this.currentCount,
            dailyGoal: this.dailyGoal,
            dailyData: this.getData('dailyData') || {},
            achievements: this.getData('achievements') || [],
            soundEnabled: this.soundEnabled,
            backgroundMusicEnabled: this.backgroundMusicEnabled,
            backgroundVolume: this.backgroundVolume,
            tapVolume: this.tapVolume,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `ram-naam-jap-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        const btn = document.getElementById('export-data-btn');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'एक्सपोर्ट हो गया! ✓';
            btn.style.background = '#28a745';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }
    }

    resetData() {
        if (confirm('क्या आप वाकई सभी डेटा रीसेट करना चाहते हैं? यह कार्य पूर्ववत नहीं हो सकता।')) {
            // Clear all stored data
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('ramNameJap_')) {
                    localStorage.removeItem(key);
                }
            });
            
            // Reset app state
            this.currentCount = 0;
            this.dailyGoal = 2400;
            this.soundEnabled = true;
            this.backgroundMusicEnabled = true;
            this.backgroundVolume = 0.3;
            this.tapVolume = 0.7;
            
            // Reset UI elements
            this.updateFormElements();
            this.updateDisplay();
            this.updateProgressRing();
            this.updateDailyGoal();
            this.renderAchievements();
            
            if (this.chart) {
                this.chart.destroy();
                this.initializeChart();
            }
            
            alert('सभी डेटा रीसेट हो गया है।');
        }
    }

    updateFormElements() {
        const goalInput = document.getElementById('daily-goal-input');
        const soundToggle = document.getElementById('sound-toggle');
        const backgroundMusicToggle = document.getElementById('background-music-toggle');
        const backgroundVolumeSlider = document.getElementById('background-volume');
        const tapVolumeSlider = document.getElementById('tap-volume');
        
        if (goalInput) goalInput.value = this.dailyGoal;
        if (soundToggle) soundToggle.checked = this.soundEnabled;
        if (backgroundMusicToggle) backgroundMusicToggle.checked = this.backgroundMusicEnabled;
        if (backgroundVolumeSlider) backgroundVolumeSlider.value = this.backgroundVolume * 100;
        if (tapVolumeSlider) tapVolumeSlider.value = this.tapVolume * 100;
    }

    saveData() {
        this.setData('currentCount', this.currentCount);
        this.setData('dailyGoal', this.dailyGoal);
        this.setData('soundEnabled', this.soundEnabled);
        this.setData('backgroundMusicEnabled', this.backgroundMusicEnabled);
        this.setData('backgroundVolume', this.backgroundVolume);
        this.setData('tapVolume', this.tapVolume);
    }

    loadData() {
        this.currentCount = this.getData('currentCount') || 0;
        this.dailyGoal = this.getData('dailyGoal') || 2400;
        this.soundEnabled = this.getData('soundEnabled') !== false;
        this.backgroundMusicEnabled = this.getData('backgroundMusicEnabled') !== false;
        this.backgroundVolume = this.getData('backgroundVolume') || 0.3;
        this.tapVolume = this.getData('tapVolume') || 0.7;
        
        // Update form elements
        setTimeout(() => {
            this.updateFormElements();
        }, 100);
    }

    getData(key) {
        try {
            const value = localStorage.getItem(`ramNameJap_${key}`);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            console.error('Error loading data:', e);
            return null;
        }
    }

    setData(key, value) {
        try {
            localStorage.setItem(`ramNameJap_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ramApp = new RamNameJapApp();
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}