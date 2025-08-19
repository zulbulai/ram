// Professional Ram Naam Jap Counter - Fixed Navigation, No Animations
class RamNameJapApp {
    constructor() {
        this.currentCount = 0;
        this.dailyGoal = 2400;
        this.currentScreen = 'home';
        this.chart = null;
        this.currentPeriod = 'daily';
        this.soundEnabled = true;
        this.volume = 0.7;
        this.achievements = [100, 500, 1000, 2400, 5000, 10000, 25000, 50000, 100000];
        this.audio = null;
        this.isAudioInitialized = false;
        this.odometerDigits = [];
        
        this.initializeApp();
    }

    initializeApp() {
        console.log('Initializing Professional Ram Naam Jap App...');
        this.loadData();
        this.initializeAudio();
        this.initializeOdometer();
        this.updateDisplay();
        this.updateProgressRing();
        this.updateProgressBar();
        this.renderAchievements();
        this.calculateStreak();
        
        // Setup event listeners after DOM is ready
        setTimeout(() => {
            this.setupEventListeners();
        }, 100);
    }

    initializeOdometer() {
        const container = document.getElementById('odometer-container');
        if (!container) return;

        // Create 5 digit boxes
        const digitCount = 5;
        const countStr = this.currentCount.toString().padStart(digitCount, '0');
        
        container.innerHTML = '';
        this.odometerDigits = [];

        for (let i = 0; i < digitCount; i++) {
            const digitBox = document.createElement('div');
            digitBox.className = 'digit-box';
            
            const digitValue = document.createElement('div');
            digitValue.className = 'digit-value';
            digitValue.textContent = countStr[i];
            
            digitBox.appendChild(digitValue);
            container.appendChild(digitBox);
            
            this.odometerDigits.push({
                box: digitBox,
                value: digitValue,
                currentDigit: countStr[i]
            });
        }
    }

    updateOdometer(newCount) {
        const digitCount = 5;
        const newCountStr = newCount.toString().padStart(digitCount, '0');
        
        // Update each digit statically (no animations)
        for (let i = 0; i < this.odometerDigits.length; i++) {
            const digitObj = this.odometerDigits[i];
            const newDigit = newCountStr[i];
            
            if (newDigit !== digitObj.currentDigit) {
                digitObj.value.textContent = newDigit;
                digitObj.currentDigit = newDigit;
            }
        }
    }

