document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initSlots();
    initTurtles();
    initTrivia();
    initRPS();
    initAdventure();
});

/* ==========================================================================
   NAVIGATION
   ========================================================================== */
function initNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn");
    const gameCards = document.querySelectorAll(".game-card");
    const sections = document.querySelectorAll(".game-section");

    function switchSection(targetId) {
        sections.forEach(sec => {
            sec.classList.remove("active");
        });
        const activeSection = document.getElementById(`game-${targetId}`);
        if (activeSection) {
            activeSection.classList.add("active");
        }

        navButtons.forEach(btn => {
            if (btn.dataset.game === targetId) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            switchSection(btn.dataset.game);
        });
    });

    gameCards.forEach(card => {
        card.addEventListener("click", () => {
            switchSection(card.dataset.game);
        });
    });
}

/* ==========================================================================
   GAME: SLOT MACHINE
   ========================================================================== */
function initSlots() {
    let balance = 0;
    const symbolCount = { "💎": 2, "🍒": 3, "🍋": 4, "🔔": 6 };
    const symbolValue = { "💎": 5, "🍒": 4, "🍋": 3, "🔔": 2 };
    const symbolsPool = [];

    // Create a pool of symbols based on frequency count
    for (const [sym, count] of Object.entries(symbolCount)) {
        for (let i = 0; i < count; i++) {
            symbolsPool.push(sym);
        }
    }

    const depositScreen = document.getElementById("slots-deposit-screen");
    const depositInput = document.getElementById("slots-deposit-input");
    const depositBtn = document.getElementById("slots-deposit-btn");
    const balanceDisplay = document.getElementById("slots-balance");
    const spinBtn = document.getElementById("slots-spin-btn");
    
    const linesInput = document.getElementById("slots-lines");
    const betInput = document.getElementById("slots-bet");
    const totalBetDisplay = document.getElementById("slots-total-bet");
    const resultBanner = document.getElementById("slots-result-banner");
    const historyList = document.getElementById("slots-history");

    // Deposit Action
    depositBtn.addEventListener("click", () => {
        const amount = parseInt(depositInput.value);
        if (amount >= 500) {
            balance = amount;
            updateBalance();
            depositScreen.style.display = "none";
        } else {
            alert("Minimum deposit is $500.");
        }
    });

    // Bet adjustment controls
    document.getElementById("slots-lines-dec").addEventListener("click", () => adjustInput(linesInput, -1, 1, 3));
    document.getElementById("slots-lines-inc").addEventListener("click", () => adjustInput(linesInput, 1, 1, 3));
    document.getElementById("slots-bet-dec").addEventListener("click", () => adjustInput(betInput, -5, 1, 1000));
    document.getElementById("slots-bet-inc").addEventListener("click", () => adjustInput(betInput, 5, 1, 1000));

    function adjustInput(inputEl, delta, min, max) {
        let val = parseInt(inputEl.value) + delta;
        if (val < min) val = min;
        if (val > max) val = max;
        inputEl.value = val;
        updateTotalBet();
    }

    function updateTotalBet() {
        const total = parseInt(linesInput.value) * parseInt(betInput.value);
        totalBetDisplay.textContent = `$${total}`;
    }

    function updateBalance() {
        balanceDisplay.textContent = `$${balance}`;
    }

    // Spin mechanism
    spinBtn.addEventListener("click", () => {
        const lines = parseInt(linesInput.value);
        const bet = parseInt(betInput.value);
        const totalBet = lines * bet;

        if (totalBet > balance) {
            alert("Insufficient balance! Please deposit more money or lower your bet.");
            return;
        }

        // Deduct bet
        balance -= totalBet;
        updateBalance();
        spinBtn.disabled = true;
        resultBanner.classList.add("hidden");

        // Spin Animation Setup
        const reels = [
            document.getElementById("reel-0"),
            document.getElementById("reel-1"),
            document.getElementById("reel-2")
        ];

        let finalGrid = [[], [], []]; // cols x rows

        reels.forEach((reel, colIndex) => {
            const strip = reel.querySelector(".reel-strip");
            
            // Randomly generate spin results
            const colSymbols = [];
            for (let r = 0; r < 3; r++) {
                const randIndex = Math.floor(Math.random() * symbolsPool.length);
                colSymbols.push(symbolsPool[randIndex]);
            }
            finalGrid[colIndex] = colSymbols;

            // Generate temporary strip symbols for scrolling effect
            const scrollSymbols = [];
            for (let i = 0; i < 15; i++) {
                const randIndex = Math.floor(Math.random() * symbolsPool.length);
                scrollSymbols.push(symbolsPool[randIndex]);
            }
            // Append final results to the end of the scroll array
            scrollSymbols.push(...colSymbols);

            // Rebuild strip content
            strip.innerHTML = scrollSymbols.map(sym => `<div class="symbol">${sym}</div>`).join("");
            strip.style.transition = "none";
            strip.style.top = "0px";

            // Trigger scroll animation
            setTimeout(() => {
                strip.style.transition = `top ${1.5 + colIndex * 0.4}s cubic-bezier(0.1, 0.9, 0.25, 1.02)`;
                strip.style.top = `-${120 * (scrollSymbols.length - 3)}px`;
            }, 50);
        });

        // Calculate results after the last reel completes spinning
        setTimeout(() => {
            const winnings = checkWinnings(finalGrid, lines, bet, symbolValue);
            balance += winnings.amount;
            updateBalance();

            // Display results
            if (winnings.amount > 0) {
                resultBanner.querySelector(".banner-amount").textContent = `+$${winnings.amount}`;
                resultBanner.querySelector(".banner-text").textContent = "WINNER!";
                resultBanner.classList.remove("hidden");
                addHistoryLog(true, totalBet, winnings.amount);
            } else {
                addHistoryLog(false, totalBet, 0);
            }
            spinBtn.disabled = false;
        }, 2500);
    });

    // Check game winning lines
    function checkWinnings(columns, lines, bet, values) {
        let amount = 0;
        let winningLines = [];

        // Check each line requested
        for (let row = 0; row < lines; row++) {
            const symbol = columns[0][row];
            let allMatch = true;

            for (let col = 1; col < columns.length; col++) {
                if (columns[col][row] !== symbol) {
                    allMatch = false;
                    break;
                }
            }

            if (allMatch) {
                amount += values[symbol] * bet;
                winningLines.push(row + 1);
            }
        }

        return { amount, winningLines };
    }

    function addHistoryLog(isWin, totalBet, winAmount) {
        const item = document.createElement("div");
        item.className = `history-item ${isWin ? 'win' : ''}`;
        
        if (isWin) {
            item.innerHTML = `
                <span class="outcome">WIN</span>
                <span class="details">Bet $${totalBet} | Won $${winAmount}</span>
            `;
        } else {
            item.innerHTML = `
                <span class="outcome">LOSE</span>
                <span class="details">Bet $${totalBet}</span>
            `;
        }

        // Insert at top of list
        const empty = historyList.querySelector(".history-empty");
        if (empty) empty.remove();
        historyList.insertBefore(item, historyList.firstChild);
    }
}

