import create from 'zustand';
import { ChessPiece, Move, PieceColor, Position, createPiece } from '../models/ChessPiece';
import { isValidMove, isCheck, isCheckmate } from '../utils/moveValidation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

interface GameState {
  pieces: ChessPiece[];
  currentPlayer: PieceColor;
  selectedPiece: ChessPiece | null;
  moveHistory: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  
  // Aktionen
  initializeGame: () => void;
  selectPiece: (piece: ChessPiece | null) => void;
  movePiece: (from: Position, to: Position) => void;
  undoLastMove: () => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
}

const initialBoardSetup = (): ChessPiece[] => {
  const pieces: ChessPiece[] = [];
  
  // Aufstellung der Figuren
  const setupPieces = (color: PieceColor, baseRow: number) => {
    // Bauern
    for (let i = 0; i < 8; i++) {
      pieces.push(createPiece('pawn', color, { x: i, y: color === 'white' ? 6 : 1 }));
    }
    
    // Türme
    pieces.push(createPiece('rook', color, { x: 0, y: baseRow }));
    pieces.push(createPiece('rook', color, { x: 7, y: baseRow }));
    
    // Springer
    pieces.push(createPiece('knight', color, { x: 1, y: baseRow }));
    pieces.push(createPiece('knight', color, { x: 6, y: baseRow }));
    
    // Läufer
    pieces.push(createPiece('bishop', color, { x: 2, y: baseRow }));
    pieces.push(createPiece('bishop', color, { x: 5, y: baseRow }));
    
    // Dame
    pieces.push(createPiece('queen', color, { x: 3, y: baseRow }));
    
    // König
    pieces.push(createPiece('king', color, { x: 4, y: baseRow }));
  };
  
  setupPieces('white', 7);
  setupPieces('black', 0);
  
  return pieces;
};

export const useGameStore = create<GameState>((set, get) => ({
  pieces: [],
  currentPlayer: 'white',
  selectedPiece: null,
  moveHistory: [],
  isCheck: false,
  isCheckmate: false,
  isStalemate: false,
  
  initializeGame: () => {
    set({
      pieces: initialBoardSetup(),
      currentPlayer: 'white',
      selectedPiece: null,
      moveHistory: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false
    });
  },
  
  selectPiece: (piece) => {
    const { currentPlayer } = get();
    if (!piece || piece.color === currentPlayer) {
      set({ selectedPiece: piece });
      if (piece) {
        Haptics.selectionAsync();
      }
    }
  },
  
  movePiece: (from: Position, to: Position) => {
    const { pieces, currentPlayer, moveHistory, selectedPiece } = get();
    
    if (!selectedPiece || selectedPiece.color !== currentPlayer) return;
    
    if (!isValidMove(selectedPiece, to, pieces)) return;
    
    const capturedPiece = pieces.find(p => 
      p.position.x === to.x && p.position.y === to.y
    );
    
    const newPieces = pieces.map(p => {
      if (p.id === selectedPiece.id) {
        return { ...p, position: to, hasMoved: true };
      }
      return p;
    }).filter(p => p.id !== capturedPiece?.id);
    
    const move: Move = {
      from,
      to,
      piece: selectedPiece,
      capturedPiece
    };
    
    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
    const kingPiece = newPieces.find(p => p.type === 'king' && p.color === nextPlayer);
    
    if (kingPiece) {
      const isInCheck = isCheck(kingPiece, newPieces);
      const isInCheckmate = isInCheck && isCheckmate(kingPiece, newPieces);
      
      set({
        pieces: newPieces,
        currentPlayer: nextPlayer,
        selectedPiece: null,
        moveHistory: [...moveHistory, move],
        isCheck: isInCheck,
        isCheckmate: isInCheckmate
      });
      
      if (capturedPiece) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      if (isInCheckmate) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  },
  
  undoLastMove: () => {
    const { moveHistory, pieces } = get();
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory[moveHistory.length - 1];
    const newPieces = pieces.map(p => {
      if (p.id === lastMove.piece.id) {
        return { ...p, position: lastMove.from, hasMoved: false };
      }
      return p;
    });
    
    if (lastMove.capturedPiece) {
      newPieces.push(lastMove.capturedPiece);
    }
    
    set({
      pieces: newPieces,
      currentPlayer: get().currentPlayer === 'white' ? 'black' : 'white',
      moveHistory: moveHistory.slice(0, -1),
      isCheck: false,
      isCheckmate: false
    });
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  
  saveGame: async () => {
    try {
      const gameState = {
        pieces: get().pieces,
        currentPlayer: get().currentPlayer,
        moveHistory: get().moveHistory,
        isCheck: get().isCheck,
        isCheckmate: get().isCheckmate
      };
      await AsyncStorage.setItem('chessSavedGame', JSON.stringify(gameState));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving game:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },
  
  loadGame: async () => {
    try {
      const savedGame = await AsyncStorage.getItem('chessSavedGame');
      if (savedGame) {
        const gameState = JSON.parse(savedGame);
        set({
          pieces: gameState.pieces,
          currentPlayer: gameState.currentPlayer,
          moveHistory: gameState.moveHistory,
          isCheck: gameState.isCheck,
          isCheckmate: gameState.isCheckmate,
          selectedPiece: null
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error loading game:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }
})); 