    initializeAudio() {
        this.audio = document.getElementById('nam-audio');
        if (this.audio) {
            this.audio.volume = this.volume;
            this.audio.preload = 'auto';
        }

        // Enable audio context on first user interaction
        const enableAudio = () => {
            if (this.audio) {
                const playPromise = this.audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        this.audio.pause();
                        this.audio.currentTime = 0;
                        this.isAudioInitialized = true;
                        console.log('Audio context enabled');
                    }).catch(() => {
                        console.log('Audio context activation failed');
                    });
                }
            }
        };
        
        document.addEventListener('click', enableAudio, { once: true });
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation setup - FIXED
        this.setupNavigation();
        
        // Counter area - tap to increment
        this.setupCounterArea();
        
        // Other functionality
        this.setupOtherEventListeners();
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupNavigation() {
        console.log('Setting up navigation...');
        
        // Remove any existing event listeners first
        const navButtons = document.querySelectorAll('.nav-btn[data-screen]');
        
        navButtons.forEach(button => {
            // Clone node to remove all existing event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        
        // Re-query the new buttons and add proper event listeners
        const newNavButtons = document.querySelectorAll('.nav-btn[data-screen]');
        
        newNavButtons.forEach(button => {
            const screenName = button.getAttribute('data-screen');
            console.log(`Setting up navigation for: ${screenName}`);
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                console.log(`Navigation clicked: ${screenName}`);
                this.navigateToScreen(screenName);
                
                return false;
            }, true); // Use capture phase
        });
        
        console.log(`Navigation setup complete for ${newNavButtons.length} buttons`);
    }

    setupCounterArea() {
        console.log('Setting up counter area...');
        
        const mainCounter = document.getElementById('counter-area');
        
        if (mainCounter) {
            mainCounter.addEventListener('click', (e) => {
                // Only increment if on home screen and not clicking any button or navigation
                if (this.currentScreen === 'home' && 
                    !e.target.closest('.nav-btn') && 
                    !e.target.closest('.bottom-nav') &&
                    e.target.tagName !== 'BUTTON') {
                    
                    console.log('Counter area tap detected');
                    this.incrementCounter();
                }
            });
        }

        // Keyboard support (spacebar)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.currentScreen === 'home') {
                e.preventDefault();
                this.incrementCounter();
            }
        });

        console.log('Counter area setup complete');
    }

    setupOtherEventListeners() {
        // Chart tabs
        ['daily', 'weekly', 'monthly', 'yearly', 'lifetime'].forEach(period => {
            const tab = document.querySelector(`[data-period="${period}"]`);
            if (tab) {
                tab.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.switchChartPeriod(period);
                });
            }
        });

        // Settings controls
        this.setupSettingsListeners();

        // Share controls
        this.setupShareListeners();

        // Achievement modal
        const closeBtn = document.getElementById('close-achievement');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideAchievementModal());
        }
        
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => this.hideAchievementModal());
        }
    }

    setupSettingsListeners() {
        // Save daily goal
        const saveGoalBtn = document.getElementById('save-goal-btn');
        if (saveGoalBtn) {
            saveGoalBtn.addEventListener('click', (e) => {
                e.stopPropagation();
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

        // Volume control
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.volume = parseFloat(e.target.value);
                if (this.audio) {
                    this.audio.volume = this.volume;
                }
                this.updateVolumeDisplay();
                this.saveData();
            });
        }

        // Test sound button
        const testSoundBtn = document.getElementById('test-sound-btn');
        if (testSoundBtn) {
            testSoundBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playSound();
                testSoundBtn.textContent = 'ध्वनि बजाई गई!';
                setTimeout(() => {
                    testSoundBtn.textContent = 'ध्वनि परखें';
                }, 1000);
            });
        }

        // Export and reset data
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.exportData();
            });
        }

        const resetBtn = document.getElementById('reset-data-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.resetData();
            });
        }
    }

    setupShareListeners() {
        // WhatsApp share
        const whatsappBtn = document.getElementById('whatsapp-share');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.shareToWhatsApp();
            });
        }

        // Copy link
        const copyBtn = document.getElementById('copy-link');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.copyShareLink();
            });
        }

        // General share
        const shareBtn = document.getElementById('general-share');
        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.shareGeneral();
            });
        }
    }

    incrementCounter() {
        this.currentCount++;
        console.log(`Counter incremented to: ${this.currentCount}`);
        
        this.storeTodayCount();
        this.updateOdometer(this.currentCount);
        this.updateDisplay();
        this.updateProgressRing();
        this.updateProgressBar();
        this.saveData();
        this.checkAchievements();
        this.playSound();
        this.addHapticFeedback();
    }

    playSound() {
        if (!this.soundEnabled) return;

        if (this.audio && this.isAudioInitialized) {
            this.audio.currentTime = 0;
            this.audio.play().catch(() => {
                this.playWebAudioSound();
            });
        } else {
            this.playWebAudioSound();
        }
    }

    playWebAudioSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(this.volume * 0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Web Audio API not supported:', e);
        }
    }

    addHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    storeTodayCount() {
        const today = new Date().toDateString();
        const dailyData = this.getData('dailyData') || {};
        dailyData[today] = (dailyData[today] || 0) + 1;
        this.setData('dailyData', dailyData);
    }

    updateDisplay() {
        // Update lifetime count in dashboard
        const lifetimeCount = document.getElementById('lifetime-count');
        if (lifetimeCount) {
            lifetimeCount.textContent = this.currentCount.toLocaleString('hi-IN');
        }
    }

    updateProgressRing() {
        const progressRing = document.querySelector('.progress-ring-circle');
        if (!progressRing) return;
        
        const radius = 125;
        const circumference = 2 * Math.PI * radius;
        
        const todayCount = this.getTodayCount();
        const dailyProgress = Math.min(todayCount / this.dailyGoal, 1);
        const offset = circumference - (dailyProgress * circumference);
        
        // Static update (no animations)
        progressRing.style.strokeDasharray = `${circumference}`;
        progressRing.style.strokeDashoffset = `${offset}`;
    }

    updateProgressBar() {
        const todayCount = this.getTodayCount();
        const percentage = Math.min((todayCount / this.dailyGoal) * 100, 100);
        
        const progressPercentage = document.getElementById('progress-percentage');
        const progressGoal = document.getElementById('progress-goal');
        const progressFill = document.getElementById('progress-bar-fill');
        
        if (progressPercentage) {
            if (percentage >= 100) {
                progressPercentage.style.color = '#FFD700';
                progressPercentage.textContent = '100% 🎉';
            } else {
                progressPercentage.style.color = '#DC143C';
                progressPercentage.textContent = percentage.toFixed(0) + '%';
            }
        }
        
        if (progressGoal) {
            progressGoal.textContent = this.dailyGoal.toLocaleString('hi-IN');
        }
        
        if (progressFill) {
            // Static update (no animations)
            progressFill.style.width = percentage + '%';
        }
    }

    getTodayCount() {
        const today = new Date().toDateString();
        const dailyData = this.getData('dailyData') || {};
        return dailyData[today] || 0;
    }

    navigateToScreen(screenName) {
        console.log(`=== NAVIGATING TO SCREEN: ${screenName} ===`);
        
        if (!screenName || screenName === this.currentScreen) {
            console.log('Same screen or invalid screen name');
            return;
        }

        try {
            // Hide all screens completely
            const allScreens = document.querySelectorAll('.screen');
            allScreens.forEach(screen => {
                screen.style.display = 'none';
                screen.classList.remove('active');
            });

            // Show target screen
            const targetScreen = document.getElementById(`${screenName}-screen`);
            if (targetScreen) {
                targetScreen.style.display = 'flex';
                targetScreen.classList.add('active');
                console.log(`✓ Activated screen: ${screenName}`);
            } else {
                console.error(`✗ Screen not found: ${screenName}-screen`);
                // Fallback to home screen
                const homeScreen = document.getElementById('home-screen');
                if (homeScreen) {
                    homeScreen.style.display = 'flex';
                    homeScreen.classList.add('active');
                }
                return;
            }
            
            // Update ALL navigation buttons across all screens
            const allNavBtns = document.querySelectorAll('.nav-btn');
            allNavBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-screen') === screenName) {
                    btn.classList.add('active');
                }
            });
            
            this.currentScreen = screenName;
            console.log(`✓ Current screen updated to: ${this.currentScreen}`);
            
            // Initialize specific screen content
            if (screenName === 'dashboard') {
                setTimeout(() => this.initializeDashboard(), 200);
            } else if (screenName === 'settings') {
                setTimeout(() => this.initializeSettings(), 100);
            } else if (screenName === 'share') {
                setTimeout(() => this.initializeShare(), 100);
            }
            
            console.log(`=== NAVIGATION COMPLETE ===`);
            
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }

    initializeDashboard() {
        console.log('Initializing dashboard...');
        this.updateDisplay();
        this.initializeChart();
        this.renderAchievements();
        this.calculateStreak();
    }

    initializeSettings() {
        console.log('Initializing settings...');
        const goalInput = document.getElementById('daily-goal-input');
        const soundToggle = document.getElementById('sound-toggle');
        const volumeSlider = document.getElementById('volume-slider');
        
        if (goalInput) goalInput.value = this.dailyGoal;
        if (soundToggle) soundToggle.checked = this.soundEnabled;
        if (volumeSlider) {
            volumeSlider.value = this.volume;
            this.updateVolumeDisplay();
        }
    }

    initializeShare() {
        console.log('Initializing share screen...');
        const totalCount = document.getElementById('share-total-count');
        const todayCount = document.getElementById('share-today-count');
        const streakCount = document.getElementById('share-streak-count');
        const shareText = document.getElementById('share-text');
        
        if (totalCount) totalCount.textContent = this.currentCount.toLocaleString('hi-IN');
        if (todayCount) todayCount.textContent = this.getTodayCount().toLocaleString('hi-IN');
        
        this.calculateStreak();
        const currentStreakEl = document.getElementById('current-streak');
        if (streakCount && currentStreakEl) {
            streakCount.textContent = currentStreakEl.textContent || '0';
        }
        
        if (shareText) {
            const message = `मैं 'राम नाम जप काउंटर' ऐप इस्तेमाल कर रहा हूँ। मैंने अब तक ${this.currentCount.toLocaleString('hi-IN')} नाम जप पूरे किए हैं! आप भी जुड़ें और रोज़ नाम जप करें।\nजय श्री राम!`;
            shareText.textContent = message;
        }
    }

    shareToWhatsApp() {
        const message = `मैं 'राम नाम जप काउंटर' ऐप इस्तेमाल कर रहा हूँ। मैंने अब तक ${this.currentCount.toLocaleString('hi-IN')} नाम जप पूरे किए हैं! आप भी जुड़ें और रोज़ नाम जप करें।\nजय श्री राम!`;
        
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        
        const btn = document.getElementById('whatsapp-share');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="share-icon">✅</span>शेयर किया गया!';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        }
    }

    copyShareLink() {
        const message = `मैं 'राम नाम जप काउंटर' ऐप इस्तेमाल कर रहा हूँ। मैंने अब तक ${this.currentCount.toLocaleString('hi-IN')} नाम जप पूरे किए हैं! आप भी जुड़ें और रोज़ नाम जप करें।\nजय श्री राम!`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(message).then(() => {
                this.showCopySuccess();
            }).catch(() => {
                this.fallbackCopy(message);
            });
        } else {
            this.fallbackCopy(message);
        }
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (err) {
            alert('कॉपी नहीं हो सका।');
        }
        document.body.removeChild(textArea);
    }

    showCopySuccess() {
        const btn = document.getElementById('copy-link');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="share-icon">✅</span>कॉपी हो गया!';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        }
    }

    shareGeneral() {
        const message = `मैं 'राम नाम जप काउंटर' ऐप इस्तेमाल कर रहा हूँ। मैंने अब तक ${this.currentCount.toLocaleString('hi-IN')} नाम जप पूरे किए हैं!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'राम नाम जप काउंटर',
                text: message
            }).catch(() => {
                this.copyShareLink();
            });
        } else {
            this.copyShareLink();
        }
    }

    updateVolumeDisplay() {
        const volumeDisplay = document.querySelector('.volume-display');
        if (volumeDisplay) {
            volumeDisplay.textContent = Math.round(this.volume * 100) + '%';
        }
    }

    initializeChart() {
        const ctx = document.getElementById('stats-chart');
        if (!ctx) return;

        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }

        try {
            const chartData = this.getChartData(this.currentPeriod);
            
            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'नाम जप',
                        data: chartData.data,
                        backgroundColor: '#1FB8CD',
                        borderColor: '#FFC185',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false, // Disable chart animations
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
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Chart initialization error:', error);
        }
    }

    getChartData(period) {
        const dailyData = this.getData('dailyData') || {};
        const now = new Date();
        let labels = [];
        let data = [];
        
        switch (period) {
            case 'daily':
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toDateString();
                    const dayName = date.toLocaleDateString('hi-IN', { weekday: 'short' });
                    labels.push(dayName);
                    data.push(dailyData[dateStr] || 0);
                }
                break;
                
            case 'weekly':
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
                break;
                
            case 'monthly':
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
                break;
                
            case 'yearly':
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
                break;
                
            case 'lifetime':
                const allDates = Object.keys(dailyData);
                const monthlyTotals = {};
                allDates.forEach(dateStr => {
                    const date = new Date(dateStr);
                    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + (dailyData[dateStr] || 0);
                });
                const sortedMonths = Object.keys(monthlyTotals).sort();
                sortedMonths.slice(-12).forEach(monthKey => {
                    const [year, month] = monthKey.split('-');
                    const date = new Date(year, month);
                    const monthName = date.toLocaleDateString('hi-IN', { month: 'short', year: '2-digit' });
                    labels.push(monthName);
                    data.push(monthlyTotals[monthKey]);
                });
                break;
        }
        
        return { labels, data };
    }

    switchChartPeriod(period) {
        console.log(`Switching chart to period: ${period}`);
        this.currentPeriod = period;
        
        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const targetTab = document.querySelector(`[data-period="${period}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        setTimeout(() => {
            this.initializeChart();
        }, 100);
    }

    calculateStreak() {
        const dailyData = this.getData('dailyData') || {};
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toDateString();
            
            if (dailyData[dateStr] && dailyData[dateStr] > 0) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        
        const streakDisplay = document.getElementById('current-streak');
        if (streakDisplay) {
            streakDisplay.textContent = streak.toLocaleString('hi-IN');
        }
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
            }, 5000);
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
            this.updateProgressBar();
            this.updateProgressRing();
            
            const btn = document.getElementById('save-goal-btn');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = 'सेव हो गया! ✓';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            }
        } else {
            alert('कृपया एक वैध संख्या दर्ज करें।');
        }
    }

    exportData() {
        const data = {
            currentCount: this.currentCount,
            dailyGoal: this.dailyGoal,
            dailyData: this.getData('dailyData') || {},
            achievements: this.getData('achievements') || [],
            soundEnabled: this.soundEnabled,
            volume: this.volume,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `ram-naam-jap-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        const btn = document.getElementById('export-data-btn');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'एक्सपोर्ट हो गया! ✓';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }
    }

    resetData() {
        const confirmation = confirm('क्या आप वाकई सभी डेटा रीसेट करना चाहते हैं?\n\nयह कार्य पूर्ववत नहीं हो सकता।');
        
        if (confirmation) {
            try {
                // Clear localStorage
                const keys = ['currentCount', 'dailyGoal', 'dailyData', 'achievements', 'soundEnabled', 'volume'];
                keys.forEach(key => localStorage.removeItem(`ramNameJap_${key}`));
                
                // Reset app state
                this.currentCount = 0;
                this.dailyGoal = 2400;
                this.soundEnabled = true;
                this.volume = 0.7;
                
                // Re-initialize
                this.initializeOdometer();
                this.updateDisplay();
                this.updateProgressRing();
                this.updateProgressBar();
                this.renderAchievements();
                this.calculateStreak();
                
                if (this.chart) {
                    this.chart.destroy();
                    this.initializeChart();
                }
                
                alert('सभी डेटा रीसेट हो गया है।');
                this.navigateToScreen('home');
                
            } catch (error) {
                console.error('Reset error:', error);
                alert('डेटा रीसेट करने में त्रुटि हुई।');
            }
        }
    }

    saveData() {
        try {
            this.setData('currentCount', this.currentCount);
            this.setData('dailyGoal', this.dailyGoal);
            this.setData('soundEnabled', this.soundEnabled);
            this.setData('volume', this.volume);
        } catch (error) {
            console.error('Save error:', error);
        }
    }

    loadData() {
        try {
            this.currentCount = this.getData('currentCount') || 0;
            this.dailyGoal = this.getData('dailyGoal') || 2400;
            this.soundEnabled = this.getData('soundEnabled') !== false;
            this.volume = this.getData('volume') || 0.7;
        } catch (error) {
            console.error('Load error:', error);
            this.currentCount = 0;
            this.dailyGoal = 2400;
            this.soundEnabled = true;
            this.volume = 0.7;
        }
    }

    getData(key) {
        try {
            const value = localStorage.getItem(`ramNameJap_${key}`);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            return null;
        }
    }

    setData(key, value) {
        try {
            localStorage.setItem(`ramNameJap_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error(`Error saving data for key ${key}:`, e);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Professional Ram Naam Jap App...');
    window.ramApp = new RamNameJapApp();
});

// Save data when page becomes hidden
document.addEventListener('visibilitychange', () => {
    if (window.ramApp && document.visibilityState === 'hidden') {
        window.ramApp.saveData();
    }
});

// Save data before page unload
window.addEventListener('beforeunload', () => {
    if (window.ramApp) {
        window.ramApp.saveData();
    }
});