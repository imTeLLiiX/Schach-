// Spielzustand
let gameState = {
    board: [],
    currentPlayer: 'white',
    selectedPiece: null,
    isAIMode: false,
    isAITurn: false,
    isBlitzMode: false,
    isPracticeMode: false,
    moveCount: 0,
    capturedPieces: 0,
    timeLeft: 600, // 10 Minuten in Sekunden
    timer: null,
    achievements: new Set(),
    statistics: {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        totalMoves: 0,
        totalCaptures: 0
    }
};

// DOM-Elemente
const board = document.getElementById('board');
const status = document.getElementById('status');
const timer = document.getElementById('timer');
const moves = document.getElementById('moves');
const captured = document.getElementById('captured');
const themeToggle = document.getElementById('themeToggle');
const aiDifficulty = document.getElementById('aiDifficulty');

// Sound-Effekte
const sounds = {
    move: document.getElementById('moveSound'),
    capture: document.getElementById('captureSound'),
    check: document.getElementById('checkSound'),
    gameStart: document.getElementById('gameStartSound'),
    gameEnd: document.getElementById('gameEndSound'),
    achievement: document.getElementById('achievementSound'),
    background: document.getElementById('backgroundMusic')
};

// Schach-Timer Funktionalität
class ChessTimer {
    constructor() {
        this.whiteTime = 600; // 10 Minuten in Sekunden
        this.blackTime = 600;
        this.activeTimer = null;
        this.interval = null;
        this.isRunning = false;

        // DOM Elemente
        this.whiteDisplay = document.getElementById('whiteTime');
        this.blackDisplay = document.getElementById('blackTime');
        this.whiteTimer = document.getElementById('whiteTimer');
        this.blackTimer = document.getElementById('blackTimer');
        this.whiteTimerContainer = document.querySelector('.white-timer');
        this.blackTimerContainer = document.querySelector('.black-timer');

        // Event Listener
        this.whiteTimer.addEventListener('click', () => this.toggleTimer('white'));
        this.blackTimer.addEventListener('click', () => this.toggleTimer('black'));

        // Initialisierung
        this.updateDisplay();
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updateDisplay() {
        this.whiteDisplay.textContent = this.formatTime(this.whiteTime);
        this.blackDisplay.textContent = this.formatTime(this.blackTime);

        // Warnung bei wenig Zeit (unter 30 Sekunden)
        this.whiteTimerContainer.classList.toggle('time-low', this.whiteTime < 30);
        this.blackTimerContainer.classList.toggle('time-low', this.blackTime < 30);
    }

    toggleTimer(color) {
        if (!this.isRunning) {
            this.startTimer(color);
        } else if (this.activeTimer === color) {
            this.pauseTimer();
        } else {
            this.switchTimer(color);
        }
    }

    startTimer(color) {
        this.isRunning = true;
        this.activeTimer = color;
        this.updateActiveState();
        
        this.interval = setInterval(() => {
            if (this.activeTimer === 'white') {
                this.whiteTime--;
                if (this.whiteTime <= 0) {
                    this.timeUp('white');
                }
            } else {
                this.blackTime--;
                if (this.blackTime <= 0) {
                    this.timeUp('black');
                }
            }
            this.updateDisplay();
        }, 1000);

        // Button-Text aktualisieren
        this.whiteTimer.textContent = color === 'white' ? '⏸' : '▶';
        this.blackTimer.textContent = color === 'black' ? '⏸' : '▶';
    }

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.interval);
        this.interval = null;
        this.activeTimer = null;
        this.updateActiveState();
        
        // Button-Text zurücksetzen
        this.whiteTimer.textContent = '▶';
        this.blackTimer.textContent = '▶';
    }

    switchTimer(color) {
        clearInterval(this.interval);
        this.startTimer(color);
    }

    timeUp(color) {
        this.pauseTimer();
        alert(`Zeit abgelaufen! ${color === 'white' ? 'Schwarz' : 'Weiß'} gewinnt!`);
    }

    updateActiveState() {
        this.whiteTimerContainer.classList.toggle('active', this.activeTimer === 'white');
        this.blackTimerContainer.classList.toggle('active', this.activeTimer === 'black');
    }

    reset() {
        this.pauseTimer();
        this.whiteTime = 600;
        this.blackTime = 600;
        this.updateDisplay();
    }
}

