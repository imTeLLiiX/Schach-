export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type Position = { x: number; y: number };

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved: boolean;
  id: string;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  isPromotion?: boolean;
  promotedTo?: PieceType;
}

export const createPiece = (
  type: PieceType,
  color: PieceColor,
  position: Position
): ChessPiece => ({
  type,
  color,
  position,
  hasMoved: false,
  id: `${color}-${type}-${position.x}-${position.y}`
});

export const isValidPosition = (position: Position): boolean => {
  return position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8;
}; 