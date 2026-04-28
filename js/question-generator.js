const questionGenerator = {
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    generate(type, difficulty) {
        const generators = {
            numberPattern: this.generateNumberPattern.bind(this),
            addition: this.generateAddition.bind(this),
            subtraction: this.generateSubtraction.bind(this),
            mixedAddSub: this.generateMixedAddSub.bind(this),
            within500: this.generateWithin500.bind(this),
            multiplication: this.generateMultiplication.bind(this),
            division: this.generateDivision.bind(this),
            bigMultiplication: this.generateBigMultiplication.bind(this),
            fraction: this.generateFraction.bind(this),
            rounding: this.generateRounding.bind(this),
            clock: this.generateClock.bind(this),
            ruler: this.generateRuler.bind(this)
        };

        const generator = generators[type];
        if (generator) {
            return generator(difficulty);
        }
        return this.generateAddition(difficulty);
    },

    generateNumberPattern(difficulty) {
        const patterns = [
            { type: 'add', step: this.random(1, 5), length: 5 },
            { type: 'add', step: this.random(2, 10), length: 5 },
            { type: 'subtract', step: this.random(1, 5), length: 5 },
            { type: 'multiply', step: this.random(2, 3), length: 5 },
            { type: 'add2', step1: this.random(1, 3), step2: this.random(1, 3), length: 6 }
        ];

        const pattern = patterns[this.random(0, patterns.length - 1)];
        let sequence = [];
        let start = this.random(1, 20);

        switch (pattern.type) {
            case 'add':
                for (let i = 0; i < pattern.length; i++) {
                    sequence.push(start + pattern.step * i);
                }
                break;
            case 'subtract':
                for (let i = 0; i < pattern.length; i++) {
                    sequence.push(start + pattern.length * pattern.step - pattern.step * i);
                }
                break;
            case 'multiply':
                start = this.random(2, 5);
                for (let i = 0; i < pattern.length; i++) {
                    sequence.push(start * Math.pow(pattern.step, i));
                }
                break;
            case 'add2':
                for (let i = 0; i < pattern.length; i++) {
                    if (i === 0) {
                        sequence.push(start);
                    } else if (i % 2 === 1) {
                        sequence.push(sequence[i - 1] + pattern.step1);
                    } else {
                        sequence.push(sequence[i - 1] + pattern.step2);
                    }
                }
                break;
        }

        const missingIndex = this.random(1, sequence.length - 2);
        const answer = sequence[missingIndex];

        const formTypes = ['fill', 'single'];
        const formType = formTypes[this.random(0, 1)];

        let options = [];
        if (formType === 'single') {
            options = this.generateWrongOptions(answer, 3);
            options.push(answer);
            options = this.shuffle(options);
        }

        return {
            type: 'numberPattern',
            formType,
            question: '找出规律，填入缺失的数字',
            answer: answer,
            options,
            data: {
                sequence,
                missingIndex
            }
        };
    },

    generateAddition(difficulty) {
        let a, b;
        
        switch (difficulty) {
            case 'easy':
                a = this.random(1, 20);
                b = this.random(1, 20);
                break;
            case 'medium':
                a = this.random(10, 50);
                b = this.random(10, 50);
                break;
            case 'hard':
                a = this.random(50, 100);
                b = this.random(50, 100);
                break;
        }

        const answer = a + b;
        const formTypes = ['fill', 'single'];
        const formType = formTypes[this.random(0, 1)];

        let options = [];
        if (formType === 'single') {
            options = this.generateWrongOptions(answer, 3);
            options.push(answer);
            options = this.shuffle(options);
        }

        return {
            type: 'addition',
            formType,
            question: `${a} + ${b} = ?`,
            answer,
            options
        };
    },

    generateSubtraction(difficulty) {
        let a, b;
        
        switch (difficulty) {
            case 'easy':
                b = this.random(1, 10);
                a = this.random(b, 20);
                break;
            case 'medium':
                b = this.random(10, 30);
                a = this.random(b, 60);
                break;
            case 'hard':
                b = this.random(20, 50);
                a = this.random(b, 100);
                break;
        }

        const answer = a - b;
        const formTypes = ['fill', 'single'];
        const formType = formTypes[this.random(0, 1)];

        let options = [];
        if (formType === 'single') {
            options = this.generateWrongOptions(answer, 3);
            options.push(answer);
            options = this.shuffle(options);
        }

        return {
            type: 'subtraction',
            formType,
            question: `${a} - ${b} = ?`,
            answer,
            options
        };
    },

    generateMixedAddSub(difficulty) {
        const nums = [];
        const ops = [];
        let count;

        switch (difficulty) {
            case 'easy':
                count = 3;
                break;
            case 'medium':
                count = 4;
                break;
            case 'hard':
                count = 5;
                break;
        }

        let result = 0;
        for (let i = 0; i < count; i++) {
            let num = this.random(1, 20);
            if (i === 0) {
                nums.push(num);
                result = num;
            } else {
                const isAdd = Math.random() > 0.4;
                ops.push(isAdd ? '+' : '-');
                if (isAdd) {
                    nums.push(num);
                    result += num;
                } else {
                    while (result < num) {
                        num = this.random(1, result);
                    }
                    nums.push(num);
                    result -= num;
                }
            }
        }

        let question = nums[0].toString();
        for (let i = 0; i < ops.length; i++) {
            question += ` ${ops[i]} ${nums[i + 1]}`;
        }
        question += ' = ?';

        const formTypes = ['fill', 'single'];
        const formType = formTypes[this.random(0, 1)];

        let options = [];
        if (formType === 'single') {
            options = this.generateWrongOptions(result, 3);
            options.push(result);
            options = this.shuffle(options);
        }

        return {
            type: 'mixedAddSub',
            formType,
            question,
            answer: result,
            options
        };
    },

    generateWithin500(difficulty) {
        let a, b, isAdd;
        
        switch (difficulty) {
            case 'easy':
                a = this.random(50, 200);
                b = this.random(10, 100);
                isAdd = Math.random() > 0.5;
                if (!isAdd) {
                    [a, b] = [Math.max(a, b), Math.min(a, b)];
                }
                break;
            case 'medium':
                a = this.random(100, 300);
                b = this.random(50, 200);
                isAdd = Math.random() > 0.5;
                if (!isAdd) {
                    [a, b] = [Math.max(a, b), Math.min(a, b)];
                }
                break;
            case 'hard':
                a = this.random(200, 450);
                b = this.random(100, 250);
                isAdd = Math.random() > 0.5;
                if (!isAdd) {
                    [a, b] = [Math.max(a, b), Math.min(a, b)];
                }
                break;
        }

        const answer = isAdd ? a + b : a - b;
        const question = isAdd ? `${a} + ${b} = ?` : `${a} - ${b} = ?`;

        const formTypes = ['fill', 'single'];
        const formType = formTypes[this.random(0, 1)];

        let options = [];
        if (formType === 'single') {
            options = this.generateWrongOptions(answer, 3, 10);
            options.push(answer);
            options = this.shuffle(options);
        }

        return {
            type: 'within500',
            formType,
            question,
            answer,
            options
        };
    },

    generateMultiplication(difficulty) {
        let a, b;
        
        switch (difficulty) {
            case 'easy':
                a = this.random(1, 5);
                b = this.random(1, 5);
                break;
            case 'medium':
                a = this.random(2, 9);
                b = this.random(2, 9);
                break;
            case 'hard':
                a = this.random(5, 12);
                b = this.random(5, 12);
                break;
        }

        const answer = a * b;
        const formTypes = ['fill', 'single'];
        const formType = formTypes[this.random(0, 1)];

        let options = [];
        if (formType === 'single') {
            options = this.generateWrongOptions(answer, 3);
            options.push(answer);
            options = this.shuffle(options);
        }

        return {
            type: 'multiplication',
            formType,
            question: `${a} × ${b} = ?`,
            answer,
            options
        };
    },

    generateDivision(difficulty) {
        let a, b;
        
        switch (difficulty) {
            case 'easy':
                b = this.random(1, 5);
                a = b * this.random(1, 5);
                break;
            case 'medium':
                b = this.random(2, 9);
                a = b * this.random(2, 9);
                break;
            case 'hard':
                b = this.random(2, 12);
                a = b * this.random(2, 12);
                break;
        }

        const answer = a / b;
        const formTypes = ['fill', 'single'];
        const formType = formTypes[this.random(0, 1)];

        let options = [];
        if (formType === 'single') {
            options = this.generateWrongOptions(answer, 3);
            options.push(answer);
            options = this.shuffle(options);
        }

        return {
            type: 'division',
            formType,
            question: `${a} ÷ ${b} = ?`,
            answer,
            options
        };
    },

    generateBigMultiplication(difficulty) {
        let a, b;
        
        switch (difficulty) {
            case 'easy':
                a = this.random(10, 30);
                b = this.random(2, 9);
                break;
            case 'medium':
                a = this.random(10, 50);
                b = this.random(10, 30);
                break;
            case 'hard':
                a = this.random(20, 99);
                b = this.random(20, 99);
                break;
        }

        const answer = a * b;
        const formTypes = ['fill', 'single'];
        const formType = formTypes[this.random(0, 1)];

        let options = [];
        if (formType === 'single') {
            options = this.generateWrongOptions(answer, 3, 20);
            options.push(answer);
            options = this.shuffle(options);
        }

        return {
            type: 'bigMultiplication',
            formType,
            question: `${a} × ${b} = ?`,
            answer,
            options
        };
    },

    generateFraction(difficulty) {
        const fractionTypes = ['compare', 'add_simple', 'identify'];
        const type = fractionTypes[this.random(0, fractionTypes.length - 1)];

        let question, answer, options;

        switch (type) {
            case 'compare':
                const den = this.random(2, 6);
                const num1 = this.random(1, den - 1);
                const num2 = this.random(1, den - 1);
                question = `比较大小：${num1}/${den} 和 ${num2}/${den}，哪个大？`;
                answer = num1 > num2 ? `${num1}/${den}` : `${num2}/${den}`;
                options = [`${num1}/${den}`, `${num2}/${den}`, '一样大'];
                if (num1 === num2) {
                    answer = '一样大';
                }
                options = this.shuffle(options);
                break;

            case 'add_simple':
                const addDen = this.random(2, 6);
                const addNum1 = this.random(1, Math.floor(addDen / 2));
                const addNum2 = this.random(1, Math.floor(addDen / 2));
                const resultNum = addNum1 + addNum2;
                question = `计算：${addNum1}/${addDen} + ${addNum2}/${addDen} = ?`;
                answer = resultNum;
                options = this.generateWrongOptions(answer, 3);
                options.push(answer);
                options = this.shuffle(options);
                break;

            case 'identify':
            default:
                const identifyDen = this.random(2, 6);
                const identifyNum = this.random(1, identifyDen - 1);
                question = `一个蛋糕被分成${identifyDen}份，吃掉了${identifyNum}份，还剩下几分之几？`;
                answer = `${identifyDen - identifyNum}/${identifyDen}`;
                options = [
                    `${identifyNum}/${identifyDen}`,
                    `${identifyDen - identifyNum}/${identifyDen}`,
                    `${identifyNum}/${identifyDen - identifyNum}`
                ];
                options = this.shuffle(options);
                break;
        }

        return {
            type: 'fraction',
            formType: 'single',
            question,
            answer,
            options,
            data: type === 'add_simple' ? {
                numerator: addNum1,
                denominator: addDen,
                operation: '+',
                other: { numerator: addNum2, denominator: addDen }
            } : undefined
        };
    },

    generateRounding(difficulty) {
        const roundingTypes = ['whole', 'ten', 'hundred'];
        const type = roundingTypes[this.random(0, Math.min(roundingTypes.length - 1, difficulty === 'easy' ? 1 : 2))];

        let num, question, answer, precision;

        switch (type) {
            case 'whole':
                num = this.random(1, 99) + Math.random();
                num = Math.round(num * 10) / 10;
                precision = '整数';
                answer = Math.round(num);
                question = `将 ${num} 四舍五入到${precision}是多少？`;
                break;

            case 'ten':
                num = this.random(10, 200);
                precision = '十位';
                answer = Math.round(num / 10) * 10;
                question = `将 ${num} 四舍五入到${precision}是多少？`;
                break;

            case 'hundred':
            default:
                num = this.random(100, 1000);
                precision = '百位';
                answer = Math.round(num / 100) * 100;
                question = `将 ${num} 四舍五入到${precision}是多少？`;
                break;
        }

        const formTypes = ['fill', 'single'];
        const formType = formTypes[this.random(0, 1)];

        let options = [];
        if (formType === 'single') {
            options = this.generateWrongOptions(answer, 3, type === 'hundred' ? 100 : 10);
            options.push(answer);
            options = this.shuffle(options);
        }

        return {
            type: 'rounding',
            formType,
            question,
            answer,
            options
        };
    },

    generateClock(difficulty) {
        let hour, minute;

        switch (difficulty) {
            case 'easy':
                hour = this.random(1, 12);
                minute = this.random(0, 1) * 30;
                break;
            case 'medium':
                hour = this.random(1, 12);
                minute = this.random(0, 11) * 5;
                break;
            case 'hard':
                hour = this.random(1, 12);
                minute = this.random(0, 59);
                break;
        }

        const answer = `${hour}:${minute.toString().padStart(2, '0')}`;
        const hourDisplay = hour === 12 ? 12 : hour % 12;

        const formTypes = ['fill', 'single'];
        const formType = formTypes[this.random(0, 1)];

        let options = [];
        if (formType === 'single') {
            const wrongTimes = [];
            for (let i = 0; i < 3; i++) {
                let h = this.random(1, 12);
                let m = this.random(0, 11) * 5;
                while (h === hour && m === minute) {
                    h = this.random(1, 12);
                    m = this.random(0, 11) * 5;
                }
                wrongTimes.push(`${h}:${m.toString().padStart(2, '0')}`);
            }
            options = [...wrongTimes, answer];
            options = this.shuffle(options);
        }

        return {
            type: 'clock',
            formType,
            question: '请写出钟表显示的时间',
            answer,
            options,
            data: {
                hour: hourDisplay,
                minute
            }
        };
    },

    generateRuler(difficulty) {
        let start, end;

        switch (difficulty) {
            case 'easy':
                start = this.random(0, 5);
                end = start + this.random(1, 3);
                break;
            case 'medium':
                start = this.random(0, 6);
                end = start + this.random(2, 4);
                break;
            case 'hard':
                start = this.random(0, 7) * 0.5;
                end = start + this.random(1, 5) * 0.5;
                break;
        }

        const answer = end - start;
        const question = '请量出蓝色物体的长度（单位：厘米）';

        const formTypes = ['fill', 'single'];
        const formType = formTypes[this.random(0, 1)];

        let options = [];
        if (formType === 'single') {
            const step = difficulty === 'hard' ? 0.5 : 1;
            options = this.generateWrongOptions(answer, 3, step);
            options.push(answer);
            options = this.shuffle(options);
        }

        return {
            type: 'ruler',
            formType,
            question,
            answer,
            options,
            data: {
                start,
                end
            }
        };
    },

    generateWrongOptions(correctAnswer, count, range = 5) {
        const wrongs = new Set();
        
        while (wrongs.size < count) {
            let wrong;
            if (typeof correctAnswer === 'number' && Number.isInteger(correctAnswer)) {
                wrong = correctAnswer + this.random(-range, range);
                if (wrong === correctAnswer || wrong < 0) {
                    wrong = correctAnswer + this.random(1, range);
                }
            } else {
                wrong = Math.abs(correctAnswer - this.random(1, range));
            }
            
            if (wrong !== correctAnswer) {
                wrongs.add(wrong);
            }
        }

        return Array.from(wrongs);
    }
};