/* ==========================================================================
   GAME: TURTLE RACING
   ========================================================================== */
function initTurtles() {
    const canvas = document.getElementById("race-canvas");
    const ctx = canvas.getContext("2d");
    const countInput = document.getElementById("racer-count");
    const setupBtn = document.getElementById("setup-race-btn");
    const startBtn = document.getElementById("start-race-btn");
    const winnerBanner = document.getElementById("race-banner");
    const winnerText = document.getElementById("race-winner-text");

    const COLORS = ['red', 'green', 'blue', 'orange', 'yellow', 'cyan', 'magenta', 'lime', 'coral', 'indigo'];
    let racers = [];
    let isRacing = false;
    let raceAnimationId = null;

    class Racer {
        constructor(color, x, y) {
            this.color = color;
            this.x = x;
            this.y = y;
            this.size = 14;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);

            // Draw limbs
            ctx.fillStyle = "#8bc34a";
            ctx.beginPath();
            ctx.arc(-8, -8, 4, 0, Math.PI * 2); // Top left leg
            ctx.arc(8, -8, 4, 0, Math.PI * 2);  // Top right leg
            ctx.arc(-8, 8, 4, 0, Math.PI * 2);  // Bottom left leg
            ctx.arc(8, 8, 4, 0, Math.PI * 2);   // Bottom right leg
            ctx.fill();

            // Head
            ctx.fillStyle = "#689f38";
            ctx.beginPath();
            ctx.arc(this.size + 2, 0, 5, 0, Math.PI * 2);
            ctx.fill();

            // Tail
            ctx.beginPath();
            ctx.moveTo(-this.size - 2, 0);
            ctx.lineTo(-this.size - 5, -2);
            ctx.lineTo(-this.size - 5, 2);
            ctx.closePath();
            ctx.fill();

            // Shell
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();

            // Shell Pattern lines (retro vibe)
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        }
    }

    function setupRace() {
        if (isRacing) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        winnerBanner.classList.add("hidden");

        const count = Math.max(2, Math.min(10, parseInt(countInput.value)));
        countInput.value = count;
        racers = [];

        // Track Lanes & Finish Line styling
        const laneHeight = canvas.height / (count + 1);
        
        // Draw Track Elements
        drawTrack(count, laneHeight);

        // Position Racers at the starting line (X = 40)
        for (let i = 0; i < count; i++) {
            const y = laneHeight * (i + 1);
            const racer = new Racer(COLORS[i], 40, y);
            racer.draw();
            racers.push(racer);
        }

        startBtn.disabled = false;
    }

    function drawTrack(count, laneHeight) {
        ctx.fillStyle = "#1e183a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 2;

        // Draw Lanes
        for (let i = 1; i <= count; i++) {
            ctx.beginPath();
            ctx.moveTo(0, laneHeight * i + laneHeight/2);
            ctx.lineTo(canvas.width, laneHeight * i + laneHeight/2);
            ctx.stroke();
        }

        // Draw Start Line
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(60, 0);
        ctx.lineTo(60, canvas.height);
        ctx.stroke();

        // Draw Finish Line (checkered neon red)
        ctx.strokeStyle = "#ff007f";
        ctx.lineWidth = 6;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(canvas.width - 60, 0);
        ctx.lineTo(canvas.width - 60, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function startRace() {
        if (isRacing) return;
        isRacing = true;
        setupBtn.disabled = true;
        startBtn.disabled = true;

        const finishLineX = canvas.width - 60;
        const laneHeight = canvas.height / (racers.length + 1);

        function gameLoop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawTrack(racers.length, laneHeight);

            let winner = null;

            racers.forEach(racer => {
                // Move random distance
                if (!winner) {
                    const step = Math.random() * 4 + 0.5;
                    racer.x += step;
                }

                racer.draw();

                // Check winner
                if (racer.x >= finishLineX && !winner) {
                    winner = racer;
                }
            });

            if (winner) {
                isRacing = false;
                setupBtn.disabled = false;
                winnerText.textContent = `${winner.color.toUpperCase()} Turtle Wins!`;
                winnerBanner.style.borderColor = winner.color;
                winnerBanner.classList.remove("hidden");
                cancelAnimationFrame(raceAnimationId);
            } else {
                raceAnimationId = requestAnimationFrame(gameLoop);
            }
        }

        gameLoop();
    }

    setupBtn.addEventListener("click", setupRace);
    startBtn.addEventListener("click", startRace);

    // Run initial setup
    setupRace();
}

