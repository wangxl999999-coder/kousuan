const app = {
    currentPage: 'home',
    currentQuiz: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    startTime: null,
    timerInterval: null,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.currentPage === 'quiz') {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const submitBtn = document.getElementById('submitBtn');
                    if (submitBtn.style.display !== 'none') {
                        this.submitQuiz();
                    } else {
                        this.nextQuestion();
                    }
                } else if (e.key === 'ArrowRight') {
                    this.nextQuestion();
                } else if (e.key === 'ArrowLeft') {
                    this.prevQuestion();
                }
            }
        });
    },

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId + '-page').classList.add('active');
        this.currentPage = pageId;
    },

    goHome() {
        if (this.currentPage === 'quiz') {
            if (!confirm('确定要退出当前练习吗？进度将不会保存。')) {
                return;
            }
            this.stopTimer();
        }
        this.showPage('home');
    },

    startQuickPractice() {
        const settings = {
            difficulty: 'medium',
            questionCount: 10,
            types: ['addition', 'subtraction', 'mixedAddSub', 'numberPattern', 'multiplication', 'division']
        };
        this.startQuiz(settings);
    },

    showExamSettings() {
        this.showPage('exam-settings');
    },

    generateExam() {
        const difficulty = document.getElementById('difficulty').value;
        const questionCount = parseInt(document.getElementById('questionCount').value);
        const typeCheckboxes = document.querySelectorAll('#questionTypes input:checked');
        
        const types = Array.from(typeCheckboxes).map(cb => cb.value);
        
        if (types.length === 0) {
            this.showToast('请至少选择一种试题类型！', 'error');
            return;
        }

        const settings = {
            difficulty,
            questionCount,
            types
        };

        this.startQuiz(settings);
    },

    startQuiz(settings) {
        this.currentQuiz = examGenerator.generate(settings);
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.currentQuiz.questions.length).fill(null);
        this.startTime = Date.now();
        
        this.showPage('quiz');
        this.updateQuizUI();
        this.startTimer();
        animationEngine.playSound('start');
    },

    updateQuizUI() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const total = this.currentQuiz.questions.length;
        
        document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
        document.getElementById('totalQuestions').textContent = total;
        
        const progress = ((this.currentQuestionIndex + 1) / total) * 100;
        document.getElementById('progressFill').style.width = progress + '%';

        this.renderQuestion(question);

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        prevBtn.disabled = this.currentQuestionIndex === 0;

        if (this.currentQuestionIndex === total - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
    },

    renderQuestion(question) {
        const container = document.getElementById('questionContainer');
        
        let typeLabel = this.getTypeLabel(question.type);
        
        let html = `
            <div class="question-header">
                <span class="question-number">第 ${this.currentQuestionIndex + 1} 题</span>
                <span class="question-type">${typeLabel}</span>
            </div>
            <div class="question-content">
                ${this.renderQuestionContent(question)}
            </div>
            <div class="answers-container">
                ${this.renderAnswers(question)}
            </div>
        `;

        container.innerHTML = html;
        this.bindQuestionEvents(question);
    },

    getTypeLabel(type) {
        const labels = {
            numberPattern: '数的规律',
            addition: '加法',
            subtraction: '减法',
            mixedAddSub: '多个数加减',
            within500: '500以内加减',
            multiplication: '乘法',
            division: '除法',
            bigMultiplication: '大数乘法',
            fraction: '分数入门',
            rounding: '四舍五入',
            clock: '认识钟表',
            ruler: '直尺测量'
        };
        return labels[type] || '数学题';
    },

    renderQuestionContent(question) {
        switch (question.type) {
            case 'clock':
                return this.renderClockQuestion(question);
            case 'ruler':
                return this.renderRulerQuestion(question);
            case 'numberPattern':
                return this.renderPatternQuestion(question);
            case 'fraction':
                return this.renderFractionQuestion(question);
            default:
                return `<span class="math-expression">${question.question}</span>`;
        }
    },

    renderClockQuestion(question) {
        const { hour, minute } = question.data;
        const hourAngle = (hour % 12) * 30 + minute * 0.5;
        const minuteAngle = minute * 6;

        return `
            <div class="clock-container">
                <div class="clock">
                    <div class="clock-face">
                        <span class="clock-number clock-number-12">12</span>
                        <span class="clock-number clock-number-3">3</span>
                        <span class="clock-number clock-number-6">6</span>
                        <span class="clock-number clock-number-9">9</span>
                        <div class="clock-hand hour-hand" style="transform: rotate(${hourAngle}deg);"></div>
                        <div class="clock-hand minute-hand" style="transform: rotate(${minuteAngle}deg);"></div>
                        <div class="clock-center"></div>
                    </div>
                </div>
            </div>
            <p>请写出钟表显示的时间：</p>
        `;
    },

    renderRulerQuestion(question) {
        const { start, end } = question.data;
        const objectWidth = (end - start) * 40;
        const objectLeft = start * 40;

        let rulerMarks = '';
        for (let i = 0; i <= 10; i++) {
            rulerMarks += `<div class="ruler-mark major" style="left: ${i * 10}%;"></div>`;
            for (let j = 1; j < 5; j++) {
                rulerMarks += `<div class="ruler-mark minor" style="left: ${i * 10 + j * 2}%;"></div>`;
            }
        }

        let rulerNumbers = '';
        for (let i = 0; i <= 10; i++) {
            rulerNumbers += `<span class="ruler-number" style="left: ${i * 10}%;">${i}</span>`;
        }

        return `
            <div class="ruler-container">
                <div class="ruler">
                    <div class="ruler-marks">
                        ${rulerMarks}
                    </div>
                    ${rulerNumbers}
                    <div class="object-measure" style="left: ${objectLeft}px; width: ${objectWidth}px;"></div>
                </div>
            </div>
            <p>请量出蓝色物体的长度（单位：厘米）：</p>
        `;
    },

    renderPatternQuestion(question) {
        const { sequence, missingIndex } = question.data;
        let html = '<div class="number-grid">';
        
        sequence.forEach((num, index) => {
            if (index === missingIndex) {
                html += `<div class="number-box missing">?</div>`;
            } else {
                html += `<div class="number-box">${num}</div>`;
            }
        });

        html += '</div><p>请找出规律，填入缺失的数字：</p>';
        return html;
    },

    renderFractionQuestion(question) {
        const { numerator, denominator, operation, other } = question.data;
        
        const fractionHtml = (num, den) => `
            <span class="fraction-display">
                <span class="fraction-num">${num}</span>
                <span class="fraction-den">${den}</span>
            </span>
        `;

        if (operation) {
            return `
                ${fractionHtml(numerator, denominator)}
                <span class="math-expression"> ${operation} </span>
                ${fractionHtml(other.numerator, other.denominator)}
                <span class="math-expression"> = ?</span>
            `;
        }

        return `
            ${fractionHtml(numerator, denominator)}
            <p>${question.question}</p>
        `;
    },

    renderAnswers(question) {
        const savedAnswer = this.userAnswers[this.currentQuestionIndex];
        
        switch (question.formType) {
            case 'single':
                return this.renderSingleChoice(question.options, savedAnswer);
            case 'multiple':
                return this.renderMultipleChoice(question.options, savedAnswer);
            case 'fill':
                return this.renderFillBlank(question, savedAnswer);
            case 'matching':
                return this.renderMatching(question, savedAnswer);
            default:
                return this.renderFillBlank(question, savedAnswer);
        }
    },

    renderSingleChoice(options, savedAnswer) {
        const labels = ['A', 'B', 'C', 'D'];
        let html = '';

        options.forEach((option, index) => {
            const isSelected = savedAnswer === option;
            html += `
                <div class="answer-option ${isSelected ? 'selected' : ''}" data-value="${option}">
                    <span class="option-label">${labels[index]}</span>
                    <span>${option}</span>
                </div>
            `;
        });

        return html;
    },

    renderMultipleChoice(options, savedAnswer) {
        const labels = ['A', 'B', 'C', 'D'];
        let html = '<p style="margin-bottom: 10px; color: var(--text-secondary);">（此题为多选题，请选择所有正确答案）</p>';

        const savedAnswers = savedAnswer ? (Array.isArray(savedAnswer) ? savedAnswer : [savedAnswer]) : [];

        options.forEach((option, index) => {
            const isSelected = savedAnswers.includes(option);
            html += `
                <div class="answer-option ${isSelected ? 'selected' : ''}" data-value="${option}" data-multiple="true">
                    <span class="option-label">${labels[index]}</span>
                    <span>${option}</span>
                </div>
            `;
        });

        return html;
    },

    renderFillBlank(question, savedAnswer) {
        if (question.type === 'clock') {
            return `
                <div class="answer-input-group">
                    <input type="number" class="answer-input" id="hour-input" placeholder="时" min="0" max="23" 
                           value="${savedAnswer ? savedAnswer.split(':')[0] : ''}">
                    <span style="font-size: 1.5rem;">:</span>
                    <input type="number" class="answer-input" id="minute-input" placeholder="分" min="0" max="59"
                           value="${savedAnswer ? savedAnswer.split(':')[1] : ''}">
                </div>
            `;
        }

        const value = savedAnswer !== null ? savedAnswer : '';
        return `
            <div class="answer-input-group">
                <span style="font-size: 1.2rem;">答案：</span>
                <input type="number" class="answer-input" id="fill-answer" placeholder="请输入答案" 
                       value="${value}" style="width: 200px;">
            </div>
        `;
    },

    renderMatching(question, savedAnswer) {
        const { leftItems, rightItems } = question.data;
        let html = '<div style="display: flex; gap: 40px; justify-content: center;">';
        
        html += '<div>';
        html += '<p style="font-weight: bold; margin-bottom: 10px;">左边</p>';
        leftItems.forEach((item, index) => {
            html += `<div class="answer-option" data-match-left="${index}">${item}</div>`;
        });
        html += '</div>';
        
        html += '<div>';
        html += '<p style="font-weight: bold; margin-bottom: 10px;">右边</p>';
        rightItems.forEach((item, index) => {
            html += `<div class="answer-option" data-match-right="${index}">${item}</div>`;
        });
        html += '</div>';
        
        html += '</div>';
        return html;
    },

    bindQuestionEvents(question) {
        const options = document.querySelectorAll('.answer-option[data-value]');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                const isMultiple = option.dataset.multiple === 'true';

                if (isMultiple) {
                    option.classList.toggle('selected');
                    const selected = document.querySelectorAll('.answer-option[data-value][data-multiple="true"].selected');
                    this.userAnswers[this.currentQuestionIndex] = Array.from(selected).map(el => el.dataset.value);
                } else {
                    options.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    this.userAnswers[this.currentQuestionIndex] = value;
                }

                animationEngine.playSound('click');
            });
        });

        const fillInput = document.getElementById('fill-answer');
        if (fillInput) {
            fillInput.addEventListener('input', (e) => {
                this.userAnswers[this.currentQuestionIndex] = e.target.value;
            });
            fillInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.nextQuestion();
                }
            });
            setTimeout(() => fillInput.focus(), 100);
        }

        const hourInput = document.getElementById('hour-input');
        const minuteInput = document.getElementById('minute-input');
        if (hourInput && minuteInput) {
            const updateTime = () => {
                const hour = hourInput.value;
                const minute = minuteInput.value;
                if (hour && minute) {
                    this.userAnswers[this.currentQuestionIndex] = `${hour}:${minute.padStart(2, '0')}`;
                }
            };
            hourInput.addEventListener('input', updateTime);
            minuteInput.addEventListener('input', updateTime);
        }
    },

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.updateQuizUI();
            animationEngine.playSound('click');
        }
    },

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.updateQuizUI();
            animationEngine.playSound('click');
        }
    },

    confirmExit() {
        if (confirm('确定要退出当前练习吗？进度将不会保存。')) {
            this.stopTimer();
            this.goHome();
        }
    },

    submitQuiz() {
        if (!confirm('确定要提交试卷吗？')) {
            return;
        }

        this.stopTimer();
        const results = this.gradeQuiz();
        this.saveHistory(results);
        this.showResults(results);
        animationEngine.playSound('submit');
    },

    gradeQuiz() {
        const questions = this.currentQuiz.questions;
        let correctCount = 0;
        const details = [];

        questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = this.checkAnswer(question, userAnswer);

            if (isCorrect) {
                correctCount++;
            }

            details.push({
                question: question.question,
                userAnswer,
                correctAnswer: question.answer,
                isCorrect,
                type: question.type
            });
        });

        const total = questions.length;
        const score = Math.round((correctCount / total) * 100);
        const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);

        return {
            score,
            correctCount,
            wrongCount: total - correctCount,
            total,
            timeSpent,
            details
        };
    },

    checkAnswer(question, userAnswer) {
        if (userAnswer === null || userAnswer === undefined) {
            return false;
        }

        const correctAnswer = question.answer;

        switch (question.formType) {
            case 'multiple':
                const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
                const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
                
                if (userAnswers.length !== correctAnswers.length) {
                    return false;
                }
                
                return correctAnswers.every(ans => userAnswers.includes(ans));
            
            case 'fill':
                if (question.type === 'clock') {
                    return userAnswer === correctAnswer;
                }
                
                const userNum = parseFloat(userAnswer);
                const correctNum = parseFloat(correctAnswer);
                
                return !isNaN(userNum) && userNum === correctNum;
            
            default:
                return userAnswer === correctAnswer;
        }
    },

    showResults(results) {
        this.showPage('result');

        document.getElementById('score').textContent = results.score;
        document.getElementById('correctCount').textContent = results.correctCount;
        document.getElementById('wrongCount').textContent = results.wrongCount;
        document.getElementById('timeSpent').textContent = this.formatTime(results.timeSpent);

        const resultIcon = document.getElementById('resultIcon');
        if (results.score >= 90) {
            resultIcon.textContent = '🎉';
            animationEngine.createConfetti();
            animationEngine.playSound('success');
        } else if (results.score >= 60) {
            resultIcon.textContent = '😊';
            animationEngine.playSound('success');
        } else {
            resultIcon.textContent = '💪';
            animationEngine.playSound('error');
        }

        const reviewHtml = results.details.map((detail, index) => `
            <div class="answer-item ${detail.isCorrect ? 'correct' : 'wrong'}">
                <span class="answer-status">${detail.isCorrect ? '✅' : '❌'}</span>
                <div class="answer-info">
                    <div class="question-text">第 ${index + 1} 题：${detail.question}</div>
                    <div class="answer-details">
                        你的答案：<strong>${detail.userAnswer || '未作答'}</strong>
                        ${!detail.isCorrect ? `，正确答案：<strong>${detail.correctAnswer}</strong>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        document.getElementById('answerReview').innerHTML = reviewHtml;
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    startTimer() {
        let seconds = 0;
        const timerEl = document.getElementById('timer');
        
        this.timerInterval = setInterval(() => {
            seconds++;
            timerEl.textContent = this.formatTime(seconds);
        }, 1000);
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    showHistory() {
        this.showPage('history');
        this.renderHistory();
    },

    renderHistory() {
        const history = this.getHistory();
        const listEl = document.getElementById('historyList');
        const emptyEl = document.getElementById('emptyHistory');

        if (history.length === 0) {
            listEl.style.display = 'none';
            emptyEl.style.display = 'block';
            return;
        }

        listEl.style.display = 'flex';
        emptyEl.style.display = 'none';

        const html = history.map((record, index) => `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-date">${new Date(record.timestamp).toLocaleString('zh-CN')}</div>
                    <div class="history-type">${record.total} 道题 · 用时 ${this.formatTime(record.timeSpent)}</div>
                </div>
                <span class="history-score">${record.score}分</span>
            </div>
        `).join('');

        listEl.innerHTML = html;
    },

    getHistory() {
        try {
            const data = localStorage.getItem('kousuan_history');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    saveHistory(results) {
        const history = this.getHistory();
        history.unshift({
            ...results,
            timestamp: Date.now()
        });

        if (history.length > 50) {
            history.splice(50);
        }

        try {
            localStorage.setItem('kousuan_history', JSON.stringify(history));
        } catch (e) {
            console.error('保存历史记录失败:', e);
        }
    },

    retryQuiz() {
        this.startQuickPractice();
    },

    reviewWrongAnswers() {
        this.showToast('错题本功能开发中...', 'info');
    },

    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
