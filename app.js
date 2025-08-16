// Ram Naam Jap Counter App - Version 2.0
class RamNameJapApp {
    constructor() {
        this.currentCount = 0;
        this.dailyGoal = 2400;
        this.currentScreen = 'home';
        this.chart = null;
        this.currentPeriod = 'daily';
        this.soundEnabled = true;
        this.achievements = [100, 500, 1000, 2400, 5000, 10000, 25000, 50000, 100000];
        
        // Advanced volume controls
        this.tapSoundEnabled = true;
        this.tapVolume = 50;
        this.bgSoundEnabled = false;
        this.bgVolume = 30;
        this.bgAudio = null;
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadData();
        this.setupEventListeners();
        this.updateDisplay();
        this.hideLoadingScreen();
        this.updateProgressRing();
        this.updateDailyGoal();
        this.renderAchievements();
        this.initializeVolumeControls();
        this.initializeBackgroundAudio();
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 1500);
    }

    setupEventListeners() {
        // Set up navigation
        this.setupNavigation();
        
        // Set up counter functionality for home screen
        this.setupCounterArea();
        
        // Set up other interactive elements
        this.setupOtherEventListeners();
        
        // Set up volume controls
        this.setupVolumeEventListeners();
    }

    setupNavigation() {
        // Get all navigation buttons
        const navButtons = document.querySelectorAll('.nav-btn[data-screen]');
        const shareButtons = document.querySelectorAll('#share-btn');
        
        // Handle regular navigation buttons
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const screen = btn.getAttribute('data-screen');
                this.navigateToScreen(screen);
            });
        });

        // Handle share buttons
        shareButtons.forEach(shareBtn => {
            shareBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.shareOnWhatsApp();
            });
        });
    }

    shareOnWhatsApp() {
        const todayCount = this.getTodayCount();
        const totalCount = this.currentCount;
        const goalProgress = Math.min((todayCount / this.dailyGoal) * 100, 100).toFixed(0);
        
        const message = `🙏 राम नाम जप काउंटर 🙏\n\n` +
                       `आज का काउंट: ${todayCount.toLocaleString('hi-IN')}\n` +
                       `कुल काउंट: ${totalCount.toLocaleString('hi-IN')}\n` +
                       `दैनिक लक्ष्य: ${goalProgress}% पूरा\n\n` +
                       `राम नाम सत्य है! 🚩\n\n` +
                       `#रामनामजप #राम #भक्ति`;
        
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    setupCounterArea() {
        // Only set up counter on home screen
        const counterAreas = [
            '.center-circle-container',
            '.counter-display', 
            '.daily-goal-section',
            '.main-counter'
        ];
        
        counterAreas.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener('click', (e) => {
                    // Only increment if we're on home screen and not clicking on navigation or buttons
                    if (this.currentScreen === 'home' && 
                        !e.target.closest('.bottom-nav') && 
                        !e.target.closest('.btn')) {
                        e.stopPropagation();
                        this.incrementCounter();
                    }
                });
            }
        });
    }

    setupOtherEventListeners() {
        // Chart tabs
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chart-tab')) {
                e.stopPropagation();
                e.preventDefault();
                const period = e.target.getAttribute('data-period');
                this.switchChartPeriod(period);
            }
        });

        // Settings event listeners
        document.addEventListener('click', (e) => {
            if (e.target.id === 'save-goal-btn') {
                e.stopPropagation();
                e.preventDefault();
                this.saveDailyGoal();
            }
            
            if (e.target.id === 'export-data-btn') {
                e.stopPropagation();
                e.preventDefault();
                this.exportData();
            }
            
            if (e.target.id === 'reset-data-btn') {
                e.stopPropagation();
                e.preventDefault();
                this.resetData();
            }
            
            if (e.target.id === 'close-achievement') {
                e.stopPropagation();
                e.preventDefault();
                this.hideAchievementModal();
            }
        });

        // Prevent context menu on long press
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
    }

    setupVolumeEventListeners() {
        // Use event delegation for volume controls
        document.addEventListener('change', (e) => {
            if (e.target.id === 'tap-sound-toggle') {
                this.tapSoundEnabled = e.target.checked;
                this.saveData();
            }
            
            if (e.target.id === 'bg-sound-toggle') {
                this.bgSoundEnabled = e.target.checked;
                this.toggleBackgroundAudio();
                this.saveData();
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.id === 'tap-volume') {
                this.tapVolume = parseInt(e.target.value);
                const valueDisplay = document.getElementById('tap-volume-value');
                if (valueDisplay) valueDisplay.textContent = this.tapVolume;
                this.saveData();
            }
            
            if (e.target.id === 'bg-volume') {
                this.bgVolume = parseInt(e.target.value);
                const valueDisplay = document.getElementById('bg-volume-value');
                if (valueDisplay) valueDisplay.textContent = this.bgVolume;
                this.updateBackgroundVolume();
                this.saveData();
            }
        });
    }

    initializeVolumeControls() {
        // Set initial values for volume controls
        const tapSoundToggle = document.getElementById('tap-sound-toggle');
        const tapVolumeSlider = document.getElementById('tap-volume');
        const tapVolumeValue = document.getElementById('tap-volume-value');
        const bgSoundToggle = document.getElementById('bg-sound-toggle');
        const bgVolumeSlider = document.getElementById('bg-volume');
        const bgVolumeValue = document.getElementById('bg-volume-value');

        if (tapSoundToggle) tapSoundToggle.checked = this.tapSoundEnabled;
        if (tapVolumeSlider) tapVolumeSlider.value = this.tapVolume;
        if (tapVolumeValue) tapVolumeValue.textContent = this.tapVolume;
        if (bgSoundToggle) bgSoundToggle.checked = this.bgSoundEnabled;
        if (bgVolumeSlider) bgVolumeSlider.value = this.bgVolume;
        if (bgVolumeValue) bgVolumeValue.textContent = this.bgVolume;
    }

    initializeBackgroundAudio() {
        if (this.bgSoundEnabled) {
            this.createBackgroundAudio();
        }
    }

    createBackgroundAudio() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(this.bgVolume / 1000, audioContext.currentTime);
            
            oscillator.start();
            
            this.bgAudioContext = audioContext;
            this.bgGainNode = gainNode;
            this.bgOscillator = oscillator;
        } catch (e) {
            console.log('Background audio not supported');
        }
    }

    toggleBackgroundAudio() {
        if (this.bgSoundEnabled) {
            this.createBackgroundAudio();
        } else {
            if (this.bgOscillator) {
                this.bgOscillator.stop();
                this.bgOscillator = null;
                this.bgGainNode = null;
                this.bgAudioContext = null;
            }
        }
    }

    updateBackgroundVolume() {
        if (this.bgGainNode) {
            this.bgGainNode.gain.setValueAtTime(this.bgVolume / 1000, this.bgAudioContext.currentTime);
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
        this.animateRamImage();

        // Haptic feedback if supported
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    animateRamImage() {
        const ramImage = document.getElementById('ram-image');
        if (ramImage) {
            ramImage.classList.remove('animate');
            ramImage.offsetHeight; // Force reflow
            ramImage.classList.add('animate');
            
            setTimeout(() => {
                ramImage.classList.remove('animate');
            }, 600);
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
        if (!this.tapSoundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(this.tapVolume / 1000, audioContext.currentTime);
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
        console.log('Navigating to screen:', screenName);
        
        // Hide all screens
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            console.log('Successfully activated screen:', screenName);
        } else {
            console.error('Screen not found:', `${screenName}-screen`);
            return;
        }
        
        // Update navigation active state in all bottom navs
        const allNavButtons = document.querySelectorAll('.nav-btn[data-screen]');
        allNavButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeNavButtons = document.querySelectorAll(`[data-screen="${screenName}"]`);
        activeNavButtons.forEach(btn => {
            btn.classList.add('active');
        });
        
        this.currentScreen = screenName;
        
        // Initialize specific screen features
        if (screenName === 'dashboard') {
            setTimeout(() => {
                this.initializeChart();
                this.renderAchievements();
            }, 100);
        } else if (screenName === 'settings') {
            setTimeout(() => {
                this.initializeVolumeControls();
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
            tapSoundEnabled: this.tapSoundEnabled,
            tapVolume: this.tapVolume,
            bgSoundEnabled: this.bgSoundEnabled,
            bgVolume: this.bgVolume,
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
            localStorage.clear();
            this.currentCount = 0;
            this.dailyGoal = 2400;
            this.tapSoundEnabled = true;
            this.tapVolume = 50;
            this.bgSoundEnabled = false;
            this.bgVolume = 30;
            
            const goalInput = document.getElementById('daily-goal-input');
            if (goalInput) goalInput.value = 2400;
            
            this.initializeVolumeControls();
            this.updateDisplay();
            this.updateProgressRing();
            this.updateDailyGoal();
            this.renderAchievements();
            
            if (this.chart) {
                this.chart.destroy();
                this.initializeChart();
            }
            
            if (this.bgOscillator) {
                this.bgOscillator.stop();
                this.bgOscillator = null;
            }
            
            alert('सभी डेटा रीसेट हो गया है।');
        }
    }

    saveData() {
        this.setData('currentCount', this.currentCount);
        this.setData('dailyGoal', this.dailyGoal);
        this.setData('tapSoundEnabled', this.tapSoundEnabled);
        this.setData('tapVolume', this.tapVolume);
        this.setData('bgSoundEnabled', this.bgSoundEnabled);
        this.setData('bgVolume', this.bgVolume);
    }

    loadData() {
        this.currentCount = this.getData('currentCount') || 0;
        this.dailyGoal = this.getData('dailyGoal') || 2400;
        this.tapSoundEnabled = this.getData('tapSoundEnabled') !== false;
        this.tapVolume = this.getData('tapVolume') || 50;
        this.bgSoundEnabled = this.getData('bgSoundEnabled') || false;
        this.bgVolume = this.getData('bgVolume') || 30;
        
        const goalInput = document.getElementById('daily-goal-input');
        if (goalInput) goalInput.value = this.dailyGoal;
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

// Service Worker registration for PWA (optional)
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