/* ==========================================================================
   GAME: TRIVIA CHALLENGE
   ========================================================================== */
function initTrivia() {
    const triviaQuestions = [
        { q: "Who was the first Prime Minister of India?", a: "Jawaharlal Nehru", dist: ["Mahatma Gandhi", "Sardar Patel", "Lal Bahadur Shastri"] },
        { q: "Which planet is known as the Red Planet?", a: "Mars", dist: ["Venus", "Jupiter", "Saturn"] },
        { q: "What is the capital of France?", a: "Paris", dist: ["Berlin", "London", "Rome"] },
        { q: "Who wrote the Indian National Anthem?", a: "Rabindranath Tagore", dist: ["Bankim Chandra Chatterjee", "Sarojini Naidu", "Premchand"] },
        { q: "Which is the largest ocean in the world?", a: "Pacific Ocean", dist: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"] },
        { q: "How many players are there in a cricket team?", a: "11", dist: ["9", "10", "12"] },
        { q: "Who is known as the Father of the Nation in India?", a: "Mahatma Gandhi", dist: ["Subhash Chandra Bose", "Bhagat Singh", "B.R. Ambedkar"] },
        { q: "Which is the tallest mountain in the world?", a: "Mount Everest", dist: ["K2", "Kangchenjunga", "Lhotse"] },
        { q: "What is the national animal of India?", a: "Tiger", dist: ["Lion", "Leopard", "Elephant"] },
        { q: "Who invented the telephone?", a: "Alexander Graham Bell", dist: ["Thomas Edison", "Nikola Tesla", "Guglielmo Marconi"] }
    ];

    let selectedQuestions = [];
    let currentIdx = 0;
    let score = 0;

    const startBtn = document.getElementById("start-trivia-btn");
    const resetBtn = document.getElementById("reset-trivia-btn");
    
    const introScreen = document.getElementById("trivia-intro");
    const quizScreen = document.getElementById("trivia-quiz");
    const resultsScreen = document.getElementById("trivia-results");

    const qText = document.getElementById("trivia-question");
    const qProgress = document.getElementById("trivia-current");
    const qOptions = document.getElementById("trivia-options");
    const scoreVal = document.getElementById("trivia-score");

    const finalScoreEl = document.getElementById("trivia-final-score");
    const performanceText = document.getElementById("trivia-performance-text");

    function startQuiz() {
        // Select 5 random questions
        selectedQuestions = triviaQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
        currentIdx = 0;
        score = 0;
        scoreVal.textContent = "0";

        introScreen.classList.add("hidden");
        resultsScreen.classList.add("hidden");
        quizScreen.classList.remove("hidden");

        showQuestion();
    }

    function showQuestion() {
        const questionObj = selectedQuestions[currentIdx];
        qText.textContent = questionObj.q;
        qProgress.textContent = currentIdx + 1;

        // Mix distractors with correct answer
        const allOptions = [questionObj.a, ...questionObj.dist].sort(() => 0.5 - Math.random());

        qOptions.innerHTML = "";
        allOptions.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.textContent = opt;
            btn.addEventListener("click", () => checkAnswer(btn, opt, questionObj.a));
            qOptions.appendChild(btn);
        });
    }

    function checkAnswer(selectedBtn, answer, correct) {
        // Disable all buttons immediately
        const buttons = qOptions.querySelectorAll(".option-btn");
        buttons.forEach(btn => btn.disabled = true);

        if (answer === correct) {
            selectedBtn.classList.add("correct");
            score++;
            scoreVal.textContent = score;
        } else {
            selectedBtn.classList.add("wrong");
            // Show correct answer highlighted
            buttons.forEach(btn => {
                if (btn.textContent === correct) {
                    btn.classList.add("correct");
                }
            });
        }

        // Transition to next question
        setTimeout(() => {
            currentIdx++;
            if (currentIdx < selectedQuestions.length) {
                showQuestion();
            } else {
                showResults();
            }
        }, 1500);
    }

    function showResults() {
        quizScreen.classList.add("hidden");
        resultsScreen.classList.remove("hidden");
        
        finalScoreEl.textContent = score;
        if (score === 5) {
            performanceText.textContent = "Perfect score! Outstanding!";
        } else if (score >= 3) {
            performanceText.textContent = "Great job! You know your stuff.";
        } else {
            performanceText.textContent = "Nice try! Better luck next time.";
        }
    }

    startBtn.addEventListener("click", startQuiz);
    resetBtn.addEventListener("click", startQuiz);
}

