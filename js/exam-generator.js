const examGenerator = {
    generate(settings) {
        const { difficulty, questionCount, types } = settings;
        const questions = [];
        const typeDistribution = this.getTypeDistribution(types, questionCount, difficulty);
        
        let questionIndex = 0;
        typeDistribution.forEach(dist => {
            for (let i = 0; i < dist.count; i++) {
                const question = questionGenerator.generate(dist.type, difficulty);
                question.id = questionIndex++;
                questions.push(question);
            }
        });

        return this.shuffleAndArrange(questions, difficulty);
    },

    getTypeDistribution(types, totalCount, difficulty) {
        const distribution = [];
        const baseCount = Math.floor(totalCount / types.length);
        const remaining = totalCount - baseCount * types.length;
        
        types.forEach((type, index) => {
            let count = baseCount;
            if (index < remaining) {
                count++;
            }
            
            if (count > 0) {
                distribution.push({ type, count });
            }
        });

        return distribution;
    },

    shuffleAndArrange(questions, difficulty) {
        const shuffled = [...questions];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const basicTypes = ['addition', 'subtraction'];
        const basicFirst = shuffled.filter(q => basicTypes.includes(q.type));
        const others = shuffled.filter(q => !basicTypes.includes(q.type));

        const arranged = [];
        let basicIndex = 0;
        let otherIndex = 0;

        while (basicIndex < basicFirst.length || otherIndex < others.length) {
            if (basicIndex < basicFirst.length) {
                arranged.push(basicFirst[basicIndex++]);
            }
            if (otherIndex < others.length) {
                arranged.push(others[otherIndex++]);
            }
        }

        arranged.forEach((q, index) => {
            q.id = index;
        });

        return {
            questions: arranged,
            total: arranged.length,
            difficulty,
            createdAt: Date.now()
        };
    },

    generateQuickPractice() {
        return this.generate({
            difficulty: 'medium',
            questionCount: 10,
            types: ['addition', 'subtraction', 'multiplication', 'division', 'numberPattern']
        });
    },

    generateByGrade(grade) {
        const gradeSettings = {
            1: {
                difficulty: 'easy',
                questionCount: 15,
                types: ['addition', 'subtraction', 'numberPattern']
            },
            2: {
                difficulty: 'easy',
                questionCount: 20,
                types: ['addition', 'subtraction', 'mixedAddSub', 'numberPattern', 'clock']
            },
            3: {
                difficulty: 'medium',
                questionCount: 20,
                types: ['addition', 'subtraction', 'multiplication', 'division', 'within500', 'ruler']
            },
            4: {
                difficulty: 'medium',
                questionCount: 25,
                types: ['multiplication', 'division', 'within500', 'bigMultiplication', 'fraction', 'rounding']
            },
            5: {
                difficulty: 'hard',
                questionCount: 25,
                types: ['bigMultiplication', 'division', 'fraction', 'rounding', 'numberPattern', 'mixedAddSub']
            }
        };

        const settings = gradeSettings[grade] || gradeSettings[3];
        return this.generate(settings);
    }
};
