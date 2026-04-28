const animationEngine = {
    audioContext: null,
    sounds: {},
    
    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
            }
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    },

    playSound(type) {
        if (!this.audioContext) {
            return;
        }

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;

        switch (type) {
            case 'click':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;

            case 'correct':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523, now);
                oscillator.frequency.setValueAtTime(659, now + 0.1);
                oscillator.frequency.setValueAtTime(784, now + 0.2);
                gainNode.gain.setValueAtTime(0.4, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                oscillator.start(now);
                oscillator.stop(now + 0.4);
                break;

            case 'wrong':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.3);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;

            case 'success':
                this.playSuccessChord();
                return;

            case 'error':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(150, now);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;

            case 'start':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.frequency.setValueAtTime(554, now + 0.1);
                oscillator.frequency.setValueAtTime(659, now + 0.2);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                oscillator.start(now);
                oscillator.stop(now + 0.4);
                break;

            case 'submit':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523, now);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;

            default:
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, now);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
        }
    },

    playSuccessChord() {
        if (!this.audioContext) return;

        const notes = [523, 659, 784, 1047];
        const now = this.audioContext.currentTime;

        notes.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + index * 0.15);
            gain.gain.setValueAtTime(0.3, now + index * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.5);

            osc.start(now + index * 0.15);
            osc.stop(now + index * 0.15 + 0.5);
        });
    },

    createConfetti() {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
        const count = 50;

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            const size = Math.random() * 10 + 5;
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const duration = Math.random() * 2 + 2;
            const rotation = Math.random() * 720;

            confetti.style.cssText = `
                left: ${left}%;
                width: ${size}px;
                height: ${size}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                animation: confetti ${duration}s ease-in ${delay}s infinite;
                transform: rotate(${rotation}deg);
            `;

            container.appendChild(confetti);
        }

        setTimeout(() => {
            container.remove();
        }, 5000);
    },

    addPulseAnimation(element) {
        element.style.animation = 'pulse 1s ease infinite';
    },

    removePulseAnimation(element) {
        element.style.animation = '';
    },

    addShakeAnimation(element) {
        element.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    },

    addBounceAnimation(element) {
        element.style.animation = 'bounce 0.5s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    },

    addSlideInAnimation(element, direction = 'right') {
        element.style.opacity = '0';
        element.style.transform = direction === 'right' ? 'translateX(50px)' : 'translateX(-50px)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.4s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        });
    },

    addFadeInAnimation(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.4s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    },

    highlightCorrect(element) {
        element.classList.add('correct');
        this.playSound('correct');
        this.addBounceAnimation(element);
    },

    highlightWrong(element) {
        element.classList.add('wrong');
        this.playSound('wrong');
        this.addShakeAnimation(element);
    },

    showScoreAnimation(scoreElement, targetScore) {
        let current = 0;
        const increment = targetScore / 50;
        const duration = 1500;
        const interval = duration / 50;

        scoreElement.textContent = '0';

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetScore) {
                current = targetScore;
                clearInterval(timer);
                this.addPulseAnimation(scoreElement);
                setTimeout(() => this.removePulseAnimation(scoreElement), 1000);
            }
            scoreElement.textContent = Math.round(current);
        }, interval);
    },

    createProgressAnimation(progressBar, from, to, duration = 500) {
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = from + (to - from) * progress;
            progressBar.style.width = current + '%';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    animationEngine.init();
    
    document.addEventListener('click', () => {
        if (animationEngine.audioContext && animationEngine.audioContext.state === 'suspended') {
            animationEngine.audioContext.resume();
        }
    }, { once: true });
});