// Timer initialisieren
const chessTimer = new ChessTimer();

// Timer bei neuem Spiel zurücksetzen
document.getElementById('newGame').addEventListener('click', () => {
    chessTimer.reset();
});

// Initialisierung
function initializeGame() {
    createBoard();
    setupEventListeners();
    loadGameState();
    startTutorial();
    playSound('gameStart');
}

// Schachbrett erstellen
function createBoard() {
    const initialSetup = [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];

    board.innerHTML = '';
    gameState.board = [];

    for (let row = 0; row < 8; row++) {
        gameState.board[row] = [];
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            square.textContent = initialSetup[row][col];
            square.addEventListener('click', handleSquareClick);
            board.appendChild(square);
            gameState.board[row][col] = initialSetup[row][col];
        }
    }
}

// Event Listener Setup
function setupEventListeners() {
    // Spielmodus-Buttons
    document.getElementById('mode2player').addEventListener('click', () => setGameMode('2player'));
    document.getElementById('modeAI').addEventListener('click', () => setGameMode('ai'));
    document.getElementById('modeBlitz').addEventListener('click', () => setGameMode('blitz'));
    document.getElementById('modePractice').addEventListener('click', () => setGameMode('practice'));

    // Spiel-Buttons
    document.getElementById('newGame').addEventListener('click', startNewGame);
    document.getElementById('saveGame').addEventListener('click', saveGameState);
    document.getElementById('loadGame').addEventListener('click', loadGameState);

    // Theme Toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Tutorial
    document.getElementById('nextTutorial').addEventListener('click', nextTutorialStep);
    document.getElementById('closeTutorial').addEventListener('click', closeTutorial);
}

