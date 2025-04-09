document.addEventListener('DOMContentLoaded', () => {
    // Konstanten für häufig verwendete Werte
    const BOARD_SIZE = 8;
    const PIECES = {
        WHITE: {
            KING: 'white-king',
            QUEEN: 'white-queen',
            BISHOP: 'white-bishop',
            KNIGHT: 'white-knight',
            ROOK: 'white-rook',
            PAWN: 'white-pawn'
        },
        BLACK: {
            KING: 'black-king',
            QUEEN: 'black-queen',
            BISHOP: 'black-bishop',
            KNIGHT: 'black-knight',
            ROOK: 'black-rook',
            PAWN: 'black-pawn'
        }
    };
    
    // Spielvariablen
    let board = [];
    let selectedPiece = null;
    let currentPlayer = 'white';
    let gameMode = 'classic'; // 'classic' oder 'gregors-fluch'
    let beerCount = 0;
    let kurwaKingActive = false;
    let isKurwaKingMode = false;
    let isGregorFluchMode = false;
    
    // DOM-Elemente
    const chessboard = document.getElementById('chessboard');
    const newGameBtn = document.getElementById('new-game');
    const toggleModeBtn = document.getElementById('toggle-mode');
    const currentPlayerSpan = document.getElementById('current-player');
    const gameModeSpan = document.getElementById('game-mode');
    const beerCountSpan = document.getElementById('beer-count');
    const kurwaKingStatus = document.getElementById('kurwa-king-status');
    const gameStatus = document.getElementById('gameStatus');
    const modeSelector = document.getElementById('modeSelector');
    
    // Audio-Daten als Base64
    const AUDIO_DATA = {
        move: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFbgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAAQVuhy3WBAAAAAAAA//7UEQAAAeNjFAABpAAAAL4YkUAEHQAnxghQAQdACfGCFABB0AJ8YIUAEHQAnxghQAQdACf/////////////////////+VSuQEWALgEQD/////////////////////9bkCsBEIBcA',
        capture: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFbgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAAQVujkXoBAAAAAAAAA//7UEQAAAeNjFAABpAAAAL4YkUAEHQAnxghQAQdACfGCFABB0AJ8YIUAEHQAnxghQAQdACf/////////////////////+VSuQEWALgEQD/////////////////////9bkCsBEIBcA',
        check: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFbgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAAQVujWXmBAAAAAAAAA//7UEQAAAeNjFAABpAAAAL4YkUAEHQAnxghQAQdACfGCFABB0AJ8YIUAEHQAnxghQAQdACf/////////////////////+VSuQEWALgEQD/////////////////////9bkCsBEIBcA',
        kurwaKing: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFbgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAAQVujXXmBAAAAAAAAA//7UEQAAAeNjFAABpAAAAL4YkUAEHQAnxghQAQdACfGCFABB0AJ8YIUAEHQAnxghQAQdACf/////////////////////+VSuQEWALgEQD/////////////////////9bkCsBEIBcA',
        gregorFluch: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFbgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAAQVujYXmBAAAAAAAAA//7UEQAAAeNjFAABpAAAAL4YkUAEHQAnxghQAQdACfGCFABB0AJ8YIUAEHQAnxghQAQdACf/////////////////////+VSuQEWALgEQD/////////////////////9bkCsBEIBcA',
        gameStart: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFbgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAAQVujZXmBAAAAAAAAA//7UEQAAAeNjFAABpAAAAL4YkUAEHQAnxghQAQdACfGCFABB0AJ8YIUAEHQAnxghQAQdACf/////////////////////+VSuQEWALgEQD/////////////////////9bkCsBEIBcA',
        gameEnd: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFbgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAAQVujaXmBAAAAAAAAA//7UEQAAAeNjFAABpAAAAL4YkUAEHQAnxghQAQdACfGCFABB0AJ8YIUAEHQAnxghQAQdACf/////////////////////+VSuQEWALgEQD/////////////////////9bkCsBEIBcA'
    };
    
    // Sound-Effekte
    const sounds = {};
    Object.keys(AUDIO_DATA).forEach(key => {
        sounds[key] = new Audio(AUDIO_DATA[key]);
    });
    
    // Initialisiere das Schachbrett
    function initializeBoard() {
        board = [];
        chessboard.innerHTML = '';
        
        // Erstelle das 8x8 Schachbrett
        for (let row = 0; row < 8; row++) {
            board[row] = [];
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                square.addEventListener('click', handleSquareClick);
                chessboard.appendChild(square);
                board[row][col] = null;
            }
        }
        
        // Platziere die Figuren
        placePieces();
    }
    
    // Platziere die Schachfiguren auf dem Brett
    function placePieces() {
        // Schwarze Figuren
        placePiece(0, 0, 'black-rook');
        placePiece(0, 1, 'black-knight');
        placePiece(0, 2, 'black-bishop');
        placePiece(0, 3, 'black-queen');
        placePiece(0, 4, 'black-king');
        placePiece(0, 5, 'black-bishop');
        placePiece(0, 6, 'black-knight');
        placePiece(0, 7, 'black-rook');
        
        // Schwarze Bauern
        for (let col = 0; col < 8; col++) {
            placePiece(1, col, 'black-pawn');
        }
        
        // Weiße Figuren
        placePiece(7, 0, 'white-rook');
        placePiece(7, 1, 'white-knight');
        placePiece(7, 2, 'white-bishop');
        placePiece(7, 3, 'white-queen');
        placePiece(7, 4, 'white-king');
        placePiece(7, 5, 'white-bishop');
        placePiece(7, 6, 'white-knight');
        placePiece(7, 7, 'white-rook');
        
        // Weiße Bauern
        for (let col = 0; col < 8; col++) {
            placePiece(6, col, 'white-pawn');
        }
    }
    
    // Platziere eine Figur auf dem Brett
    function placePiece(row, col, piece) {
        const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
        square.dataset.piece = piece;
        board[row][col] = piece;
    }
    
    // Event Listener mit Throttling
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    // Optimierte Click-Handler
    const handleSquareClick = throttle((event) => {
        const square = event.target.closest('.square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        if (selectedPiece) {
            if (isValidMove(selectedPiece, row, col)) {
                movePiece(selectedPiece, row, col);
                deselectPiece();
            } else {
                deselectPiece();
            }
        } else if (board[row][col] && board[row][col].color === currentPlayer) {
            selectPiece(row, col);
        }
    }, 100);
    
    // Wähle eine Figur aus
    function selectPiece(row, col) {
        selectedPiece = board[row][col];
        const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
        square.classList.add('selected');
    }
    
    // Deselektiere die ausgewählte Figur
    function deselectPiece() {
        if (selectedPiece) {
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
        }
    }
    
    // Bewege eine Figur
    function movePiece(piece, targetRow, targetCol) {
        const targetPiece = board[targetRow][targetCol];
        if (targetPiece) {
            capturePiece(targetRow, targetCol);
        }
        
        board[targetRow][targetCol] = piece;
        board[piece.row][piece.col] = null;
        piece.row = targetRow;
        piece.col = targetCol;
        
        updateBoard();
        checkForSpecialEvents();
        switchPlayer();
    }
    
    // Prüfe, ob ein Zug gültig ist
    function isValidMove(piece, targetRow, targetCol) {
        if (targetRow < 0 || targetRow >= BOARD_SIZE || targetCol < 0 || targetCol >= BOARD_SIZE) {
            return false;
        }

        const targetPiece = board[targetRow][targetCol];
        if (targetPiece && targetPiece.color === piece.color) {
            return false;
        }

        const rowDiff = Math.abs(targetRow - piece.row);
        const colDiff = Math.abs(targetCol - piece.col);

        switch (piece.type) {
            case PIECES.WHITE.KING:
            case PIECES.BLACK.KING:
                return rowDiff <= 1 && colDiff <= 1;
                
            case PIECES.WHITE.QUEEN:
            case PIECES.BLACK.QUEEN:
                return (rowDiff === colDiff || rowDiff === 0 || colDiff === 0) && 
                       !isPieceBetween(piece.row, piece.col, targetRow, targetCol);
                
            case PIECES.WHITE.BISHOP:
            case PIECES.BLACK.BISHOP:
                return rowDiff === colDiff && !isPieceBetween(piece.row, piece.col, targetRow, targetCol);
                
            case PIECES.WHITE.KNIGHT:
            case PIECES.BLACK.KNIGHT:
                return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
                
            case PIECES.WHITE.ROOK:
            case PIECES.BLACK.ROOK:
                return (rowDiff === 0 || colDiff === 0) && 
                       !isPieceBetween(piece.row, piece.col, targetRow, targetCol);
                
            case PIECES.WHITE.PAWN:
            case PIECES.BLACK.PAWN:
                const direction = piece.color === 'white' ? -1 : 1;
                const startRow = piece.color === 'white' ? 6 : 1;
                
                if (colDiff === 0) {
                    if (targetRow === piece.row + direction && !targetPiece) {
                        return true;
                    }
                    if (piece.row === startRow && targetRow === piece.row + 2 * direction && 
                        !targetPiece && !board[piece.row + direction][piece.col]) {
                        return true;
                    }
                } else if (colDiff === 1 && targetRow === piece.row + direction) {
                    return targetPiece !== null;
                }
                return false;
        }
        return false;
    }
    
    // Prüfe, ob sich eine Figur zwischen Start- und Zielfeld befindet
    function isPieceBetween(fromRow, fromCol, toRow, toCol) {
        const rowDir = fromRow === toRow ? 0 : (toRow - fromRow) / Math.abs(toRow - fromRow);
        const colDir = fromCol === toCol ? 0 : (toCol - fromCol) / Math.abs(toCol - fromCol);
        
        let currentRow = fromRow + rowDir;
        let currentCol = fromCol + colDir;
        
        while (currentRow !== toRow || currentCol !== toCol) {
            if (board[currentRow][currentCol]) {
                return true;
            }
            currentRow += rowDir;
            currentCol += colDir;
        }
        
        return false;
    }
    
    // Optimierte Spiellogik
    function checkForSpecialEvents() {
        if (isKurwaKingMode) {
            checkForKurwaKing();
        }
        if (isGregorFluchMode) {
            checkForGregorFluch();
        }
        checkForCheck();
    }

    function checkForKurwaKing() {
        const kings = findPieces(PIECES.WHITE.KING).concat(findPieces(PIECES.BLACK.KING));
        kings.forEach(king => {
            if (isSurroundedByPawns(king)) {
                showKurwaKingAnimation(king);
            }
        });
    }

    function checkForGregorFluch() {
        const pieces = getAllPieces();
        pieces.forEach(piece => {
            if (Math.random() < 0.1) {
                showGregorFluchAnimation(piece);
            }
        });
    }

    function checkForCheck() {
        const king = findKing(currentPlayer);
        if (isKingInCheck(king)) {
            showCheckAnimation(king);
            sounds.check.play();
        }
    }

    // Optimierte Hilfsfunktionen
    function findPieces(type) {
        return board.flat().filter(piece => piece && piece.type === type);
    }

    function findKing(color) {
        return board.flat().find(piece => 
            piece && piece.type === (color === 'white' ? PIECES.WHITE.KING : PIECES.BLACK.KING)
        );
    }

    function isSurroundedByPawns(king) {
        const directions = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
        return directions.every(([row, col]) => {
            const targetRow = king.row + row;
            const targetCol = king.col + col;
            if (targetRow < 0 || targetRow >= BOARD_SIZE || targetCol < 0 || targetCol >= BOARD_SIZE) {
                return false;
            }
            const piece = board[targetRow][targetCol];
            return piece && piece.type.includes('pawn');
        });
    }

    function isKingInCheck(king) {
        const opponentPieces = getAllPieces().filter(piece => piece.color !== king.color);
        return opponentPieces.some(piece => isValidMove(piece, king.row, king.col));
    }

    // Optimierte Animationen
    function showKurwaKingAnimation(king) {
        const square = document.querySelector(`[data-row="${king.row}"][data-col="${king.col}"]`);
        square.classList.add('kurwa-king');
        sounds.kurwaKing.play();
        setTimeout(() => square.classList.remove('kurwa-king'), 1000);
    }

    function showGregorFluchAnimation(piece) {
        const square = document.querySelector(`[data-row="${piece.row}"][data-col="${piece.col}"]`);
        square.classList.add('gregor-fluch');
        sounds.gregorFluch.play();
        setTimeout(() => square.classList.remove('gregor-fluch'), 1000);
    }

    function showCheckAnimation(king) {
        const square = document.querySelector(`[data-row="${king.row}"][data-col="${king.col}"]`);
        square.classList.add('check');
        setTimeout(() => square.classList.remove('check'), 1000);
    }

    // Optimierte Spielfortschritt
    function switchPlayer() {
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        updateGameStatus();
    }

    function updateGameStatus() {
        gameStatus.textContent = `Aktueller Spieler: ${currentPlayer === 'white' ? 'Weiß' : 'Schwarz'}`;
    }

    // Starte ein neues Spiel
    function startNewGame() {
        sounds.gameStart.play();
        currentPlayer = 'white';
        beerCount = 0;
        kurwaKingActive = false;
        document.body.classList.remove('kurwa-mode');
        initializeBoard();
        updateGameStatus();
    }
    
    // Wechsle den Spielmodus
    function toggleGameMode() {
        gameMode = gameMode === 'classic' ? 'gregors-fluch' : 'classic';
        gameModeSpan.textContent = gameMode === 'classic' ? 'Klassisch' : 'Gregor\'s Fluch';
    }
    
    // Event-Listener
    newGameBtn.addEventListener('click', startNewGame);
    toggleModeBtn.addEventListener('click', toggleGameMode);
    modeSelector.addEventListener('change', (e) => {
        gameMode = e.target.value;
        isKurwaKingMode = gameMode === 'kurwa-king';
        isGregorFluchMode = gameMode === 'gregor-fluch';
        startNewGame();
    });
    
    // Menü-Button Event Listener
    document.querySelectorAll('.menu-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const action = event.target.textContent.trim();
            switch(action) {
                case 'Neues Spiel':
                    initializeBoard();
                    break;
                case 'Laden':
                    // Implementiere Laden-Funktion
                    break;
                case 'Speichern':
                    // Implementiere Speichern-Funktion
                    break;
                case 'Einstellungen':
                    // Implementiere Einstellungen-Funktion
                    break;
                case '🍺 Bierklingel':
                    // Implementiere Bierklingel-Funktion
                    alert('Prost! 🍺');
                    break;
            }
        });
    });
    
    // Spiel starten
    startNewGame();
}); 