/* ==========================================================================
   GAME: ROCK PAPER SCISSORS
   ========================================================================== */
function initRPS() {
    let userScore = 0;
    let cpuScore = 0;

    const userHand = document.getElementById("rps-user-hand");
    const cpuHand = document.getElementById("rps-cpu-hand");
    const outcomeBanner = document.getElementById("rps-outcome");
    const userScoreDisplay = document.getElementById("rps-user-score");
    const cpuScoreDisplay = document.getElementById("rps-cpu-score");
    const resetBtn = document.getElementById("reset-rps-btn");

    const emojiMap = {
        rock: "✊",
        paper: "🖐️",
        scissors: "✌️"
    };

    const choiceButtons = document.querySelectorAll(".rps-choice-btn");
    
    choiceButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const playerChoice = btn.dataset.choice;
            playRound(playerChoice);
        });
    });

    function playRound(playerChoice) {
        // Disable buttons during shake animation
        choiceButtons.forEach(btn => btn.disabled = true);

        // Put hands back to default shaking fists
        userHand.textContent = "✊";
        cpuHand.textContent = "✊";
        
        // Add shaking classes
        userHand.style.animation = "shake 0.5s ease 3";
        cpuHand.style.animation = "shake 0.5s ease 3";

        setTimeout(() => {
            // Remove shaking
            userHand.style.animation = "";
            cpuHand.style.animation = "";

            const options = ["rock", "paper", "scissors"];
            const cpuChoice = options[Math.floor(Math.random() * 3)];

            // Reveal hands
            userHand.textContent = emojiMap[playerChoice];
            cpuHand.textContent = emojiMap[cpuChoice];

            // Determine winner
            if (playerChoice === cpuChoice) {
                outcomeBanner.textContent = `It's a tie! Both chose ${playerChoice.toUpperCase()}.`;
                outcomeBanner.style.color = "var(--text-muted)";
            } else if (
                (playerChoice === "rock" && cpuChoice === "scissors") ||
                (playerChoice === "paper" && cpuChoice === "rock") ||
                (playerChoice === "scissors" && cpuChoice === "paper")
            ) {
                outcomeBanner.textContent = `You win! ${playerChoice.toUpperCase()} beats ${cpuChoice.toUpperCase()}.`;
                outcomeBanner.style.color = "var(--neon-green)";
                userScore++;
                userScoreDisplay.textContent = userScore;
            } else {
                outcomeBanner.textContent = `You lose! ${cpuChoice.toUpperCase()} beats ${playerChoice.toUpperCase()}.`;
                outcomeBanner.style.color = "var(--neon-red)";
                cpuScore++;
                cpuScoreDisplay.textContent = cpuScore;
            }

            // Re-enable buttons
            choiceButtons.forEach(btn => btn.disabled = false);
        }, 1200);
    }

    resetBtn.addEventListener("click", () => {
        userScore = 0;
        cpuScore = 0;
        userScoreDisplay.textContent = "0";
        cpuScoreDisplay.textContent = "0";
        userHand.textContent = "✊";
        cpuHand.textContent = "✊";
        outcomeBanner.textContent = "Choose your move to begin!";
        outcomeBanner.style.color = "";
    });
}