// Spielmodus setzen
function setGameMode(mode) {
    gameState.isAIMode = mode === 'ai';
    gameState.isBlitzMode = mode === 'blitz';
    gameState.isPracticeMode = mode === 'practice';

    // UI aktualisieren
    document.querySelectorAll('.mode-buttons button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`).classList.add('active');

    if (gameState.isBlitzMode) {
        startTimer();
    } else {
        stopTimer();
    }

    startNewGame();
}

// Neues Spiel starten
function startNewGame() {
    gameState.currentPlayer = 'white';
    gameState.moveCount = 0;
    gameState.capturedPieces = 0;
    gameState.selectedPiece = null;
    gameState.isAITurn = false;
    
    createBoard();
    updateUI();
    playSound('gameStart');
}

// Spielzug verarbeiten
function handleSquareClick(event) {
    if (gameState.isAITurn) return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const piece = gameState.board[row][col];

    if (gameState.selectedPiece) {
        const selectedRow = parseInt(gameState.selectedPiece.dataset.row);
        const selectedCol = parseInt(gameState.selectedPiece.dataset.col);

        if (isValidMove(selectedRow, selectedCol, row, col)) {
            makeMove(selectedRow, selectedCol, row, col);
            
            if (gameState.isAIMode) {
                gameState.isAITurn = true;
                setTimeout(makeAIMove, 500);
            }
        }

        gameState.selectedPiece.classList.remove('selected');
        gameState.selectedPiece = null;
        clearHighlights();
    }
    else if (piece && isPieceOfCurrentPlayer(piece)) {
        gameState.selectedPiece = event.target;
        gameState.selectedPiece.classList.add('selected');
        highlightPossibleMoves(row, col, piece);
    }
}

// Zug ausführen
function makeMove(fromRow, fromCol, toRow, toCol) {
    const capturedPiece = gameState.board[toRow][toCol];
    gameState.board[toRow][toCol] = gameState.board[fromRow][fromCol];
    gameState.board[fromRow][fromCol] = '';
    
    const fromSquare = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
    const toSquare = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
    
    toSquare.textContent = fromSquare.textContent;
    fromSquare.textContent = '';
    
    gameState.moveCount++;
    if (capturedPiece) {
        gameState.capturedPieces++;
        playSound('capture');
    } else {
        playSound('move');
    }

    if (isCheck()) {
        playSound('check');
    }

    gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
    updateUI();
    checkAchievements();
}

// KI-Zug
function makeAIMove() {
    const difficulty = aiDifficulty.value;
    const move = findBestMove(difficulty);
    
    if (move) {
        makeMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
    }
    
    gameState.isAITurn = false;
}

// Besten Zug finden
function findBestMove(difficulty) {
    const possibleMoves = [];
    
    for (let fromRow = 0; fromRow < 8; fromRow++) {
        for (let fromCol = 0; fromCol < 8; fromCol++) {
            const piece = gameState.board[fromRow][fromCol];
            if (piece && isPieceOfCurrentPlayer(piece)) {
                for (let toRow = 0; toRow < 8; toRow++) {
                    for (let toCol = 0; toCol < 8; toCol++) {
                        if (isValidMove(fromRow, fromCol, toRow, toCol)) {
                            const move = {
                                fromRow,
                                fromCol,
                                toRow,
                                toCol,
                                piece,
                                score: evaluateMove(fromRow, fromCol, toRow, toCol, difficulty)
                            };
                            possibleMoves.push(move);
                        }
                    }
                }
            }
        }
    }

    if (possibleMoves.length === 0) return null;

    // Sortiere Züge nach Bewertung
    possibleMoves.sort((a, b) => b.score - a.score);

    // Wähle einen Zug basierend auf der Schwierigkeit
    const index = Math.floor(Math.random() * Math.min(3, possibleMoves.length));
    return possibleMoves[index];
}

// Zug bewerten
function evaluateMove(fromRow, fromCol, toRow, toCol, difficulty) {
    let score = 0;
    const piece = gameState.board[fromRow][fromCol];
    const targetPiece = gameState.board[toRow][toCol];

    // Basis-Punktwerte für Figuren
    const pieceValues = {
        '♟': 1, '♙': 1,
        '♞': 3, '♘': 3,
        '♝': 3, '♗': 3,
        '♜': 5, '♖': 5,
        '♛': 9, '♕': 9,
        '♚': 0, '♔': 0
    };

    // Punkte für Schlagen
    if (targetPiece) {
        score += pieceValues[targetPiece] * 10;
    }

    // Zusätzliche Strategien basierend auf Schwierigkeit
    if (difficulty === 'hard') {
        // Zentrumskontrolle
        if (toRow >= 3 && toRow <= 4 && toCol >= 3 && toCol <= 4) {
            score += 2;
        }
        
        // Königssicherheit
        if (piece === '♚' || piece === '♔') {
            score -= 5;
        }
    }

    return score;
}

// Spielstand speichern
function saveGameState() {
    const gameData = {
        board: gameState.board,
        currentPlayer: gameState.currentPlayer,
        moveCount: gameState.moveCount,
        capturedPieces: gameState.capturedPieces,
        timeLeft: gameState.timeLeft,
        statistics: gameState.statistics,
        achievements: Array.from(gameState.achievements)
    };

    localStorage.setItem('chessGameState', JSON.stringify(gameData));
    showNotification('Spielstand gespeichert');
}

// Spielstand laden
function loadGameState() {
    const savedState = localStorage.getItem('chessGameState');
    if (savedState) {
        const gameData = JSON.parse(savedState);
        gameState.board = gameData.board;
        gameState.currentPlayer = gameData.currentPlayer;
        gameState.moveCount = gameData.moveCount;
        gameState.capturedPieces = gameData.capturedPieces;
        gameState.timeLeft = gameData.timeLeft;
        gameState.statistics = gameData.statistics;
        gameState.achievements = new Set(gameData.achievements);

        updateBoard();
        updateUI();
        showNotification('Spielstand geladen');
    }
}

// UI aktualisieren
function updateUI() {
    status.textContent = `${gameState.currentPlayer === 'white' ? 'Weiß' : 'Schwarz'} ist am Zug`;
    moves.textContent = `Züge: ${gameState.moveCount}`;
    captured.textContent = `Geschlagene Figuren: ${gameState.capturedPieces}`;
    updateTimer();
    updateStatistics();
    updateAchievements();
}

// Timer
function startTimer() {
    if (gameState.timer) clearInterval(gameState.timer);
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimer();
        if (gameState.timeLeft <= 0) {
            endGame('timeout');
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

function updateTimer() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    timer.textContent = `Zeit: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Theme
function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
}

// Sound
function playSound(soundName) {
    const sound = sounds[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

// Achievements
function checkAchievements() {
    const newAchievements = [];

    if (gameState.moveCount === 1) {
        newAchievements.push('Erster Zug');
    }
    if (gameState.capturedPieces === 1) {
        newAchievements.push('Erste Figur geschlagen');
    }
    if (gameState.moveCount >= 50) {
        newAchievements.push('Langes Spiel');
    }

    newAchievements.forEach(achievement => {
        if (!gameState.achievements.has(achievement)) {
            gameState.achievements.add(achievement);
            showAchievement(achievement);
        }
    });
}

function showAchievement(achievement) {
    const popup = document.getElementById('achievementPopup');
    const text = document.getElementById('achievementText');
    text.textContent = achievement;
    popup.style.display = 'flex';
    playSound('achievement');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 3000);
}

// Tutorial
function startTutorial() {
    const tutorial = document.getElementById('tutorialOverlay');
    tutorial.style.display = 'flex';
    showTutorialStep(0);
}

function showTutorialStep(step) {
    const steps = [
        'Willkommen beim Schach! Klicke auf "Weiter" um zu beginnen.',
        'Wähle einen Spielmodus: 2 Spieler oder gegen die KI.',
        'Klicke auf eine Figur um sie auszuwählen.',
        'Klicke auf ein grünes Feld um die Figur zu bewegen.',
        'Viel Spaß beim Spielen!'
    ];

    document.getElementById('tutorialSteps').textContent = steps[step];
}

function nextTutorialStep() {
    const currentStep = parseInt(document.getElementById('tutorialSteps').dataset.step || 0);
    if (currentStep < 4) {
        showTutorialStep(currentStep + 1);
    } else {
        closeTutorial();
    }
}

function closeTutorial() {
    document.getElementById('tutorialOverlay').style.display = 'none';
}

// Hilfsfunktionen
function isPieceOfCurrentPlayer(piece) {
    const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
    const blackPieces = ['♚', '♛', '♜', '♝', '♞', '♟'];
    return gameState.currentPlayer === 'white' ? whitePieces.includes(piece) : blackPieces.includes(piece);
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameState.board[fromRow][fromCol];
    const targetPiece = gameState.board[toRow][toCol];

    if (targetPiece && isPieceOfCurrentPlayer(targetPiece)) {
        return false;
    }

    // Hier können weitere Schachregeln implementiert werden
    return true;
}

function highlightPossibleMoves(row, col, piece) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const targetPiece = gameState.board[r][c];
            if (!targetPiece || !isPieceOfCurrentPlayer(targetPiece)) {
                const square = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                square.classList.add('possible-move');
            }
        }
    }
}

function clearHighlights() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.classList.remove('possible-move');
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Familiennamen Interaktivität
document.addEventListener('DOMContentLoaded', function() {
    const names = document.querySelectorAll('.name');
    
    names.forEach(name => {
        name.addEventListener('click', function() {
            // Speichere den ursprünglichen Text
            const originalText = this.textContent;
            
            // Ändere den Text zu einer Nachricht
            this.textContent = '❤️';
            
            // Erstelle einen Partikeleffekt
            createHeartParticles(this);
            
            // Stelle den ursprünglichen Text nach 1000ms wieder her
            setTimeout(() => {
                this.textContent = originalText;
            }, 1000);
        });
    });
    
    // Funktion für Herz-Partikeleffekte
    function createHeartParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'heart-particle';
            particle.innerHTML = '❤️';
            document.body.appendChild(particle);
            
            // Zufällige Position und Bewegung
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1 + Math.random() * 2;
            const size = 10 + Math.random() * 10;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            particle.style.fontSize = `${size}px`;
            
            // Animation
            const animation = particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${Math.cos(angle) * 50 * velocity}px, ${Math.sin(angle) * 50 * velocity}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'cubic-bezier(0,0,0.2,1)'
            });
            
            // Entferne Partikel nach Animation
            animation.onfinish = () => particle.remove();
        }
    }
});

// Spiel starten
initializeGame(); 