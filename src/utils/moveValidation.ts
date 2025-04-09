import { ChessPiece, Position, PieceType } from '../models/ChessPiece';

export const isValidMove = (
  piece: ChessPiece,
  to: Position,
  pieces: ChessPiece[]
): boolean => {
  const from = piece.position;
  
  // Grundlegende Positionsvalidierung
  if (to.x < 0 || to.x > 7 || to.y < 0 || to.y > 7) return false;
  
  // Prüfe, ob das Zielfeld von einer eigenen Figur besetzt ist
  const targetPiece = pieces.find(p => p.position.x === to.x && p.position.y === to.y);
  if (targetPiece && targetPiece.color === piece.color) return false;

  // Bewegungsrichtungen
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  switch (piece.type) {
    case 'pawn':
      return isValidPawnMove(piece, to, pieces);
    case 'rook':
      return isValidRookMove(from, to, pieces);
    case 'knight':
      return isValidKnightMove(absDx, absDy);
    case 'bishop':
      return isValidBishopMove(from, to, pieces);
    case 'queen':
      return isValidQueenMove(from, to, pieces);
    case 'king':
      return isValidKingMove(absDx, absDy);
    default:
      return false;
  }
};

const isValidPawnMove = (piece: ChessPiece, to: Position, pieces: ChessPiece[]): boolean => {
  const from = piece.position;
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;
  
  // Normale Bewegung vorwärts
  if (from.x === to.x && to.y === from.y + direction) {
    return !pieces.some(p => p.position.x === to.x && p.position.y === to.y);
  }
  
  // Doppelzug von Startposition
  if (from.x === to.x && from.y === startRow && to.y === from.y + 2 * direction) {
    const intermediateY = from.y + direction;
    return !pieces.some(p => 
      (p.position.x === to.x && p.position.y === to.y) ||
      (p.position.x === to.x && p.position.y === intermediateY)
    );
  }
  
  // Schlagen diagonal
  if (Math.abs(to.x - from.x) === 1 && to.y === from.y + direction) {
    return pieces.some(p => 
      p.position.x === to.x && 
      p.position.y === to.y && 
      p.color !== piece.color
    );
  }
  
  return false;
};

const isValidRookMove = (from: Position, to: Position, pieces: ChessPiece[]): boolean => {
  if (from.x !== to.x && from.y !== to.y) return false;
  
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  let x = from.x + dx;
  let y = from.y + dy;
  
  while (x !== to.x || y !== to.y) {
    if (pieces.some(p => p.position.x === x && p.position.y === y)) {
      return false;
    }
    x += dx;
    y += dy;
  }
  
  return true;
};

const isValidKnightMove = (absDx: number, absDy: number): boolean => {
  return (absDx === 2 && absDy === 1) || (absDx === 1 && absDy === 2);
};

const isValidBishopMove = (from: Position, to: Position, pieces: ChessPiece[]): boolean => {
  if (Math.abs(to.x - from.x) !== Math.abs(to.y - from.y)) return false;
  
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  let x = from.x + dx;
  let y = from.y + dy;
  
  while (x !== to.x && y !== to.y) {
    if (pieces.some(p => p.position.x === x && p.position.y === y)) {
      return false;
    }
    x += dx;
    y += dy;
  }
  
  return true;
};

const isValidQueenMove = (from: Position, to: Position, pieces: ChessPiece[]): boolean => {
  return isValidRookMove(from, to, pieces) || isValidBishopMove(from, to, pieces);
};

const isValidKingMove = (absDx: number, absDy: number): boolean => {
  return absDx <= 1 && absDy <= 1;
};

export const isCheck = (kingPiece: ChessPiece, pieces: ChessPiece[]): boolean => {
  return pieces
    .filter(p => p.color !== kingPiece.color)
    .some(p => isValidMove(p, kingPiece.position, pieces));
};

export const isCheckmate = (kingPiece: ChessPiece, pieces: ChessPiece[]): boolean => {
  if (!isCheck(kingPiece, pieces)) return false;
  
  // Alle Figuren der eigenen Farbe
  const ownPieces = pieces.filter(p => p.color === kingPiece.color);
  
  // Prüfe alle möglichen Züge für alle eigenen Figuren
  for (const piece of ownPieces) {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const testMove = { x, y };
        if (isValidMove(piece, testMove, pieces)) {
          // Simuliere den Zug
          const newPieces = pieces.map(p => ({...p}));
          const movingPiece = newPieces.find(p => p.id === piece.id)!;
          const targetPiece = newPieces.find(p => 
            p.position.x === testMove.x && p.position.y === testMove.y
          );
          
          if (targetPiece) {
            newPieces.splice(newPieces.indexOf(targetPiece), 1);
          }
          
          movingPiece.position = testMove;
          
          // Prüfe, ob der König nach dem Zug noch im Schach steht
          const newKing = newPieces.find(p => p.id === kingPiece.id)!;
          if (!isCheck(newKing, newPieces)) {
            return false;
          }
        }
      }
    }
  }
  
  return true;
}; 