/* ==========================================================================
   GAME: CHOOSE YOUR OWN ADVENTURE
   ========================================================================== */
function initAdventure() {
    let username = "Adventurer";
    let currentStep = "start";

    const nameInputScreen = document.getElementById("adventure-name-input-screen");
    const gameplayScreen = document.getElementById("adventure-story-gameplay");
    const usernameInput = document.getElementById("adventure-username");
    const startBtn = document.getElementById("start-adventure-btn");

    const titleEl = document.getElementById("adventure-title");
    const textEl = document.getElementById("adventure-text");
    const choicesEl = document.getElementById("adventure-choices");
    const sceneryEl = document.getElementById("adventure-scenery");

    const steps = {
        dirt_road: {
            title: "The Dirt Road Fork",
            scenery: "assets/adventure_start.png",
            filter: "none",
            getText: () => `You are on a dirt road, it has come to an end. You can go left or right. Which way would you go, ${username}?`,
            choices: [
                { label: "Go Left", next: "river" },
                { label: "Go Right", next: "bridge" }
            ]
        },
        river: {
            title: "The Wide River",
            scenery: "assets/adventure_river.png",
            filter: "none",
            getText: () => `You come to a rushing river, ${username}. You can walk around it or swim across.`,
            choices: [
                { label: "Swim across", next: "eaten_alligator" },
                { label: "Walk around", next: "no_water" }
            ]
        },
        bridge: {
            title: "The Wobbly Bridge",
            scenery: "assets/adventure_bridge.png",
            filter: "none",
            getText: () => `You come to a wooden rope bridge, ${username}. It looks very wobbly. Do you want to cross it or head back?`,
            choices: [
                { label: "Cross the bridge", next: "stranger" },
                { label: "Head back", next: "go_back_lose" }
            ]
        },
        stranger: {
            title: "A Mysterious Stranger",
            scenery: "assets/adventure_stranger.png",
            filter: "none",
            getText: () => `You safely cross the bridge and meet a mysterious stranger standing under a giant golden tree. Do you talk to them?`,
            choices: [
                { label: "Talk to them (Yes)", next: "gold_win" },
                { label: "Ignore them (No)", next: "stranger_offended" }
            ]
        },
        // Endings
        eaten_alligator: {
            title: "Game Over",
            scenery: "assets/adventure_river.png",
            filter: "grayscale(1) brightness(0.4) sepia(1) hue-rotate(-50deg)",
            getText: () => `You swam across and were eaten by an alligator.`,
            choices: [{ label: "Try Again", next: "dirt_road" }]
        },
        no_water: {
            title: "Game Over",
            scenery: "assets/adventure_river.png",
            filter: "grayscale(1) brightness(0.4) sepia(1) hue-rotate(-50deg)",
            getText: () => `You walked for many miles, ran out of water, and lost the game.`,
            choices: [{ label: "Try Again", next: "dirt_road" }]
        },
        go_back_lose: {
            title: "Game Over",
            scenery: "assets/adventure_bridge.png",
            filter: "grayscale(1) brightness(0.4) sepia(1) hue-rotate(-50deg)",
            getText: () => `You decided to head back, but lost your way and lost the game.`,
            choices: [{ label: "Try Again", next: "dirt_road" }]
        },
        stranger_offended: {
            title: "Game Over",
            scenery: "assets/adventure_stranger.png",
            filter: "grayscale(1) brightness(0.4) sepia(1) hue-rotate(-50deg)",
            getText: () => `You ignored the stranger. They were deeply offended and locked the pathway. You lose.`,
            choices: [{ label: "Try Again", next: "dirt_road" }]
        },
        gold_win: {
            title: "🎉 Victory!",
            scenery: "assets/adventure_stranger.png",
            filter: "none",
            getText: () => `You talked to the stranger and they gifted you a legendary chest of gold! You WIN, ${username}!`,
            choices: [{ label: "Play Again", next: "dirt_road" }]
        }
    };

    startBtn.addEventListener("click", () => {
        if (usernameInput.value.trim() !== "") {
            username = usernameInput.value.trim();
        }
        nameInputScreen.classList.add("hidden");
        gameplayScreen.classList.remove("hidden");
        goToStep("dirt_road");
    });

    function goToStep(stepKey) {
        currentStep = stepKey;
        const step = steps[stepKey];

        const avatarContainer = document.getElementById("adventure-avatar-container");
        const deathOverlay = document.getElementById("death-cause-overlay");

        // Handle Avatar resets
        avatarContainer.classList.remove("dead");
        deathOverlay.classList.add("hidden");

        // Handle death causes
        if (stepKey === "eaten_alligator") {
            avatarContainer.classList.add("dead");
            deathOverlay.textContent = "🐊";
            deathOverlay.classList.remove("hidden");
        } else if (stepKey === "no_water") {
            avatarContainer.classList.add("dead");
            deathOverlay.textContent = "🏜️";
            deathOverlay.classList.remove("hidden");
        } else if (stepKey === "go_back_lose") {
            avatarContainer.classList.add("dead");
            deathOverlay.textContent = "🧭";
            deathOverlay.classList.remove("hidden");
        } else if (stepKey === "stranger_offended") {
            avatarContainer.classList.add("dead");
            deathOverlay.textContent = "⚡";
            deathOverlay.classList.remove("hidden");
        }

        // Update Text & Title
        titleEl.textContent = step.title;
        textEl.textContent = step.getText();

        // Update Scenery
        sceneryEl.src = step.scenery;
        sceneryEl.style.filter = step.filter;

        // Render Choice Buttons
        choicesEl.innerHTML = "";
        step.choices.forEach(choice => {
            const btn = document.createElement("button");
            btn.className = "arcade-btn";
            if (choice.next === "dirt_road") {
                btn.className += " warning"; // highlight reset buttons
            } else if (choice.next === "gold_win") {
                btn.className += " success"; // success style
            }
            btn.textContent = choice.label;
            btn.addEventListener("click", () => goToStep(choice.next));
            choicesEl.appendChild(btn);
        });
    }
}
