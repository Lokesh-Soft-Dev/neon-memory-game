document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const gameBoard = document.getElementById('game-board');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const difficultySelect = document.getElementById('difficulty');
    const timerDisplay = document.getElementById('time');
    const movesDisplay = document.getElementById('moves');
    const scoreDisplay = document.getElementById('score');
    const gameModal = document.getElementById('game-modal');
    const finalTimeDisplay = document.getElementById('final-time');
    const finalMovesDisplay = document.getElementById('final-moves');
    const finalScoreDisplay = document.getElementById('final-score');

    // Game state variables
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let score = 0;
    let timer = null;
    let seconds = 0;
    let totalPairs = 0;
    let gameStarted = false;
    let canFlip = true;

    // Icons for cards
     const icons = [
        'fa-atom', 'fa-rocket', 'fa-robot', 'fa-microchip', 'fa-satellite',
        'fa-galaxy', 'fa-meteor', 'fa-user-astronaut', 'fa-space-shuttle', 'fa-satellite-dish',
        'fa-fan', 'fa-hologram', 'fa-lightbulb', 'fa-bolt', 'fa-radiation',
        'fa-shield-alt', 'fa-infinity', 'fa-cube', 'fa-dna', 'fa-flask',
        'fa-wifi', 'fa-bluetooth', 'fa-gamepad', 'fa-headset', 'fa-keyboard',
        'fa-memory', 'fa-server', 'fa-upload', 'fa-download', 'fa-qrcode',
        'fa-heart', 'fa-moon'
    ];

    // Initialize game
    function initGame() {
        clearInterval(timer);
        gameBoard.innerHTML = '';
        gameBoard.className = 'game-board';

        // Reset game state
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        score = 0;
        seconds = 0;
        gameStarted = false;

        // Update UI
        movesDisplay.textContent = moves;
        scoreDisplay.textContent = score;
        timerDisplay.textContent = '00:00';
        gameModal.classList.remove('show');

        // Set difficulty
        const difficulty = difficultySelect.value;
        gameBoard.classList.add(difficulty);

        // Determine number of pairs
        switch (difficulty) {
            case 'easy':
                totalPairs = 8;
                break;
            case 'medium':
                totalPairs = 18;
                break;
            case 'hard':
                totalPairs = 32;
                break;
        }

        // Create card pairs
        const selectedIcons = icons.slice(0, totalPairs);
        const cardValues = [...selectedIcons, ...selectedIcons];
        shuffleArray(cardValues);

        // Create card elements
        cardValues.forEach((icon, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = index;
            card.dataset.value = icon;

            const cardInner = document.createElement('div');
            cardInner.className = 'card-inner';

            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            const iconElement = document.createElement('i');
            iconElement.className = `fas ${icon}`;
            cardFront.appendChild(iconElement);

            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            cardBack.textContent = '?';

            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);

            card.addEventListener('click', flipCard);
            cards.push(card);
            gameBoard.appendChild(card);
        });

        showCardsBriefly();
    }

    function showCardsBriefly() {
        canFlip = false;
        cards.forEach(card => card.classList.add('flipped'));
        setTimeout(() => {
            cards.forEach(card => card.classList.remove('flipped'));
            canFlip = true;
        }, 2000);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    function flipCard() {
        if (!canFlip || this.classList.contains('flipped') || this.classList.contains('matched')) return;

        if (!gameStarted) startGame();

        // ✅ Play flip sound immediately
        playSound('flip');

        this.classList.add('flipped');
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            moves++;
            movesDisplay.textContent = moves;
            score = Math.max(0, Math.floor((totalPairs * 100) - (moves * 5) - (seconds * 0.5)));
            scoreDisplay.textContent = score;

            const [firstCard, secondCard] = flippedCards;

            if (firstCard.dataset.value === secondCard.dataset.value) {
                // ✅ Delay only the match sound
                setTimeout(() => {
                    playSound('match');
                    flippedCards.forEach(card => card.classList.add('matched'));
                    flippedCards = [];
                    matchedPairs++;
                    if (matchedPairs === totalPairs) endGame();
                }, 900); // Adjust this delay as needed
            } else {
                canFlip = false;
                setTimeout(() => {
                    playSound('mismatch');
                    flippedCards.forEach(card => card.classList.remove('flipped'));
                    flippedCards = [];
                    canFlip = true;
                }, 1000);
            }
        }
    }

    function playSound(type) {
        const sounds = {
            flip: new Audio('./Sounds/Flip.mp3'),
            match: new Audio('./Sounds/Matched.mp3'),
            mismatch: new Audio('./Sounds/Mis Match.mp3'),
            win: new Audio('./Sounds/Win.mp3')
        };

        const sound = sounds[type];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    function startGame() {
        gameStarted = true;
        timer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function endGame() {
        clearInterval(timer);
        playSound('win');

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        finalTimeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        finalMovesDisplay.textContent = moves;
        finalScoreDisplay.textContent = score;

        gameModal.classList.add('show');
        createConfetti();
    }

    function createConfetti() {
        const confettiContainer = document.querySelector('.confetti');
        confettiContainer.innerHTML = '';
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDelay = `${Math.random() * 3}s`;
            confetti.style.backgroundColor = getRandomColor();
            confettiContainer.appendChild(confetti);
        }
    }

    function getRandomColor() {
        const colors = ['#00f0ff', '#ff00e4', '#7b2dff', '#00ff9d', '#ff3860'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Event listeners
    startBtn.addEventListener('click', initGame);
    resetBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', () => {
        gameModal.classList.remove('show');
        initGame();
    });

    // Initialize game on load
    initGame();
});
