// Ram Naam Jap Counter App - Odometer Version
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
        console.log('Initializing Ram Naam Jap App with Odometer...');
        this.loadData();
        this.initializeAudio();
        this.initializeOdometer();
        this.updateDisplay();
        this.hideLoadingScreen();
        this.updateProgressRing();
        this.updateDailyGoal();
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

        // Start with 5 digits to handle counts up to 99999
        const digitCount = 5;
        const countStr = this.currentCount.toString().padStart(digitCount, '0');
        
        container.innerHTML = '';
        this.odometerDigits = [];

        for (let i = 0; i < digitCount; i++) {
            const digitElement = document.createElement('div');
            digitElement.className = 'digit';
            
            const digitInner = document.createElement('div');
            digitInner.className = 'digit-inner';
            
            const digitValue = document.createElement('div');
            digitValue.className = 'digit-value';
            digitValue.textContent = countStr[i];
            
            digitInner.appendChild(digitValue);
            digitElement.appendChild(digitInner);
            container.appendChild(digitElement);
            
            this.odometerDigits.push({
                element: digitElement,
                inner: digitInner,
                currentValue: countStr[i]
            });
        }
    }

    updateOdometer(newCount) {
        const digitCount = Math.max(5, newCount.toString().length); // Dynamic length, minimum 5
        const newCountStr = newCount.toString().padStart(digitCount, '0');
        const oldCountStr = (newCount - 1).toString().padStart(digitCount, '0');
        
        // Adjust digit count if needed
        if (newCountStr.length > this.odometerDigits.length) {
            this.initializeOdometer();
            return;
        }

        // Animate changed digits
        for (let i = 0; i < this.odometerDigits.length; i++) {
            const digitObj = this.odometerDigits[i];
            const newDigit = newCountStr[i];
            const oldDigit = i < oldCountStr.length ? oldCountStr[i] : '0';
            
            if (newDigit !== digitObj.currentValue) {
                this.animateDigit(digitObj, oldDigit, newDigit);
                digitObj.currentValue = newDigit;
            }
        }
    }

    animateDigit(digitObj, oldValue, newValue) {
        const inner = digitObj.inner;
        
        // Create old digit element
        const oldElement = document.createElement('div');
        oldElement.className = 'digit-value old';
        oldElement.textContent = oldValue;
        
        // Create new digit element
        const newElement = document.createElement('div');
        newElement.className = 'digit-value new';
        newElement.textContent = newValue;
        
        // Clear current content and add both elements
        inner.innerHTML = '';
        inner.appendChild(oldElement);
        inner.appendChild(newElement);
        
        // Clean up after animation
        setTimeout(() => {
            inner.innerHTML = '';
            const finalElement = document.createElement('div');
            finalElement.className = 'digit-value';
            finalElement.textContent = newValue;
            inner.appendChild(finalElement);
        }, 400);
    }

    initializeAudio() {
        this.audio = document.getElementById('nam-audio');
        if (this.audio) {
            this.audio.volume = this.volume;
            this.audio.preload = 'auto';
            
            this.audio.addEventListener('canplaythrough', () => {
                this.isAudioInitialized = true;
                console.log('Audio initialized successfully');
            });

            this.audio.addEventListener('error', () => {
                console.log('Audio file not found, using Web Audio API fallback');
                this.isAudioInitialized = false;
            });
        }

        // Enable audio context on first user interaction
        const enableAudio = () => {
            if (this.audio && this.audio.paused) {
                this.audio.play().then(() => {
                    this.audio.pause();
                    this.audio.currentTime = 0;
                    console.log('Audio context enabled');
                }).catch(() => {
                    console.log('Audio context activation failed');
                });
            }
        };
        
        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('touchstart', enableAudio, { once: true });
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
        console.log('Setting up event listeners...');
        
        // Setup navigation first
        this.setupNavigation();
        
        // Setup counter functionality
        this.setupCounterArea();
        
        // Setup other interactions
        this.setupOtherEventListeners();
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupNavigation() {
        console.log('Setting up navigation...');
        
        // Get all navigation buttons
        const navButtons = document.querySelectorAll('.nav-btn[data-screen]');
        
        navButtons.forEach(button => {
            const screenName = button.getAttribute('data-screen');
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Navigation clicked: ${screenName}`);
                this.navigateToScreen(screenName);
            });
        });
        
        console.log(`Navigation setup complete for ${navButtons.length} buttons`);
    }

    setupCounterArea() {
        console.log('Setting up counter area...');
        
        // Counter functionality - tap areas that should increment counter
        const tapArea = document.getElementById('tap-area');
        const unifiedBlock = document.getElementById('unified-counter-block');
        const mainCounter = document.getElementById('counter-area');
        
        // Add click listeners to counter elements
        [tapArea, unifiedBlock].forEach(element => {
            if (element) {
                element.addEventListener('click', (e) => {
                    // Only increment if we're on home screen and not clicking nav
                    if (this.currentScreen === 'home' && !e.target.closest('.bottom-nav')) {
                        e.stopPropagation();
                        console.log('Counter tap detected');
                        this.handleTap();
                    }
                });
            }
        });

        // Also add listener to main counter area
        if (mainCounter) {
            mainCounter.addEventListener('click', (e) => {
                // Only if clicking in empty space and not on nav or other interactive elements
                if (this.currentScreen === 'home' && 
                    !e.target.closest('.bottom-nav') && 
                    !e.target.closest('.center-circle-container') &&
                    !e.target.closest('.unified-counter-block')) {
                    console.log('Main area tap detected');
                    this.handleTap();
                }
            });
        }

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.currentScreen === 'home') {
                e.preventDefault();
                this.handleTap();
            }
        });
    }

    setupOtherEventListeners() {
        // Chart tabs
        ['daily', 'weekly', 'monthly', 'yearly', 'lifetime'].forEach(period => {
            const tab = document.getElementById(`tab-${period}`);
            if (tab) {
                tab.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log(`Chart tab ${period} clicked`);
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

    setupShareListeners() {
        // WhatsApp share
        const whatsappBtn = document.getElementById('whatsapp-share');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.shareToWhatsApp();
            });
        }

        // Copy link
        const copyBtn = document.getElementById('copy-link');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.copyShareLink();
            });
        }

        // General share
        const shareBtn = document.getElementById('general-share');
        if (shareBtn) {
            shareBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.shareGeneral();
            });
        }
    }

    setupSettingsListeners() {
        // Save daily goal
        const saveGoalBtn = document.getElementById('save-goal-btn');
        if (saveGoalBtn) {
            saveGoalBtn.addEventListener('click', (e) => {
                e.preventDefault();
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
                e.preventDefault();
                e.stopPropagation();
                this.playSound();
                testSoundBtn.textContent = 'ध्वनि बजाई गई!';
                setTimeout(() => {
                    testSoundBtn.textContent = 'ध्वनि परखें';
                }, 1000);
            });
        }

        // Export data
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.exportData();
            });
        }

        // Reset data
        const resetBtn = document.getElementById('reset-data-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.resetData();
            });
        }
    }

    handleTap() {
        console.log('Tap handled - incrementing counter');
        this.incrementCounter();
    }

    incrementCounter() {
        this.currentCount++;
        console.log(`Counter incremented to: ${this.currentCount}`);
        
        this.storeTodayCount();
        this.updateOdometer(this.currentCount);
        this.updateDisplay();
        this.updateProgressRing();
        this.updateDailyGoal();
        this.saveData();
        this.checkAchievements();
        this.playSound();
        this.addRamImageAnimation();
        this.addTapAnimation();
        this.addHapticFeedback();
    }

    addRamImageAnimation() {
        const ramImage = document.querySelector('.ram-image');
        if (ramImage) {
            ramImage.classList.add('animate');
            setTimeout(() => ramImage.classList.remove('animate'), 400);
        }
    }

    addTapAnimation() {
        const centerContainer = document.querySelector('.center-circle-container');
        if (centerContainer) {
            centerContainer.classList.add('tap-animate');
            setTimeout(() => centerContainer.classList.remove('tap-animate'), 300);
        }
    }

    playSound() {
        if (!this.soundEnabled) return;

        console.log('Playing sound...');
        
        if (this.audio && this.isAudioInitialized) {
            this.audio.currentTime = 0;
            this.audio.play().catch(() => {
                console.log('MP3 playback failed, using Web Audio API');
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
            
            console.log('Web Audio sound played');
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
        const lifetimeCount = document.getElementById('lifetime-count');
        
        if (lifetimeCount) {
            lifetimeCount.textContent = this.currentCount.toLocaleString('hi-IN');
        }
    }

    updateProgressRing() {
        const progressRing = document.querySelector('.progress-ring-circle');
        if (!progressRing) return;
        
        const radius = 145;
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
        if (goalPercentage) {
            goalPercentage.textContent = percentage.toFixed(0) + '%';
            if (percentage >= 100) {
                goalPercentage.style.color = 'var(--devotional-gold)';
                goalPercentage.textContent = 'पूरा! 🎉';
            }
        }
        if (goalFill) goalFill.style.width = percentage + '%';
    }

    getTodayCount() {
        const today = new Date().toDateString();
        const dailyData = this.getData('dailyData') || {};
        return dailyData[today] || 0;
    }

    navigateToScreen(screenName) {
        console.log(`=== NAVIGATING TO: ${screenName} ===`);
        
        if (!screenName) {
            console.error('Invalid screen name');
            return;
        }

        try {
            // Hide all screens
            const allScreens = document.querySelectorAll('.screen');
            allScreens.forEach(screen => {
                screen.classList.remove('active');
            });

            // Show target screen
            const targetScreen = document.getElementById(`${screenName}-screen`);
            if (targetScreen) {
                targetScreen.classList.add('active');
                console.log(`✓ Screen activated: ${screenName}`);
            } else {
                console.error(`✗ Screen not found: ${screenName}-screen`);
                return;
            }
            
            // Update navigation active state
            const allNavBtns = document.querySelectorAll('.nav-btn');
            allNavBtns.forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeNavBtns = document.querySelectorAll(`[data-screen="${screenName}"]`);
            activeNavBtns.forEach(btn => {
                btn.classList.add('active');
            });
            
            this.currentScreen = screenName;
            console.log(`✓ Current screen set to: ${this.currentScreen}`);
            
            // Initialize specific screen content
            if (screenName === 'dashboard') {
                setTimeout(() => {
                    this.initializeDashboard();
                }, 300);
            } else if (screenName === 'settings') {
                setTimeout(() => {
                    this.initializeSettings();
                }, 100);
            } else if (screenName === 'share') {
                setTimeout(() => {
                    this.initializeShare();
                }, 100);
            }
            
            console.log(`=== NAVIGATION COMPLETE: ${screenName} ===`);
            
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }

    initializeDashboard() {
        console.log('Initializing dashboard...');
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
        if (streakCount) {
            this.calculateStreak();
            const streak = document.getElementById('current-streak');
            if (streak) {
                streakCount.textContent = streak.textContent;
            }
        }
        
        if (shareText) {
            const message = `मैं 'राम नाम जप काउंटर' ऐप इस्तेमाल कर रहा हूँ। मैंने अब तक ${this.currentCount.toLocaleString('hi-IN')} नाम जप पूरे किए हैं! आप भी जुड़ें और रोज़ नाम जप करें 👉 ramjaap.vercel.app\nजय श्री राम!`;
            shareText.textContent = message;
        }
    }

    shareToWhatsApp() {
        const message = `मैं 'राम नाम जप काउंटर' ऐप इस्तेमाल कर रहा हूँ। मैंने अब तक ${this.currentCount.toLocaleString('hi-IN')} नाम जप पूरे किए हैं! आप भी जुड़ें और रोज़ नाम जप करें 👉 ramjaap.vercel.app\nजय श्री राम!`;
        
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
        const message = `मैं 'राम नाम जप काउंटर' ऐप इस्तेमाल कर रहा हूँ। मैंने अब तक ${this.currentCount.toLocaleString('hi-IN')} नाम जप पूरे किए हैं! आप भी जुड़ें और रोज़ नाम जप करें 👉 ramjaap.vercel.app\nजय श्री राम!`;
        
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
            console.error('Copy failed:', err);
            alert('कॉपी नहीं हो सका। कृपया मैन्युअल रूप से टेक्स्ट सेलेक्ट करें।');
        }
        document.body.removeChild(textArea);
    }

    showCopySuccess() {
        const btn = document.getElementById('copy-link');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="share-icon">✅</span>कॉपी हो गया!';
            btn.style.background = '#28a745';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 2000);
        }
    }

    shareGeneral() {
        const message = `मैं 'राम नाम जप काउंटर' ऐप इस्तेमाल कर रहा हूँ। मैंने अब तक ${this.currentCount.toLocaleString('hi-IN')} नाम जप पूरे किए हैं! आप भी जुड़ें और रोज़ नाम जप करें।`;
        
        if (navigator.share) {
            navigator.share({
                title: 'राम नाम जप काउंटर',
                text: message,
                url: 'https://ramjaap.vercel.app'
            }).then(() => {
                console.log('Share successful');
            }).catch((error) => {
                console.log('Share failed:', error);
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
            
            this.playAchievementSound();
            
            setTimeout(() => {
                this.hideAchievementModal();
            }, 5000);
        }
    }

    playAchievementSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            [800, 1000, 1200].forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(this.volume * 0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.5);
                }, index * 200);
            });
        } catch (e) {
            console.log('Achievement sound failed:', e);
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
        } else {
            alert('कृपया एक वैध संख्या दर्ज करें (1 से अधिक)');
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
            btn.style.background = '#28a745';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }
    }

    resetData() {
        const confirmation = confirm('क्या आप वाकई सभी डेटा रीसेट करना चाहते हैं?\n\nयह कार्य पूर्ववत नहीं हो सकता।');
        
        if (confirmation) {
            try {
                const keys = ['currentCount', 'dailyGoal', 'dailyData', 'achievements', 'soundEnabled', 'volume'];
                keys.forEach(key => localStorage.removeItem(`ramNameJap_${key}`));
                
                this.currentCount = 0;
                this.dailyGoal = 2400;
                this.soundEnabled = true;
                this.volume = 0.7;
                
                this.initializeOdometer();
                this.initializeSettings();
                this.updateDisplay();
                this.updateProgressRing();
                this.updateDailyGoal();
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
            console.error(`Error loading data for key ${key}:`, e);
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
    console.log('DOM loaded, initializing app...');
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

// Service Worker registration
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